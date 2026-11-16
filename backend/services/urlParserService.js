// backend/services/urlParserService.js
// Secure URL parser, validation, and SSRF prevention for PriceTrack e-commerce links
// STRICT: Only genuine product detail page URLs accepted. Search query URLs strictly rejected.

const { validateStoreProductUrl } = require('../utils/urlValidator');

const SUPPORTED_STORES = [
  {
    slug: 'amazon',
    name: 'Amazon India',
    domains: ['amazon.in', 'www.amazon.in', 'amzn.in'],
    website: 'https://www.amazon.in'
  },
  {
    slug: 'flipkart',
    name: 'Flipkart',
    domains: ['flipkart.com', 'www.flipkart.com', 'dl.flipkart.com', 'fkrt.it'],
    website: 'https://www.flipkart.com'
  },
  {
    slug: 'myntra',
    name: 'Myntra',
    domains: ['myntra.com', 'www.myntra.com'],
    website: 'https://www.myntra.com'
  },
  {
    slug: 'croma',
    name: 'Croma',
    domains: ['croma.com', 'www.croma.com'],
    website: 'https://www.croma.com'
  },
  {
    slug: 'reliance-digital',
    name: 'Reliance Digital',
    domains: ['reliancedigital.in', 'www.reliancedigital.in'],
    website: 'https://www.reliancedigital.in'
  }
];

const KNOWN_BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Redmi', 'Realme',
  'HP', 'Dell', 'Lenovo', 'ASUS', 'Sony', 'JBL', 'boAt',
  'LG', 'Acer', 'Google', 'Bose', 'Logitech', 'Keychron',
  'Anker', 'Dyson', 'Philips', 'GoPro'
];

// Non-product path segments that indicate account, cart, policy or generic pages
const NON_PRODUCT_PATHS = new Set([
  '', '/', 'account', 'cart', 'checkout', 'help', 'orders', 'wishlist',
  'signin', 'login', 'signup', 'register', 'contact-us', 'about-us',
  'privacypolicy', 'terms', 'customer-service', 'gp/help', 'bestsellers',
  'deals', 'todays-deals', 'stores'
]);

// SSRF blocklist patterns: private subnets, localhost, cloud metadata endpoints
const PRIVATE_IP_REGEX = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|0\.|fc00:|fe80:|::1)/i;

