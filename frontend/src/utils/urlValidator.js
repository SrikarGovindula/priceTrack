// frontend/src/utils/urlValidator.js
// Strict store-specific exact product detail URL validation for PriceTrack frontend

export function validateAmazonProductUrl(url) {
  if (!url || typeof url !== 'string') return { isValid: false };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return { isValid: false };
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'amazon.in' && hostname !== 'www.amazon.in' && hostname !== 'amzn.in') return { isValid: false };
    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname === '/s' || pathname.startsWith('/s/') || parsed.searchParams.has('k')) return { isValid: false };
    const asinMatch = pathname.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|\/d\/)([A-Z0-9]{10})/i);
    let asin = asinMatch ? asinMatch[1].toUpperCase() : null;
    if (!asin) {
      const qAsin = parsed.searchParams.get('pd_rd_i') || parsed.searchParams.get('asin');
      if (qAsin && /^[A-Z0-9]{10}$/i.test(qAsin)) asin = qAsin.toUpperCase();
    }
    if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) return { isValid: false };
    return { isValid: true, isExactProductUrl: true, storeProductId: asin, canonicalUrl: `https://www.amazon.in/dp/${asin}` };
  } catch (err) {
    return { isValid: false };
  }
}

export function validateFlipkartProductUrl(url) {
  if (!url || typeof url !== 'string') return { isValid: false };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return { isValid: false };
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'flipkart.com' && hostname !== 'www.flipkart.com' && hostname !== 'dl.flipkart.com') return { isValid: false };
    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname.includes('/search') || parsed.searchParams.has('q')) return { isValid: false };
    const fsnMatch = pathname.match(/\/p\/(itm[a-zA-Z0-9]+)/i);
    const pid = parsed.searchParams.get('pid');
    if (!fsnMatch && !pid) return { isValid: false };
    return { isValid: true, isExactProductUrl: true, storeProductId: fsnMatch ? fsnMatch[1] : pid, canonicalUrl: url };
  } catch (err) {
    return { isValid: false };
  }
}

export function validateMyntraProductUrl(url) {
  if (!url || typeof url !== 'string') return { isValid: false };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return { isValid: false };
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'myntra.com' && hostname !== 'www.myntra.com') return { isValid: false };
    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname.includes('/dsearch') || pathname.includes('/search') || parsed.searchParams.has('rawQuery')) return { isValid: false };
    const idMatch = pathname.match(/\/(\d{5,12})(?:\/buy)?(?:\/|\?|$)/i);
    if (!idMatch) return { isValid: false };
    return { isValid: true, isExactProductUrl: true, storeProductId: idMatch[1], canonicalUrl: url };
  } catch (err) {
    return { isValid: false };
  }
}

export function validateCromaProductUrl(url) {
  if (!url || typeof url !== 'string') return { isValid: false };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return { isValid: false };
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'croma.com' && hostname !== 'www.croma.com') return { isValid: false };
    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname.includes('/searchB') || pathname.includes('/search') || parsed.searchParams.has('text') || parsed.searchParams.has('q')) return { isValid: false };
    const pMatch = pathname.match(/\/p\/(\d{5,10})/i) || pathname.match(/-(\d{5,10})(?:\?|$)/);
    if (!pMatch) return { isValid: false };
    return { isValid: true, isExactProductUrl: true, storeProductId: pMatch[1], canonicalUrl: url };
  } catch (err) {
    return { isValid: false };
  }
}

export function validateRelianceProductUrl(url) {
  if (!url || typeof url !== 'string') return { isValid: false };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return { isValid: false };
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== 'reliancedigital.in' && hostname !== 'www.reliancedigital.in') return { isValid: false };
    const pathname = decodeURIComponent(parsed.pathname);
    if (!pathname || pathname === '/' || pathname.includes('/search') || parsed.searchParams.has('q')) return { isValid: false };
    const pMatch = pathname.match(/\/p\/(\d{6,12})/i);
    if (!pMatch) return { isValid: false };
    return { isValid: true, isExactProductUrl: true, storeProductId: pMatch[1], canonicalUrl: url };
  } catch (err) {
    return { isValid: false };
  }
}

export function validateStoreProductUrl(storeSlug, url) {
  if (!url || typeof url !== 'string') return { isValid: false, isExactProductUrl: false, canonicalUrl: null };
  switch (storeSlug) {
    case 'amazon': return validateAmazonProductUrl(url);
    case 'flipkart': return validateFlipkartProductUrl(url);
    case 'myntra': return validateMyntraProductUrl(url);
    case 'croma': return validateCromaProductUrl(url);
    case 'reliance-digital':
    case 'reliance': return validateRelianceProductUrl(url);
    default: return { isValid: false, isExactProductUrl: false, canonicalUrl: null };
  }
}
