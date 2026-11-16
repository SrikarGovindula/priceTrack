// backend/services/productMatcherService.js
// Intelligent variant-aware product matcher across e-commerce platforms for PriceTrack
// STRICT: Only verified exact product detail page URLs. Zero search-query or homepage redirects.

const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const { validateStoreProductUrl } = require('../utils/urlValidator');

const productMatcherService = {
  /**
   * Find matching product and cross-store listings for parsed URL info
   * @param {Object} parsedUrlInfo output from urlParserService.parseUrl
   * @returns {Object} comparison result or fallback
   */
  async matchProductFromUrl(parsedUrlInfo) {
    const db = getDB();
    const { cleanUrl, storeSlug, extractedId, attributes, textClues, originalUrl } = parsedUrlInfo;

    // STEP 1: Direct match in storeListings by exact or clean URL
    const directListing = await db.collection('storeListings').findOne({
      $or: [
        { productUrl: originalUrl },
        { productUrl: cleanUrl },
        { productUrl: { $regex: cleanUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      ]
    });

    if (directListing && directListing.productId) {
      const product = await db.collection('products').findOne({ _id: new ObjectId(directListing.productId) });
      if (product) {
        const comparison = await this.buildComparisonResult(product, parsedUrlInfo, 100, 'Direct Verified Store Listing Match');
        return {
          success: true,
          matchFound: true,
          ...comparison
        };
      }
    }

    // STEP 2: Match by Product ID / ASIN / Model Identifier if present
    if (extractedId) {
      // 2A: Check storeListings for this store having productUrl containing the extractedId
      const idListing = await db.collection('storeListings').findOne({
        productUrl: { $regex: extractedId, $options: 'i' }
      });

      if (idListing && idListing.productId) {
        const product = await db.collection('products').findOne({ _id: new ObjectId(idListing.productId) });
        if (product) {
          // Ensure detected brand doesn't conflict
          const brandMismatch = attributes.brand && product.brand && 
            attributes.brand.toLowerCase() !== product.brand.toLowerCase();
          
          if (!brandMismatch) {
            const comparison = await this.buildComparisonResult(product, parsedUrlInfo, 99, `Verified Product Identifier (${extractedId}) Match`);
            return {
              success: true,
              matchFound: true,
              ...comparison
            };
          }
        }
      }

      // 2B: Check products collection directly
      const asinProduct = await db.collection('products').findOne({
        $or: [
          { modelNumber: extractedId },
          { [`verifiedUrls.${storeSlug}`]: { $regex: extractedId, $options: 'i' } },
          { name: { $regex: extractedId, $options: 'i' } }
        ]
      });

      if (asinProduct) {
        const brandMismatch = attributes.brand && asinProduct.brand && 
          attributes.brand.toLowerCase() !== asinProduct.brand.toLowerCase();

        if (!brandMismatch) {
          const comparison = await this.buildComparisonResult(asinProduct, parsedUrlInfo, 98, `Verified Product Identifier (${extractedId}) Match`);
          return {
            success: true,
            matchFound: true,
            ...comparison
          };
        }
      }
    }

    // STEP 3: Intelligent Specification & Variant-Aware Catalog Search
    const allProducts = await db.collection('products').find({}).toArray();

    let bestMatch = null;
    let highestScore = 0;
    let matchReason = '';

    for (const candidate of allProducts) {
      const scoreResult = this.evaluateCandidateScore(candidate, attributes, textClues);

      if (scoreResult.score > highestScore) {
        highestScore = scoreResult.score;
        bestMatch = candidate;
        matchReason = scoreResult.reason;
      }
    }

    // Require at least 70% confidence score to prevent matching unrelated products
    if (bestMatch && highestScore >= 70) {
      const comparison = await this.buildComparisonResult(bestMatch, parsedUrlInfo, highestScore, matchReason);
      return {
        success: true,
        matchFound: true,
        ...comparison
      };
    }

    // STEP 4: Fallback - No reliable equivalent product found
    const suggestedKeywords = attributes.brand 
      ? `${attributes.brand} ${attributes.keywords.slice(0, 3).join(' ')}`
      : attributes.keywords.slice(0, 4).join(' ');

    return {
      success: true,
      matchFound: false,
      message: 'No exact or variant-matching product found in our catalog for this URL.',
      sourceStore: parsedUrlInfo.storeName,
      sourceUrl: parsedUrlInfo.originalUrl,
      suggestedQuery: suggestedKeywords.trim(),
      reason: highestScore > 0 
        ? `Closest match scored only ${highestScore}% (below 70% threshold required for variant-level certainty).` 
        : 'Brand, model, or storage specifications could not be matched with high confidence.'
    };
  },

  /**
   * Score candidate product against parsed attributes and keywords
   */
  evaluateCandidateScore(candidate, attributes, textClues) {
    let score = 0;
    const reasons = [];
    const candidateName = candidate.name.toLowerCase();
    const candidateSpecs = candidate.specifications || {};
    const candidateSpecsStr = JSON.stringify(candidateSpecs).toLowerCase();
    const candidateSpecsNorm = candidateSpecsStr.replace(/\s+/g, '');
    const inputCluesLower = textClues.toLowerCase();

    // 1. BRAND CHECK (Crucial Gate)
    if (attributes.brand) {
      const candBrand = (candidate.brand || '').toLowerCase();
      const attrBrand = attributes.brand.toLowerCase();

      if (candBrand !== attrBrand) {
        return { score: 0, reason: 'Brand mismatch' };
      }
      score += 25;
      reasons.push('Brand Match');
    }

    // 2. MODEL SERIES / FAMILY IDENTIFIER CHECK (Crucial Gate)
    const inputModelMatches = inputCluesLower.match(/\b(s\d{1,2}|a\d{1,2}|note\s*\d+|pixel\s*\d+|iphone\s*\d+|m[1-4]|rtx\s*\d{4}|xm[45]|wh\s*\d+|qc\s*\d+|g\d{3}|series\s*\d)\b/gi) || [];
    
    for (const rawToken of inputModelMatches) {
      const token = rawToken.replace(/\s+/g, '').toLowerCase();
      const candHasToken = candidateName.replace(/\s+/g, '').includes(token) || 
                           (candidate.modelNumber && candidate.modelNumber.toLowerCase().includes(token));
      
      if (!candHasToken) {
        return {
          score: 0,
          reason: `Model Series Conflict: Input mentions "${rawToken}", which does not match "${candidate.name}"`
        };
      } else {
        score += 20;
        reasons.push(`Model Series "${rawToken.toUpperCase()}" Matched`);
      }
    }

    // 3. MODEL TIER CHECK (e.g. Pro, Ultra, Max, Plus, Mini, Air)
    const tierTokens = ['ultra', 'pro', 'max', 'plus', 'mini'];
    for (const tier of tierTokens) {
      const inputHasTier = new RegExp(`\\b${tier}\\b`, 'i').test(inputCluesLower);
      const candHasTier = new RegExp(`\\b${tier}\\b`, 'i').test(candidateName);

      if (inputHasTier && !candHasTier) {
        return {
          score: 0,
          reason: `Model Tier Conflict: Input specifies "${tier.toUpperCase()}", but candidate is not ${tier.toUpperCase()}`
        };
      } else if (!inputHasTier && candHasTier && inputModelMatches.length > 0) {
        return {
          score: 0,
          reason: `Model Tier Conflict: Input is base model, while candidate is "${tier.toUpperCase()}"`
        };
      } else if (inputHasTier && candHasTier) {
        score += 15;
        reasons.push(`Tier "${tier.toUpperCase()}" Matched`);
      }
    }

    // 4. STORAGE VARIANT CHECK (Strict Criterion: e.g. 128GB vs 256GB vs 512GB)
    if (attributes.storage) {
      const targetStorage = attributes.storage.toUpperCase();
      const targetStorageNorm = targetStorage.toLowerCase();
      
      const candHasStorage = candidateName.replace(/\s+/g, '').includes(targetStorageNorm) || 
                             candidateSpecsNorm.includes(targetStorageNorm);

      if (candHasStorage) {
        score += 25;
        reasons.push(`Exact Storage Match (${targetStorage})`);
      } else {
        const otherStorageSizes = ['32gb', '64gb', '128gb', '256gb', '512gb', '1tb', '2tb'];
        const candStorage = otherStorageSizes.find(s => 
          candidateName.replace(/\s+/g, '').includes(s) || candidateSpecsNorm.includes(s)
        );

        if (candStorage && candStorage !== targetStorageNorm) {
          return {
            score: 0,
            reason: `Storage Variant Conflict: Input specifies ${targetStorage}, but candidate is ${candStorage.toUpperCase()}`
          };
        }
      }
    }

    // 5. RAM VARIANT CHECK (Strict Criterion: e.g. 8GB vs 16GB)
    if (attributes.ram) {
      const targetRam = attributes.ram.toUpperCase();
      const targetRamNorm = targetRam.toLowerCase();

      const candHasRam = candidateName.replace(/\s+/g, '').includes(targetRamNorm) || 
                         candidateSpecsNorm.includes(targetRamNorm);

      if (candHasRam) {
        score += 15;
        reasons.push(`RAM Match (${targetRam})`);
      } else {
        const otherRamSizes = ['4gb', '6gb', '8gb', '12gb', '16gb', '24gb', '32gb'];
        const candRam = otherRamSizes.find(r => 
          candidateName.replace(/\s+/g, '').includes(r) || candidateSpecsNorm.includes(r)
        );

        if (candRam && candRam !== targetRamNorm) {
          return {
            score: 0,
            reason: `RAM Variant Conflict: Input specifies ${targetRam}, but candidate is ${candRam.toUpperCase()}`
          };
        }
      }
    }

    // 6. MODEL NUMBER CHECK (Compact alphanumeric matching, e.g. WH1000XM5)
    if (candidate.modelNumber) {
      const compactedCandModel = candidate.modelNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
      const compactedInput = inputCluesLower.replace(/[^a-z0-9]/g, '');
      if (compactedCandModel && compactedInput.includes(compactedCandModel)) {
        score += 35;
        reasons.push(`Model Identifier Matched (${candidate.modelNumber})`);
      }
    }

    // 7. KEYWORD OVERLAP CHECK
    const candidateTokens = candidateName
      .split(/[^a-z0-9]+/)
      .filter(t => t.length >= 2);

    let matchedKeywordCount = 0;
    const keywords = attributes.keywords || [];

    for (const kw of keywords) {
      if (candidateTokens.includes(kw) || candidateName.includes(kw)) {
        matchedKeywordCount++;
      }
    }

    if (keywords.length > 0) {
      const keywordRatio = Math.min(1, matchedKeywordCount / Math.min(keywords.length, 5));
      const keywordScore = Math.round(keywordRatio * 20);
      score += keywordScore;
      if (keywordScore > 10) {
        reasons.push('Key Model Terms Matched');
      }
    }

    return {
      score: Math.min(score, 99),
      reason: reasons.join(' • ') || 'General Specification Match'
    };
  },

  /**
   * Build complete cross-store comparison response for identified product
   * STRICT REQUIREMENT: Only exact product detail page URLs. Never generate search URLs.
   */
  async buildComparisonResult(product, parsedUrlInfo, confidence, matchReason) {
    const db = getDB();

    // Fetch all store listings for this product
    const rawListings = await db.collection('storeListings').aggregate([
      { $match: { productId: product._id } },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store'
        }
      },
      { $unwind: '$store' },
      { $sort: { currentPrice: 1 } }
    ]).toArray();

    // Transform listings: validate exact product detail URLs and discard any search URLs
    const listings = rawListings.map(l => {
      const isSourceStore = l.store.storeSlug === parsedUrlInfo.storeSlug;

      // Candidate URL: for source store, use the user's pasted URL; for other stores, use listing's productUrl or product.verifiedUrls
      const candidateUrl = isSourceStore
        ? parsedUrlInfo.originalUrl
        : (l.productUrl || (product.verifiedUrls && product.verifiedUrls[l.store.storeSlug]) || null);

      // Perform strict store-specific URL validation
      const validation = validateStoreProductUrl(l.store.storeSlug, candidateUrl);

      const isExactProductUrl = validation.isValid && validation.isExactProductUrl;
      const productUrl = isExactProductUrl ? validation.canonicalUrl : null;
      const storeProductId = isExactProductUrl ? validation.storeProductId : (l.storeProductId || null);
      const urlType = isExactProductUrl ? 'exact_product' : 'unavailable';

      return {
        _id: l._id,
        storeId: l.storeId,
        store: {
          storeName: l.store.storeName,
          storeSlug: l.store.storeSlug,
          storeLogo: l.store.storeLogo,
          website: l.store.website
        },
        productUrl,
        storeProductId,
        urlType,
        isExactProductUrl,
        urlVerifiedAt: isExactProductUrl ? (l.urlVerifiedAt || new Date()) : null,
        currentPrice: l.currentPrice,
        originalPrice: l.originalPrice || Math.round(l.currentPrice * 1.15),
        availability: l.availability || 'In Stock',
        deliveryInformation: l.deliveryInformation || 'Standard delivery in 2-4 days',
        isSourceStore,
        sourceType: l.sourceType || 'demo_feed',
        lastUpdated: l.lastUpdated || new Date()
      };
    });

    // If source store was NOT in the database listings for this product, add it if user provided an exact URL
    const hasSourceStore = listings.some(l => l.store.storeSlug === parsedUrlInfo.storeSlug);
    if (!hasSourceStore) {
      const sourceStoreObj = await db.collection('stores').findOne({ storeSlug: parsedUrlInfo.storeSlug });
      if (sourceStoreObj) {
        const validation = validateStoreProductUrl(parsedUrlInfo.storeSlug, parsedUrlInfo.originalUrl);
        const isExactProductUrl = validation.isValid && validation.isExactProductUrl;
        const simPrice = product.basePrice || 24990;

        listings.push({
          _id: new ObjectId(),
          storeId: sourceStoreObj._id,
          store: {
            storeName: sourceStoreObj.storeName,
            storeSlug: sourceStoreObj.storeSlug,
            storeLogo: sourceStoreObj.storeLogo,
            website: sourceStoreObj.website
          },
          productUrl: isExactProductUrl ? validation.canonicalUrl : null,
          storeProductId: isExactProductUrl ? validation.storeProductId : null,
          urlType: isExactProductUrl ? 'exact_product' : 'unavailable',
          isExactProductUrl,
          urlVerifiedAt: isExactProductUrl ? new Date() : null,
          currentPrice: simPrice,
          originalPrice: Math.round(simPrice * 1.15),
          availability: 'In Stock',
          deliveryInformation: 'Standard delivery in 2-4 days',
          isSourceStore: true,
          sourceType: 'user_url',
          lastUpdated: new Date()
        });
      }
    }

    // Re-sort by price ascending
    listings.sort((a, b) => a.currentPrice - b.currentPrice);

    const prices = listings.map(l => l.currentPrice);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice || 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : lowestPrice;
    const priceDifference = highestPrice - lowestPrice;
    const bestListing = listings.find(l => l.currentPrice === lowestPrice) || listings[0];
    const sourceStoreListing = listings.find(l => l.store.storeSlug === parsedUrlInfo.storeSlug);

    return {
      product: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        modelNumber: product.modelNumber,
        image: product.image,
        description: product.description,
        specifications: product.specifications,
        lowestPrice,
        highestPrice,
        originalPrice: product.originalPrice || Math.round(lowestPrice * 1.15)
      },
      listings,
      sourceStore: {
        storeSlug: parsedUrlInfo.storeSlug,
        storeName: parsedUrlInfo.storeName,
        inputUrl: parsedUrlInfo.originalUrl,
        isSearchUrl: parsedUrlInfo.isSearchUrl,
        currentPrice: sourceStoreListing ? sourceStoreListing.currentPrice : null
      },
      confidenceScore: confidence,
      matchConfidence: confidence >= 95 ? 'High (Exact Variant)' : confidence >= 80 ? 'Good Match' : 'Probable Match',
      matchReason,
      stats: {
        lowestPrice,
        highestPrice,
        priceDifference,
        bestStoreName: bestListing ? bestListing.store.storeName : null,
        totalStoresCompared: listings.length,
        isDemoData: true
      }
    };
  }
};

module.exports = productMatcherService;