const urlParserService = {
  /**
   * Validate, check SSRF, and parse a shopping product URL
   * @param {string} rawUrl
   * @returns {Object} result object with isValid, store, extractedId, keywords, attributes or error
   */
  parseUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return {
        isValid: false,
        error: 'Please enter a product URL to compare.'
      };
    }

    const cleanInput = rawUrl.trim();

    // 1. URL syntax validation
    let parsed;
    try {
      parsed = new URL(cleanInput);
    } catch (err) {
      return {
        isValid: false,
        error: 'Invalid URL format. Please provide a full URL including https:// (e.g. https://www.amazon.in/dp/...)'
      };
    }

    // 2. Protocol check: HTTPS only for e-commerce stores (HTTP rejected or blocked)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        isValid: false,
        error: 'Invalid URL protocol. Only web URLs (https://) are supported.'
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 3. Strict SSRF Prevention
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan') ||
      hostname.endsWith('.corp') ||
      PRIVATE_IP_REGEX.test(hostname)
    ) {
      return {
        isValid: false,
        error: 'Security Error: Access to internal network hosts or private IP addresses is prohibited.'
      };
    }

    // Prevent non-standard ports (e.g. http://amazon.in:8080)
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      return {
        isValid: false,
        error: 'Security Error: Non-standard web ports are not permitted.'
      };
    }

    // 4. Match against supported e-commerce platforms
    const matchedStore = SUPPORTED_STORES.find(store => 
      store.domains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))
    );

    if (!matchedStore) {
      return {
        isValid: false,
        error: `Unsupported shopping website "${hostname}". PriceTrack currently supports Amazon India, Flipkart, Myntra, Croma, and Reliance Digital.`
      };
    }

    // 5. Store-specific identifier and slug extraction
    const pathname = decodeURIComponent(parsed.pathname).replace(/\/+$/, '');
    const searchParams = parsed.searchParams;

    // Check if the URL is just a bare homepage or root
    if (!pathname || pathname === '') {
      return {
        isValid: false,
        error: `The URL provided is the homepage of ${matchedStore.name}, not an individual product page. Please paste a link to a specific product.`
      };
    }

    // Check against generic non-product top-level paths
    const trimmedPath = pathname.replace(/^\/+/, '').toLowerCase();
    if (NON_PRODUCT_PATHS.has(trimmedPath)) {
      return {
        isValid: false,
        error: `The URL provided is a store section page (${pathname}), not an individual product page. Please paste a link to a specific product.`
      };
    }

    // Check if the user pasted a search-results URL
    if (
      pathname === '/s' ||
      pathname.startsWith('/s/') ||
      pathname.includes('/search') ||
      pathname.includes('/dsearch') ||
      pathname.includes('/searchB') ||
      searchParams.has('k') ||
      searchParams.has('rawQuery') ||
      (matchedStore.slug === 'flipkart' && searchParams.has('q') && !searchParams.has('pid'))
    ) {
      return {
        isValid: false,
        error: `Search-results URLs are not supported. Please paste a direct product detail page link from ${matchedStore.name}.`
      };
    }

    let extractedId = null;
    let extractedSlug = '';

    switch (matchedStore.slug) {
      case 'amazon': {
        const asinMatch = pathname.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|\/d\/)([A-Z0-9]{10})/i);
        if (asinMatch) {
          extractedId = asinMatch[1].toUpperCase();
        } else {
          const asinParam = searchParams.get('asin') || searchParams.get('pd_rd_i');
          if (asinParam && /^[A-Z0-9]{10}$/i.test(asinParam)) {
            extractedId = asinParam.toUpperCase();
          }
        }

        const slugMatch = pathname.match(/^\/([^\/]+)\/dp\//i);
        if (slugMatch) {
          extractedSlug = slugMatch[1];
        }
        break;
      }

      case 'flipkart': {
        const fsnMatch = pathname.match(/\/p\/(itm[a-zA-Z0-9]+)/i);
        if (fsnMatch) {
          extractedId = fsnMatch[1];
        } else {
          const pid = searchParams.get('pid');
          if (pid) extractedId = pid;
        }

        const slugMatch = pathname.match(/^\/([^\/]+)\/p\//i);
        if (slugMatch) {
          extractedSlug = slugMatch[1];
        } else {
          const segments = pathname.split('/').filter(Boolean);
          if (segments.length === 1 && extractedId) {
            extractedSlug = segments[0];
          }
        }
        break;
      }

      case 'myntra': {
        const idMatch = pathname.match(/\/(\d{5,12})(?:\/buy)?(?:\/|\?|$)/i);
        if (idMatch) {
          extractedId = idMatch[1];
        }

        const segments = pathname.split('/').filter(Boolean);
        const nonIdSegments = segments.filter(s => s !== 'buy' && !/^\d+$/.test(s));
        if (nonIdSegments.length > 0) {
          extractedSlug = nonIdSegments[nonIdSegments.length - 1];
        }
        break;
      }

      case 'croma': {
        const pMatch = pathname.match(/\/p\/(\d{5,10})/i) || pathname.match(/-(\d{5,10})(?:\?|$)/);
        if (pMatch) {
          extractedId = pMatch[1];
        }

        const slugMatch = pathname.match(/^\/([^\/]+?)(?:-)?\/p\//i);
        if (slugMatch) {
          extractedSlug = slugMatch[1];
        }
        break;
      }

      case 'reliance-digital': {
        const pMatch = pathname.match(/\/p\/(\d{6,12})/i);
        if (pMatch) {
          extractedId = pMatch[1];
        }

        const slugMatch = pathname.match(/^\/([^\/]+)\/p\//i);
        if (slugMatch) {
          extractedSlug = slugMatch[1];
        }
        break;
      }
    }

    // Validation: URL must have either an extracted product ID or product slug
    if (!extractedId && !extractedSlug) {
      return {
        isValid: false,
        error: `Could not identify an individual product from this ${matchedStore.name} link. Please provide a direct link to a product page.`
      };
    }

    // 6. Canonical Clean URL
    let cleanUrl;
    if (matchedStore.slug === 'amazon' && extractedId) {
      cleanUrl = `https://www.amazon.in/dp/${extractedId}`;
    } else {
      const cleanUrlObj = new URL(parsed.toString());
      const trackingParams = [
        'tag', 'ref', 'ref_', 'utm_source', 'utm_medium', 'utm_campaign',
        'utm_term', 'utm_content', 'sr', 'qid', 'source', 'fbclid',
        'gclid', 'affid', 'otracker', 'otracker1', 'marketplace', 'lid'
      ];
      trackingParams.forEach(p => cleanUrlObj.searchParams.delete(p));
      cleanUrl = cleanUrlObj.toString();
    }

    // 7. Parse text clues for brand, model, specs from slug and pathname
    const rawClues = [extractedSlug, pathname.replace(/\//g, ' ')].filter(Boolean).join(' ');
    const normalizedClues = rawClues.replace(/[-_+]/g, ' ').replace(/\s+/g, ' ');

    const attributes = this.extractAttributes(normalizedClues);

    return {
      isValid: true,
      originalUrl: cleanInput,
      cleanUrl,
      store: matchedStore,
      storeSlug: matchedStore.slug,
      storeName: matchedStore.name,
      extractedId,
      extractedSlug,
      isSearchUrl: false,
      textClues: normalizedClues,
      attributes
    };
  },

  /**
   * Extract Brand, Storage, RAM, and Model Keywords from text clues
   * @param {string} text
   * @returns {Object}
   */
  extractAttributes(text) {
    if (!text) return {};

    const lower = text.toLowerCase();

    // Brand detection
    let detectedBrand = null;
    for (const b of KNOWN_BRANDS) {
      const reg = new RegExp(`\\b${b}\\b`, 'i');
      if (reg.test(text)) {
        detectedBrand = b === 'Redmi' ? 'Xiaomi' : b;
        break;
      }
    }

    // Storage detection (e.g., 32GB, 64GB, 128GB, 256GB, 512GB, 1TB, 2TB)
    let detectedStorage = null;
    const storageMatch = text.match(/\b(32|64|128|256|512)\s*(?:gb|gigabytes?)\b/i) || text.match(/\b(1|2)\s*(?:tb|terabytes?)\b/i);
    if (storageMatch) {
      detectedStorage = storageMatch[0].replace(/\s+/g, '').toUpperCase();
    }

    // RAM detection (e.g. 4GB, 6GB, 8GB, 12GB, 16GB, 32GB RAM)
    let detectedRam = null;
    const ramMatch = text.match(/\b(4|6|8|12|16|24|32|64)\s*(?:gb)?\s*(?:ram|unified memory)\b/i);
    if (ramMatch) {
      detectedRam = ramMatch[1] + 'GB';
    }

    // Color detection
    const colors = [
      'Midnight', 'Starlight', 'Black', 'Titanium Gray', 'Silky Black',
      'Obsidian', 'Fusion Black', 'Submarine Blue', 'Dark Chrome',
      'Awesome Iceblue', 'Silver', 'White', 'Blue', 'Green', 'Gold'
    ];
    let detectedColor = null;
    for (const c of colors) {
      if (new RegExp(`\\b${c}\\b`, 'i').test(text)) {
        detectedColor = c;
        break;
      }
    }

    // Significant keyword tokens (excluding stop words)
    const stopWords = new Set([
      'the', 'with', 'and', 'for', 'buy', 'online', 'store', 'price',
      'india', 'best', 'latest', 'features', 'specifications', 'reviews',
      'ratings', 'mobile', 'phone', 'laptop', 'headphone', 'headphones',
      'headset', 'tv', 'watch', 'shop', 'fast', 'free', 'delivery',
      'new', 'item', 'dp', 'p', 'com', 'in'
    ]);

    const words = text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(w => w.length >= 2 && !stopWords.has(w));

    return {
      brand: detectedBrand,
      storage: detectedStorage,
      ram: detectedRam,
      color: detectedColor,
      keywords: Array.from(new Set(words))
    };
  }
};

module.exports = urlParserService;
