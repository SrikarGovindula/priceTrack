// backend/utils/urlValidator.js
// Strict store-specific exact product detail URL validation for PriceTrack
// Rejects all search-query URLs, homepages, category pages, and invalid URLs

/**
 * Validate Amazon India product detail URL
 * Supported formats:
 * - https://www.amazon.in/dp/ASIN
 * - https://www.amazon.in/PRODUCT-NAME/dp/ASIN
 * - https://www.amazon.in/gp/product/ASIN
 * - https://www.amazon.in/gp/aw/d/ASIN
 */
function validateAmazonProductUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, reason: 'URL string is empty or missing.' };
  }

  try {
    const parsed = new URL(url.trim());

    // 1. HTTPS only
    if (parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Must use secure HTTPS protocol.' };
    }

    // 2. Domain check
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'amazon.in' && hostname !== 'www.amazon.in' && hostname !== 'amzn.in') {
      return { isValid: false, reason: `Invalid domain "${hostname}". Expected amazon.in.` };
    }

    // 3. Reject search URLs and generic pages
    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname === '') {
      return { isValid: false, reason: 'URL is an Amazon homepage, not a product detail page.' };
    }

    if (
      pathname === '/s' ||
      pathname.startsWith('/s/') ||
      parsed.searchParams.has('k') ||
      pathname.includes('/bestsellers') ||
      pathname.includes('/gp/help') ||
      pathname.includes('/gp/cart')
    ) {
      return { isValid: false, reason: 'Search-query or generic Amazon pages are not permitted.' };
    }

    // 4. Extract 10-character ASIN
    const asinMatch = pathname.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|\/d\/)([A-Z0-9]{10})/i);
    let asin = asinMatch ? asinMatch[1].toUpperCase() : null;

    if (!asin) {
      // Check query param pd_rd_i or asin if explicit
      const qAsin = parsed.searchParams.get('pd_rd_i') || parsed.searchParams.get('asin');
      if (qAsin && /^[A-Z0-9]{10}$/i.test(qAsin)) {
        asin = qAsin.toUpperCase();
      }
    }

    if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
      return { isValid: false, reason: 'Could not extract a valid 10-character ASIN from Amazon URL.' };
    }

    return {
      isValid: true,
      isExactProductUrl: true,
      storeSlug: 'amazon',
      storeProductId: asin,
      canonicalUrl: `https://www.amazon.in/dp/${asin}`
    };
  } catch (err) {
    return { isValid: false, reason: 'Malformed URL: ' + err.message };
  }
}

/**
 * Validate Flipkart product detail URL
 * Supported formats:
 * - https://www.flipkart.com/slug/p/itm...
 * - https://www.flipkart.com/p/itm...
 * - https://www.flipkart.com/slug/p/itm...?pid=...
 */
function validateFlipkartProductUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, reason: 'URL string is empty or missing.' };
  }

  try {
    const parsed = new URL(url.trim());

    if (parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Must use secure HTTPS protocol.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'flipkart.com' && hostname !== 'www.flipkart.com' && hostname !== 'dl.flipkart.com') {
      return { isValid: false, reason: `Invalid domain "${hostname}". Expected flipkart.com.` };
    }

    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname === '') {
      return { isValid: false, reason: 'URL is a Flipkart homepage, not a product detail page.' };
    }

    if (pathname.includes('/search') || parsed.searchParams.has('q') || pathname.includes('/account')) {
      return { isValid: false, reason: 'Search-query or account Flipkart pages are not permitted.' };
    }

    // Extract item ID (e.g. itme91724497e5ea or pid)
    const fsnMatch = pathname.match(/\/p\/(itm[a-zA-Z0-9]+)/i);
    const pid = parsed.searchParams.get('pid');
    const storeProductId = fsnMatch ? fsnMatch[1] : (pid || null);

    if (!fsnMatch && !pid) {
      return { isValid: false, reason: 'Flipkart URL lacks a valid item identifier (/p/itm... or ?pid=...).' };
    }

    // Canonical / clean URL: keep product path, strip search & tracking params
    const cleanUrlObj = new URL(parsed.toString());
    const trackingParams = ['otracker', 'otracker1', 'marketplace', 'store', 'srno', 'q'];
    trackingParams.forEach(p => cleanUrlObj.searchParams.delete(p));

    return {
      isValid: true,
      isExactProductUrl: true,
      storeSlug: 'flipkart',
      storeProductId,
      canonicalUrl: cleanUrlObj.toString()
    };
  } catch (err) {
    return { isValid: false, reason: 'Malformed URL: ' + err.message };
  }
}

/**
 * Validate Myntra product detail URL
 * Supported formats:
 * - https://www.myntra.com/category/brand/slug/numericId/buy
 * - https://www.myntra.com/slug/numericId/buy
 * - https://www.myntra.com/numericId
 */
function validateMyntraProductUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, reason: 'URL string is empty or missing.' };
  }

  try {
    const parsed = new URL(url.trim());

    if (parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Must use secure HTTPS protocol.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'myntra.com' && hostname !== 'www.myntra.com') {
      return { isValid: false, reason: `Invalid domain "${hostname}". Expected myntra.com.` };
    }

    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname === '') {
      return { isValid: false, reason: 'URL is a Myntra homepage, not a product detail page.' };
    }

    if (pathname.includes('/dsearch') || pathname.includes('/search') || parsed.searchParams.has('rawQuery')) {
      return { isValid: false, reason: 'Search-query Myntra pages are not permitted.' };
    }

    const idMatch = pathname.match(/\/(\d{5,12})(?:\/buy)?(?:\/|\?|$)/i);
    if (!idMatch) {
      return { isValid: false, reason: 'Myntra URL lacks a valid numeric style identifier.' };
    }

    const styleId = idMatch[1];
    return {
      isValid: true,
      isExactProductUrl: true,
      storeSlug: 'myntra',
      storeProductId: styleId,
      canonicalUrl: parsed.origin + parsed.pathname
    };
  } catch (err) {
    return { isValid: false, reason: 'Malformed URL: ' + err.message };
  }
}

/**
 * Validate Croma product detail URL
 * Supported formats:
 * - https://www.croma.com/slug/p/numericCode
 * - https://www.croma.com/slug-/p/numericCode
 */
function validateCromaProductUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, reason: 'URL string is empty or missing.' };
  }

  try {
    const parsed = new URL(url.trim());

    if (parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Must use secure HTTPS protocol.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'croma.com' && hostname !== 'www.croma.com') {
      return { isValid: false, reason: `Invalid domain "${hostname}". Expected croma.com.` };
    }

    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname === '') {
      return { isValid: false, reason: 'URL is a Croma homepage, not a product detail page.' };
    }

    if (pathname.includes('/searchB') || pathname.includes('/search') || parsed.searchParams.has('text') || parsed.searchParams.has('q')) {
      return { isValid: false, reason: 'Search-query Croma pages are not permitted.' };
    }

    const pMatch = pathname.match(/\/p\/(\d{5,10})/i) || pathname.match(/-(\d{5,10})(?:\?|$)/);
    if (!pMatch) {
      return { isValid: false, reason: 'Croma URL lacks a valid numeric product code (/p/12345).' };
    }

    const productCode = pMatch[1];
    return {
      isValid: true,
      isExactProductUrl: true,
      storeSlug: 'croma',
      storeProductId: productCode,
      canonicalUrl: parsed.origin + parsed.pathname
    };
  } catch (err) {
    return { isValid: false, reason: 'Malformed URL: ' + err.message };
  }
}

/**
 * Validate Reliance Digital product detail URL
 * Supported formats:
 * - https://www.reliancedigital.in/slug/p/numericId
 * - https://www.reliancedigital.in/p/numericId
 */
function validateRelianceProductUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, reason: 'URL string is empty or missing.' };
  }

  try {
    const parsed = new URL(url.trim());

    if (parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Must use secure HTTPS protocol.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'reliancedigital.in' && hostname !== 'www.reliancedigital.in') {
      return { isValid: false, reason: `Invalid domain "${hostname}". Expected reliancedigital.in.` };
    }

    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname === '') {
      return { isValid: false, reason: 'URL is a Reliance Digital homepage, not a product detail page.' };
    }

    if (pathname.includes('/search') || parsed.searchParams.has('q')) {
      return { isValid: false, reason: 'Search-query Reliance Digital pages are not permitted.' };
    }

    const pMatch = pathname.match(/\/p\/(\d{6,12})/i);
    if (!pMatch) {
      return { isValid: false, reason: 'Reliance Digital URL lacks a valid numeric item code (/p/49xxxxxxx).' };
    }

    const itemCode = pMatch[1];
    return {
      isValid: true,
      isExactProductUrl: true,
      storeSlug: 'reliance-digital',
      storeProductId: itemCode,
      canonicalUrl: parsed.origin + parsed.pathname
    };
  } catch (err) {
    return { isValid: false, reason: 'Malformed URL: ' + err.message };
  }
}

/**
 * Dispatcher to validate store product detail URL
 * @param {string} storeSlug 'amazon' | 'flipkart' | 'myntra' | 'croma' | 'reliance-digital'
 * @param {string} url
 * @returns {Object} { isValid, isExactProductUrl, storeSlug, storeProductId, canonicalUrl, reason }
 */
function validateStoreProductUrl(storeSlug, url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, isExactProductUrl: false, canonicalUrl: null, storeProductId: null, reason: 'URL is empty.' };
  }

  switch (storeSlug) {
    case 'amazon':
      return validateAmazonProductUrl(url);
    case 'flipkart':
      return validateFlipkartProductUrl(url);
    case 'myntra':
      return validateMyntraProductUrl(url);
    case 'croma':
      return validateCromaProductUrl(url);
    case 'reliance-digital':
    case 'reliance':
      return validateRelianceProductUrl(url);
    default:
      return { isValid: false, isExactProductUrl: false, canonicalUrl: null, storeProductId: null, reason: `Unknown store slug "${storeSlug}".` };
  }
}

module.exports = {
  validateAmazonProductUrl,
  validateFlipkartProductUrl,
  validateMyntraProductUrl,
  validateCromaProductUrl,
  validateRelianceProductUrl,
  validateStoreProductUrl
};
