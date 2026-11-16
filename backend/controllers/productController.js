const { ObjectId } = require('mongodb');
const Products = require('../models/products');
const StoreListings = require('../models/storeListings');
const PriceHistory = require('../models/priceHistory');
const urlParserService = require('../services/urlParserService');
const productMatcherService = require('../services/productMatcherService');
const { validateStoreProductUrl } = require('../utils/urlValidator');

const productController = {
  async compareUrl(req, res, next) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a shopping product URL to compare.'
        });
      }

      const parsedResult = urlParserService.parseUrl(url);
      if (!parsedResult.isValid) {
        return res.status(400).json({
          success: false,
          message: parsedResult.error
        });
      }

      const matchResult = await productMatcherService.matchProductFromUrl(parsedResult);
      return res.json(matchResult);
    } catch (err) {
      next(err);
    }
  },

  async identifyUrl(req, res, next) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a shopping product URL.'
        });
      }

      const parsedResult = urlParserService.parseUrl(url);
      if (!parsedResult.isValid) {
        return res.status(400).json({
          success: false,
          message: parsedResult.error
        });
      }

      return res.json({
        success: true,
        identification: {
          store: parsedResult.storeName,
          storeSlug: parsedResult.storeSlug,
          extractedId: parsedResult.extractedId,
          extractedSlug: parsedResult.extractedSlug,
          attributes: parsedResult.attributes,
          cleanUrl: parsedResult.cleanUrl
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductComparison(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format.'
        });
      }

      const product = await Products.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const rawListings = await StoreListings.findByProductId(id);
      const listings = rawListings.map(l => {
        const candidateUrl = l.productUrl || (product.verifiedUrls && product.verifiedUrls[l.store?.storeSlug]) || null;
        const validation = validateStoreProductUrl(l.store?.storeSlug, candidateUrl);
        const isExact = validation.isValid && validation.isExactProductUrl;
        return {
          ...l,
          productUrl: isExact ? validation.canonicalUrl : null,
          storeProductId: isExact ? validation.storeProductId : (l.storeProductId || null),
          isExactProductUrl: isExact,
          urlType: isExact ? 'exact_product' : 'unavailable',
          urlVerifiedAt: isExact ? (l.urlVerifiedAt || l.lastUpdated || new Date()) : null
        };
      });

      const prices = listings.map(l => l.currentPrice);
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const priceDifference = highestPrice - lowestPrice;

      return res.json({
        success: true,
        product,
        listings,
        stats: {
          lowestPrice,
          highestPrice,
          priceDifference,
          totalListings: listings.length
        }
      });
    } catch (err) {
      next(err);
    }
  },
  async getProducts(req, res, next) {
    try {
      const {
        q,
        query,
        category,
        brand,
        minPrice,
        maxPrice,
        sort = 'popularity',
        page = 1,
        limit = 12
      } = req.query;

      const searchQuery = q || query || '';
      const result = await Products.search({
        query: searchQuery,
        category,
        brand,
        minPrice,
        maxPrice,
        sortBy: sort,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 12
      });

      return res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format.'
        });
      }

      const product = await Products.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const rawListings = await StoreListings.findByProductId(id);
      const listings = rawListings.map(l => {
        const candidateUrl = l.productUrl || (product.verifiedUrls && product.verifiedUrls[l.store?.storeSlug]) || null;
        const validation = validateStoreProductUrl(l.store?.storeSlug, candidateUrl);
        const isExact = validation.isValid && validation.isExactProductUrl;
        return {
          ...l,
          productUrl: isExact ? validation.canonicalUrl : null,
          storeProductId: isExact ? validation.storeProductId : (l.storeProductId || null),
          isExactProductUrl: isExact,
          urlType: isExact ? 'exact_product' : 'unavailable',
          urlVerifiedAt: isExact ? (l.urlVerifiedAt || l.lastUpdated || new Date()) : null
        };
      });
      const priceSummary = await PriceHistory.getSummary(id);

      const lowestPrice = listings.length > 0 ? listings[0].currentPrice : null;
      const highestPrice = listings.length > 0 ? Math.max(...listings.map(l => l.currentPrice)) : null;
      const originalPrice = listings.length > 0 ? Math.max(...listings.map(l => l.originalPrice || l.currentPrice)) : null;

      return res.json({
        success: true,
        product: {
          ...product,
          lowestPrice,
          highestPrice,
          originalPrice,
          listings,
          priceSummary
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async searchSuggestions(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length === 0) {
        return res.json({ success: true, suggestions: [] });
      }

      const suggestions = await Products.getSuggestions(q);
      return res.json({
        success: true,
        suggestions
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await Products.getCategories();
      return res.json({
        success: true,
        categories
      });
    } catch (err) {
      next(err);
    }
  },

  async getBrands(req, res, next) {
    try {
      const brands = await Products.getBrands();
      return res.json({
        success: true,
        brands
      });
    } catch (err) {
      next(err);
    }
  },

  async getDeals(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 8;
      // Fetch products sorted by discount percentage
      const result = await Products.search({
        sortBy: 'discount',
        limit
      });

      return res.json({
        success: true,
        deals: result.products
      });
    } catch (err) {
      next(err);
    }
  },

  async getTrending(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 8;
      const result = await Products.search({
        sortBy: 'popularity',
        limit
      });

      return res.json({
        success: true,
        trending: result.products
      });
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const { name, brand, category, description, image, modelNumber, specifications } = req.body;

      if (!name || !brand || !category) {
        return res.status(400).json({
          success: false,
          message: 'Product name, brand and category are required.'
        });
      }

      const product = await Products.create({
        name,
        brand,
        category,
        description,
        image,
        modelNumber,
        specifications
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const updated = await Products.update(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      return res.json({
        success: true,
        message: 'Product updated successfully.',
        product: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const success = await Products.delete(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      // Cleanup listings, history, watchlists, alerts
      await StoreListings.col().deleteMany({ productId: new ObjectId(id) });
      await PriceHistory.col().deleteMany({ productId: new ObjectId(id) });

      return res.json({
        success: true,
        message: 'Product and associated data deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = productController;
