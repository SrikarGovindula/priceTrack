const { ObjectId } = require('mongodb');
const { connectDB, closeDB, getDB } = require('../config/db');
const { hashPassword } = require('./cryptoUtils');
const { ADMIN_EMAIL, ADMIN_PASSWORD, DEMO_USER_EMAIL, DEMO_USER_PASSWORD } = require('../config/env');

const STORES_DATA = [
  {
    storeName: 'Amazon India',
    storeSlug: 'amazon',
    storeLogo: '/images/stores/amazon.svg',
    website: 'https://www.amazon.in',
    isActive: true
  },
  {
    storeName: 'Flipkart',
    storeSlug: 'flipkart',
    storeLogo: '/images/stores/flipkart.svg',
    website: 'https://www.flipkart.com',
    isActive: true
  },
  {
    storeName: 'Croma',
    storeSlug: 'croma',
    storeLogo: '/images/stores/croma.svg',
    website: 'https://www.croma.com',
    isActive: true
  },
  {
    storeName: 'Reliance Digital',
    storeSlug: 'reliance-digital',
    storeLogo: '/images/stores/reliance.svg',
    website: 'https://www.reliancedigital.in',
    isActive: true
  },
  {
    storeName: 'Myntra',
    storeSlug: 'myntra',
    storeLogo: '/images/stores/myntra.svg',
    website: 'https://www.myntra.com',
    isActive: true
  }
];

const PRODUCTS_DATA = [
  // ==========================================
  // CATEGORY 1: HEADPHONES & AUDIO
  // ==========================================
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Headphones',
    modelNumber: 'WH1000XM5',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    description: 'Industry-leading noise canceling headphones with dual processors and 8 microphones for exceptional clarity and call quality.',
    specifications: {
      'Battery Life': 'Up to 30 hours',
      'Connectivity': 'Bluetooth 5.2, 3.5mm Aux',
      'Noise Cancellation': 'Active Noise Cancellation with Auto NC Optimizer',
      'Weight': '250 grams',
      'Microphones': '8 microphones with beamforming'
    },
    basePrice: 29990,
    originalPrice: 34990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B09XS7JWHH',
      flipkart: 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itme91724497e5ea',
      croma: 'https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone-with-mic-active-noise-cancellation-silver-/p/257159',
      'reliance-digital': 'https://www.reliancedigital.in/sony-wh-1000xm5-wireless-noise-cancelling-headphones-black/p/492850284',
      myntra: 'https://www.myntra.com/headphones/sony/sony-wh-1000xm5-wireless-active-noise-cancelling-headphones/23491024/buy'
    }
  },
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    brand: 'Apple',
    category: 'Headphones',
    modelNumber: 'MQD83HN/A',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, and Transparency mode powered by the Apple H2 chip.',
    specifications: {
      'Chipset': 'Apple H2 Headphone chip',
      'Battery Life': 'Up to 6 hours (30 hours with MagSafe case)',
      'Water Resistance': 'IP54 dust, sweat, and water resistant',
      'Audio Features': 'Personalized Spatial Audio with dynamic head tracking'
    },
    basePrice: 22990,
    originalPrice: 24900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0BDHWDR12',
      flipkart: 'https://www.flipkart.com/apple-airpods-pro-2nd-generation-magsafe-case-usb-c-bluetooth-headset/p/itme358a946cb3ee',
      croma: 'https://www.croma.com/apple-airpods-pro-2nd-generation-tws-earbuds-with-active-noise-cancellation-white-/p/301166',
      'reliance-digital': 'https://www.reliancedigital.in/apple-airpods-pro-2nd-generation-with-magsafe-charging-case-usb-c-/p/493839290'
    }
  },
  {
    name: 'Bose QuietComfort 45 Bluetooth Headphones',
    brand: 'Bose',
    category: 'Headphones',
    modelNumber: 'QC45',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Iconic quiet, comfort, and sound. Premium wireless noise cancelling headphones engineered for all-day listening.',
    specifications: {
      'Battery Life': 'Up to 22 hours per charge',
      'Noise Cancellation': 'Quiet and Aware Modes',
      'Charging': 'USB-C fast charge (15 min gives 3 hours)',
      'Materials': 'Cast-metal hinges and plush synthetic leather'
    },
    basePrice: 27900,
    originalPrice: 32900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B098FKXT8L'
    }
  },
  {
    name: 'Sony WH-CH720N Noise Cancelling Wireless Headphones',
    brand: 'Sony',
    category: 'Headphones',
    modelNumber: 'WHCH720N',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    description: 'Lightweight over-ear headphones with Dual Noise Sensor technology and the Integrated Processor V1.',
    specifications: {
      'Battery Life': 'Up to 35 hours with ANC',
      'Weight': '192 grams (lightest Sony ANC headband)',
      'Processor': 'Integrated Processor V1',
      'Multipoint Connection': 'Pair two Bluetooth devices simultaneously'
    },
    basePrice: 9990,
    originalPrice: 14990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0BS1PRPC6'
    }
  },
  {
    name: 'JBL Tune 770NC Wireless Over-Ear ANC Headphones',
    brand: 'JBL',
    category: 'Headphones',
    modelNumber: 'T770NC',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    description: 'Adaptive Noise Cancelling with Smart Ambient, JBL Pure Bass Sound, and Bluetooth 5.3 with LE Audio support.',
    specifications: {
      'Driver Size': '40 mm Dynamic Driver',
      'Battery Life': 'Up to 70 hours (44 hours with ANC)',
      'Sound Signature': 'JBL Pure Bass Sound',
      'Bluetooth Version': '5.3 with LE Audio'
    },
    basePrice: 6499,
    originalPrice: 9999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C7QNLVLR'
    }
  },
  {
    name: 'boAt Rockerz 550 Over-Ear Wireless Headphones',
    brand: 'boAt',
    category: 'Headphones',
    modelNumber: 'ROCKERZ550',
    image: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=600&auto=format&fit=crop&q=80',
    description: 'Ergonomically designed over-ear wireless headphones with 50mm dynamic drivers and deep punchy bass.',
    specifications: {
      'Driver Size': '50 mm Neodymium Drivers',
      'Battery Playtime': 'Up to 20 hours',
      'Battery Capacity': '500 mAh',
      'Connectivity': 'Bluetooth 5.0 and 3.5mm Aux'
    },
    basePrice: 1799,
    originalPrice: 4999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0856HNMR7',
      flipkart: 'https://www.flipkart.com/boat-rockerz-550-bluetooth-headset/p/itm928a6f3a388ca',
      croma: 'https://www.croma.com/boat-rockerz-550-over-ear-wireless-headphone-with-mic-black-/p/229045',
      'reliance-digital': 'https://www.reliancedigital.in/boat-rockerz-550-over-ear-wireless-headphone-black/p/491901174',
      myntra: 'https://www.myntra.com/headphones/boat/boat-rockerz-550-over-ear-wireless-headphones/19827364/buy'
    }
  },
  {
    name: 'OnePlus Buds Pro 2 True Wireless Earbuds',
    brand: 'OnePlus',
    category: 'Headphones',
    modelNumber: 'E507A',
    image: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=600&auto=format&fit=crop&q=80',
    description: 'Co-created with Dynaudio, featuring MelodyBoost Dual Drivers, Smart Adaptive Noise Cancellation, and Spatial Audio.',
    specifications: {
      'Drivers': '11mm woofer + 6mm tweeter dual drivers',
      'Noise Cancellation': 'Up to 48dB Smart Adaptive ANC',
      'Battery Life': 'Up to 39 hours total playback',
      'Hi-Res Audio': 'LHDC 4.0 Lossless Audio support'
    },
    basePrice: 8999,
    originalPrice: 13999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0BQJ9T67V'
    }
  },

  // ==========================================
  // CATEGORY 2: SMARTPHONES
  // ==========================================
  {
    name: 'Apple iPhone 15 (128GB, Black)',
    brand: 'Apple',
    category: 'Smartphones',
    modelNumber: 'MTP03HN/A',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    description: 'Dynamic Island, 48MP Main camera with 2x Telephoto, and durable color-infused glass and aluminum design with USB-C.',
    specifications: {
      'Display': '6.1-inch Super Retina XDR OLED',
      'Chipset': 'Apple A16 Bionic (4nm)',
      'Camera': '48MP Main + 12MP Ultra Wide with Sensor-shift OIS',
      'Port': 'USB-C supporting charging and DisplayPort'
    },
    basePrice: 69999,
    originalPrice: 79900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CHX1W1XY',
      flipkart: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4',
      croma: 'https://www.croma.com/apple-iphone-15-128gb-black-/p/300762',
      'reliance-digital': 'https://www.reliancedigital.in/apple-iphone-15-128-gb-black/p/493839294'
    }
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)',
    brand: 'Samsung',
    category: 'Smartphones',
    modelNumber: 'SM-S928B',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    description: 'Galaxy AI smartphone with a 200MP camera, built-in S Pen, Titanium frame, and flat Corning Gorilla Armor display.',
    specifications: {
      'Display': '6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits',
      'Processor': 'Qualcomm Snapdragon 8 Gen 3 for Galaxy',
      'Camera System': '200MP Wide + 50MP Periscope + 10MP Telephoto + 12MP Ultra Wide',
      'Battery': '5000 mAh with 45W Fast Charging'
    },
    basePrice: 129999,
    originalPrice: 134999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CS5XW939',
      flipkart: 'https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itm0b21a8a30d507',
      croma: 'https://www.croma.com/samsung-galaxy-s24-ultra-5g-256gb-12gb-ram-titanium-gray-/p/304445',
      'reliance-digital': 'https://www.reliancedigital.in/samsung-galaxy-s24-ultra-5g-256-gb-12-gb-ram-titanium-gray-mobile-phone/p/494352814'
    }
  },
  {
    name: 'OnePlus 12 5G (256GB, Silky Black)',
    brand: 'OnePlus',
    category: 'Smartphones',
    modelNumber: 'CPH2573',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    description: 'Flagship powered by Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System, and 100W SUPERVOOC flash charge.',
    specifications: {
      'Display': '6.82-inch 2K ProXDR Display with LTPO 4.0 (1-120Hz)',
      'Processor': 'Snapdragon 8 Gen 3 Mobile Platform',
      'Camera': '50MP Sony LYT-808 + 64MP 3X Periscope + 48MP Ultra-wide',
      'Charging': '100W Wired + 50W AIRVOOC Wireless'
    },
    basePrice: 64999,
    originalPrice: 69999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CQPNR3Y6',
      flipkart: 'https://www.flipkart.com/oneplus-12-silky-black-256-gb/p/itmd0436d4dfba85',
      croma: 'https://www.croma.com/oneplus-12-5g-256gb-12gb-ram-silky-black-/p/304443',
      'reliance-digital': 'https://www.reliancedigital.in/oneplus-12-5g-256-gb-12-gb-ram-silky-black-mobile-phone/p/494352739'
    }
  },
  {
    name: 'Google Pixel 8 (128GB, Obsidian)',
    brand: 'Google',
    category: 'Smartphones',
    modelNumber: 'GA04803-IN',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    description: 'Engineered by Google with Google Tensor G3, advanced AI photography, and 7 years of operating system updates.',
    specifications: {
      'Display': '6.2-inch Actua display, 120Hz OLED, 2000 nits',
      'Processor': 'Google Tensor G3 with Titan M2 security coprocessor',
      'Camera': '50MP Octa PD main camera + 12MP ultra-wide with Macro Focus',
      'OS Support': '7 years of OS, security, and Feature Drop updates'
    },
    basePrice: 71999,
    originalPrice: 75999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CKF6P8D6',
      flipkart: 'https://www.flipkart.com/google-pixel-8-obsidian-128-gb/p/itm0e90c5c3d7bd4',
      croma: 'https://www.croma.com/google-pixel-8-5g-128gb-8gb-ram-obsidian-/p/301742',
      'reliance-digital': 'https://www.reliancedigital.in/google-pixel-8-128-gb-8-gb-ram-obsidian-smartphone/p/493911802'
    }
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro+ 5G (256GB, Fusion Black)',
    brand: 'Xiaomi',
    category: 'Smartphones',
    modelNumber: '23090RA98I',
    image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop&q=80',
    description: 'Flagship curved 1.5K 120Hz AMOLED display, 200MP OIS camera, MediaTek Dimensity 7200-Ultra, and 120W HyperCharge.',
    specifications: {
      'Display': '6.67-inch 3D Curved 1.5K AMOLED, 120Hz, Dolby Vision',
      'Processor': 'MediaTek Dimensity 7200-Ultra (4nm)',
      'Camera': '200MP Samsung ISOCELL HP3 with OIS',
      'Charging': '120W HyperCharge (100% in 19 minutes)'
    },
    basePrice: 30999,
    originalPrice: 33999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CQG5W1J6'
    }
  },
  {
    name: 'Realme 12 Pro+ 5G (256GB, Submarine Blue)',
    brand: 'Realme',
    category: 'Smartphones',
    modelNumber: 'RMX3840',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    description: 'Luxury watch-inspired design with 64MP Periscope Portrait Camera, Snapdragon 7s Gen 2, and 120Hz curved display.',
    specifications: {
      'Display': '6.7-inch 120Hz Curved AMOLED, 2160Hz PWM Dimming',
      'Camera': '64MP Periscope Telephoto (3X optical, 120X digital) + 50MP Sony IMX890 OIS',
      'Processor': 'Snapdragon 7s Gen 2 (4nm)',
      'Charging': '67W SUPERVOOC Charge with 5000mAh Battery'
    },
    basePrice: 29999,
    originalPrice: 31999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CSK6D83V',
      flipkart: 'https://www.flipkart.com/realme-12-pro-5g-submarine-blue-256-gb/p/itmd0930777e163b'
    }
  },
  {
    name: 'OnePlus Nord CE 4 5G (128GB, Dark Chrome)',
    brand: 'OnePlus',
    category: 'Smartphones',
    modelNumber: 'CPH2613',
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80',
    description: 'High performance balanced 5G phone with Qualcomm Snapdragon 7 Gen 3, 100W SUPERVOOC charging, and 5500mAh battery.',
    specifications: {
      'Display': '6.7-inch 120Hz Fluid AMOLED, HDR10+',
      'Processor': 'Snapdragon 7 Gen 3',
      'Camera': '50MP Sony LYT-600 with OIS',
      'Battery': '5500 mAh with 100W SUPERVOOC'
    },
    basePrice: 24999,
    originalPrice: 26999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CX24J12F'
    }
  },
  {
    name: 'Samsung Galaxy A55 5G (128GB, Awesome Iceblue)',
    brand: 'Samsung',
    category: 'Smartphones',
    modelNumber: 'SM-A556E',
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80',
    description: 'Metal frame design with Corning Gorilla Glass Victus+, 50MP OIS camera, Samsung Knox Vault, and 4 OS upgrades.',
    specifications: {
      'Display': '6.6-inch Super AMOLED, 120Hz, 1000 nits Vision Booster',
      'Processor': 'Samsung Exynos 1480 (4nm) with AMD Xclipse 530 GPU',
      'Water Resistance': 'IP67 dust and water resistance',
      'Security': 'Samsung Knox Vault EAL5+ certified'
    },
    basePrice: 39999,
    originalPrice: 42999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CX1G2Y7P'
    }
  },

  // ==========================================
  // CATEGORY 3: LAPTOPS
  // ==========================================
  {
    name: 'Apple MacBook Air M3 (13-inch, 8GB RAM, 256GB SSD, Midnight)',
    brand: 'Apple',
    category: 'Laptops',
    modelNumber: 'MRXV3HN/A',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    description: 'Super-portable, blazing-fast laptop powered by the Apple M3 chip, with up to 18 hours of battery life.',
    specifications: {
      'Processor': 'Apple M3 chip (8-core CPU, 8-core GPU)',
      'Memory': '8GB unified memory',
      'Storage': '256GB high-speed SSD',
      'Display': '13.6-inch Liquid Retina display with True Tone',
      'Battery': 'Up to 18 hours battery life'
    },
    basePrice: 104990,
    originalPrice: 114900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CX2377L9',
      flipkart: 'https://www.flipkart.com/apple-macbook-air-m3-8-gb-256-gb-ssd-macos-sonoma-mxdv3hn-a/p/itm17282710ea12b',
      croma: 'https://www.croma.com/apple-macbook-air-2024-m3-8gb-256gb-ssd-macos-13-6-inch-midnight-/p/305263',
      'reliance-digital': 'https://www.reliancedigital.in/apple-macbook-air-m3-chip-8gb-256gb-ssd-macos-sonoma-34-54-cm-13-6-inch-liquid-retina-display-midnight-mxdv3hn-a/p/494352857'
    }
  },
  {
    name: 'Dell XPS 13 9315 Laptop (Intel Core i7 12th Gen, 16GB, 512GB SSD)',
    brand: 'Dell',
    category: 'Laptops',
    modelNumber: 'XPS9315',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
    description: 'Thinnest and lightest 13-inch XPS laptop with an InfinityEdge display, CNC machined aluminum, and long battery life.',
    specifications: {
      'Processor': 'Intel Core i7-1250U (10 Cores, up to 4.7 GHz)',
      'Display': '13.4-inch FHD+ (1920 x 1200) InfinityEdge 500 nits',
      'Memory': '16GB LPDDR5 5200 MHz',
      'Storage': '512GB PCIe NVMe SSD',
      'Weight': '1.17 kg'
    },
    basePrice: 118990,
    originalPrice: 132000,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0B5G82F6G'
    }
  },
  {
    name: 'Lenovo Legion 5 Pro Gaming Laptop (Ryzen 7 7745HX, RTX 4060, 16GB, 1TB)',
    brand: 'Lenovo',
    category: 'Laptops',
    modelNumber: '16IRX8',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
    description: 'High-performance AI-tuned gaming laptop with AMD Ryzen 7, NVIDIA GeForce RTX 4060, and 240Hz PureSight Gaming display.',
    specifications: {
      'Processor': 'AMD Ryzen 7 7745HX (8 Cores / 16 Threads, up to 5.1 GHz)',
      'Graphics': 'NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)',
      'Display': '16-inch WQXGA (2560x1600) IPS 240Hz 500 nits',
      'Thermal Management': 'Legion Coldfront 5.0 vapor chamber cooling'
    },
    basePrice: 134990,
    originalPrice: 155000,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C74J5F78'
    }
  },
  {
    name: 'ASUS Zenbook 14 OLED (Intel Core Ultra 7, 16GB, 1TB SSD)',
    brand: 'ASUS',
    category: 'Laptops',
    modelNumber: 'UX3405MA',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    description: 'Intel Evo certified premium ultraportable laptop with 3K 120Hz ASUS Lumina OLED display, Intel AI Boost NPU, and 75Wh battery.',
    specifications: {
      'Processor': 'Intel Core Ultra 7 155H with Intel AI Boost NPU',
      'Display': '14.0-inch 3K (2880 x 1800) OLED 120Hz 0.2ms',
      'Memory': '16GB LPDDR5X on board',
      'Storage': '1TB M.2 NVMe PCIe 4.0 SSD',
      'Weight': '1.20 kg'
    },
    basePrice: 109990,
    originalPrice: 122990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CSK6FGL4'
    }
  },
  {
    name: 'HP Pavilion 15 (13th Gen Intel Core i5, 16GB RAM, 512GB SSD)',
    brand: 'HP',
    category: 'Laptops',
    modelNumber: '15-EG3079TU',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    description: 'Work and stream effortlessly with 13th Gen Intel Core processors, B&O audio, and micro-edge FHD IPS display.',
    specifications: {
      'Processor': '13th Gen Intel Core i5-1335U (10 cores, up to 4.6 GHz)',
      'Display': '15.6-inch FHD (1920 x 1080) IPS micro-edge anti-glare',
      'Memory': '16GB DDR4-3200 MHz RAM',
      'Audio': 'Audio by Bang & Olufsen with dual speakers'
    },
    basePrice: 64990,
    originalPrice: 74990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C2HW9585'
    }
  },
  {
    name: 'Acer Nitro V 15 Gaming Laptop (Intel Core i5 13th Gen, RTX 4050, 16GB, 512GB SSD)',
    brand: 'Acer',
    category: 'Laptops',
    modelNumber: 'ANV15-51',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
    description: 'Equipped with 13th Gen Intel Core i5, NVIDIA GeForce RTX 4050 GPU, and 144Hz high refresh display for immersive gameplay.',
    specifications: {
      'Processor': 'Intel Core i5-13420H (8 Cores, up to 4.6 GHz)',
      'Graphics': 'NVIDIA GeForce RTX 4050 with 6GB dedicated GDDR6',
      'Display': '15.6-inch FHD IPS 144Hz SlimBezel',
      'Cooling': 'Dual fan dual intake cooling exhaust system'
    },
    basePrice: 74990,
    originalPrice: 89999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CHDD6NGM'
    }
  },
  {
    name: 'HP Victus Gaming Laptop (AMD Ryzen 5 5600H, RTX 3050, 16GB, 512GB SSD)',
    brand: 'HP',
    category: 'Laptops',
    modelNumber: '15-FB0106AX',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80',
    description: 'Built for gamers with AMD Ryzen 5, NVIDIA GeForce RTX 3050 graphics, 144Hz anti-glare screen, and updated thermals.',
    specifications: {
      'Processor': 'AMD Ryzen 5 5600H (6 cores, 12 threads)',
      'Graphics': 'NVIDIA GeForce RTX 3050 (4GB GDDR6)',
      'Display': '15.6-inch FHD 144Hz IPS micro-edge 250 nits',
      'Software': 'OMEN Gaming Hub performance controls'
    },
    basePrice: 58990,
    originalPrice: 71990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0B5HCBG18'
    }
  },
  {
    name: 'Acer Aspire Lite (11th Gen Intel Core i3, 8GB RAM, 512GB SSD)',
    brand: 'Acer',
    category: 'Laptops',
    modelNumber: 'AL15-51',
    image: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&auto=format&fit=crop&q=80',
    description: 'Lightweight everyday budget laptop with thin metal cover, 15.6-inch Full HD display, and fast SSD storage.',
    specifications: {
      'Processor': 'Intel Core i3-1115G4 (up to 4.10 GHz)',
      'Display': '15.6-inch Full HD (1920x1080) high-brightness Acer ComfyView',
      'Memory': '8GB DDR4 RAM expandable up to 32GB',
      'Weight': '1.59 kg'
    },
    basePrice: 29990,
    originalPrice: 42990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C3CYLTB1'
    }
  },

  // ==========================================
  // CATEGORY 4: SMARTWATCHES
  // ==========================================
  {
    name: 'Apple Watch Series 9 GPS 45mm (Midnight Aluminum Case)',
    brand: 'Apple',
    category: 'Smartwatches',
    modelNumber: 'MR993HN/A',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
    description: 'S9 SiP chip with Double Tap gesture control, brighter 2000-nit Always-On Retina display, and on-device Siri.',
    specifications: {
      'Chipset': 'Apple S9 SiP with 4-core Neural Engine',
      'Display': 'Always-On Retina display, up to 2000 nits',
      'Health Sensors': 'Blood Oxygen sensor, ECG app, Temperature sensing',
      'Battery Life': '18 hours normal use, up to 36 hours Low Power Mode'
    },
    basePrice: 41999,
    originalPrice: 44900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CHX7XF6F',
      flipkart: 'https://www.flipkart.com/apple-watch-series-9-gps-45mm-midnight-aluminium-case-sport-band/p/itm3d735165fe00a',
      myntra: 'https://www.myntra.com/smart-watches/apple/apple-watch-series-9-gps-45mm-midnight-aluminium-case/25219484/buy',
      croma: 'https://www.croma.com/apple-watch-series-9-gps-45mm-midnight-aluminium-case-with-sport-band-m-l-/p/301389',
      'reliance-digital': 'https://www.reliancedigital.in/apple-watch-series-9-gps-45mm-midnight-aluminium-case-with-midnight-sport-band/p/493839841'
    }
  },
  {
    name: 'Samsung Galaxy Watch6 Classic Bluetooth 47mm (Black)',
    brand: 'Samsung',
    category: 'Smartwatches',
    modelNumber: 'SM-R960NZKAINU',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
    description: 'Timeless style with a rotating physical bezel, Sapphire Crystal glass, Body Composition analysis, and Sleep Coaching.',
    specifications: {
      'Bezel': 'Rotating stainless steel mechanical bezel',
      'Display': '1.5-inch Super AMOLED (480x480), Sapphire Crystal',
      'Sensors': 'BioActive Sensor (Optical Heart Rate + ECG + BIA)',
      'Durability': '5ATM + IP68 water/dust, MIL-STD-810H'
    },
    basePrice: 34999,
    originalPrice: 39999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CC9H5V38'
    }
  },
  {
    name: 'OnePlus Watch 2 (Wear OS, Dual-Engine Architecture)',
    brand: 'OnePlus',
    category: 'Smartwatches',
    modelNumber: 'OPWWE231',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'Wear OS by Google powered by Snapdragon W5 + BES2700 dual chipsets, offering up to 100 hours in Smart Mode.',
    specifications: {
      'Operating System': 'Wear OS by Google (Wear OS 4)',
      'Battery Life': 'Up to 100 hours Smart Mode / 12 days Power Saver',
      'Display': '1.43-inch AMOLED, 2.5D Sapphire Crystal',
      'GPS': 'Dual Frequency L1+L5 Precision GPS'
    },
    basePrice: 24999,
    originalPrice: 27999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CX21C26G'
    }
  },
  {
    name: 'boAt Wave Call 2 Smartwatch with Bluetooth Calling',
    brand: 'boAt',
    category: 'Smartwatches',
    modelNumber: 'WAVECALL2',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    description: '1.83-inch HD display smartwatch with crystal clear Bluetooth calling, 700+ active fitness modes, and live cricket scores.',
    specifications: {
      'Display': '1.83-inch HD Display (240x284), 550 nits',
      'Calling': 'Bluetooth Calling with dial pad & mic',
      'Sports Modes': '700+ active sports modes',
      'Battery': 'Up to 5 days standard battery'
    },
    basePrice: 1299,
    originalPrice: 6990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C77D5Q4S',
      flipkart: 'https://www.flipkart.com/boat-wave-call-2-smartwatch/p/itmde237f078d2c2',
      myntra: 'https://www.myntra.com/smart-watches/boat/boat-wave-call-2-smartwatch-with-bluetooth-calling/24182914/buy'
    }
  },
  {
    name: 'Apple Watch SE (2nd Gen, GPS 44mm, Starlight Aluminum)',
    brand: 'Apple',
    category: 'Smartwatches',
    modelNumber: 'MNKX3HN/A',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    description: 'Essential features for health and fitness, Crash Detection, swimproof design, and Retina display powered by S8 SiP.',
    specifications: {
      'Chipset': 'Apple S8 SiP with 64-bit dual-core processor',
      'Safety': 'Crash Detection, Fall Detection, Emergency SOS',
      'Water Resistance': '50 meters swimproof',
      'Battery': 'Up to 18 hours all-day battery'
    },
    basePrice: 27999,
    originalPrice: 32900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0BDK65L9V',
      flipkart: 'https://www.flipkart.com/apple-watch-se-2nd-gen-gps-44mm-starlight-aluminium-case-sport-band/p/itm28aa3742416b2',
      myntra: 'https://www.myntra.com/smart-watches/apple/apple-watch-se-2nd-gen-gps-44mm-starlight-aluminum/21984210/buy',
      croma: 'https://www.croma.com/apple-watch-se-2nd-generation-gps-44mm-starlight-aluminium-case-with-sport-band-m-l-/p/264350',
      'reliance-digital': 'https://www.reliancedigital.in/apple-watch-se-2nd-gen-gps-44mm-starlight-aluminium-case/p/493177820'
    }
  },

  // ==========================================
  // CATEGORY 5: TABLETS
  // ==========================================
  {
    name: 'Apple iPad (10th Generation, 10.9-inch, Wi-Fi 64GB, Blue)',
    brand: 'Apple',
    category: 'Tablets',
    modelNumber: 'MPQ13HN/A',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    description: 'All-screen design with 10.9-inch Liquid Retina display, A14 Bionic chip, landscape 12MP Ultra Wide camera, and USB-C.',
    specifications: {
      'Display': '10.9-inch Liquid Retina display with True Tone (2360x1640)',
      'Chipset': 'A14 Bionic chip with 4-core GPU',
      'Cameras': 'Landscape 12MP Ultra Wide front camera + 12MP Wide rear',
      'Accessory Support': 'Works with Apple Pencil (USB-C & 1st gen) and Magic Keyboard Folio'
    },
    basePrice: 34990,
    originalPrice: 39900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0BJMQPNBP',
      flipkart: 'https://www.flipkart.com/apple-ipad-10th-gen-64-gb-rom-10-9-inch-wi-fi-only-blue/p/itmd5da4e976a161',
      croma: 'https://www.croma.com/apple-ipad-10th-generation-10-9-inch-64gb-wi-fi-blue-/p/264335',
      'reliance-digital': 'https://www.reliancedigital.in/apple-ipad-10th-gen-10-9-inch-64-gb-wi-fi-blue-mpq13hn-a/p/493177750'
    }
  },
  {
    name: 'Samsung Galaxy Tab S9 FE (10.9-inch, 6GB RAM, 128GB, S-Pen Included, Gray)',
    brand: 'Samsung',
    category: 'Tablets',
    modelNumber: 'SM-X510NZAAINU',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
    description: 'Water and dust-resistant tablet with bundled in-box S Pen, 90Hz adaptive refresh display, and 8000mAh battery.',
    specifications: {
      'Display': '10.9-inch WQXGA (2304x1440) 90Hz Vision Booster',
      'Durability': 'IP68 water and dust resistant (tablet + S-Pen)',
      'Processor': 'Samsung Exynos 1380 (5nm)',
      'Battery': '8000 mAh with 45W super fast charging support'
    },
    basePrice: 34999,
    originalPrice: 44999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CJ3BLBPP'
    }
  },
  {
    name: 'Xiaomi Pad 6 (11-inch 2.8K 144Hz Display, Snapdragon 870, 8GB, 256GB)',
    brand: 'Xiaomi',
    category: 'Tablets',
    modelNumber: '23043RP34I',
    image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&auto=format&fit=crop&q=80',
    description: 'Flagship multimedia tablet with Snapdragon 870, 2.8K 144Hz 7-stage refresh display, and quad speakers with Dolby Atmos.',
    specifications: {
      'Display': '11-inch 2.8K (2880x1800) 144Hz 10-bit IPS display',
      'Processor': 'Qualcomm Snapdragon 870 (7nm)',
      'Audio': 'Quad stereo speakers with Dolby Atmos',
      'Battery': '8840 mAh with 33W fast charging'
    },
    basePrice: 28999,
    originalPrice: 39999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C6QR28F3'
    }
  },
  {
    name: 'Realme Pad 2 (11.5-inch 2K 120Hz Display, 6GB RAM, 128GB Storage, Wi-Fi+LTE)',
    brand: 'Realme',
    category: 'Tablets',
    modelNumber: 'RMP2204',
    image: 'https://images.unsplash.com/photo-1527690719158-9378619669c7?w=600&auto=format&fit=crop&q=80',
    description: 'Immersive entertainment tablet with 2K 120Hz display, 33W SUPERVOOC charge, 8360mAh battery, and quad speakers.',
    specifications: {
      'Display': '11.5-inch 2K (2000x1200) 120Hz ultra-smooth display',
      'Processor': 'MediaTek Helio G99 (6nm)',
      'Audio': 'Quad speakers with Dolby Atmos',
      'Connectivity': '4G LTE SIM slot + dual-band Wi-Fi'
    },
    basePrice: 17999,
    originalPrice: 28999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CFQW7J8H',
      flipkart: 'https://www.flipkart.com/realme-pad-2-6-gb-ram-128-rom-11-5-inch-wi-fi-4g-tablet-inspiration-green/p/itm5b0bc91ea0610'
    }
  },
  {
    name: 'Lenovo Tab M11 (11-inch WUXGA 90Hz, 8GB RAM, 128GB, with Pen, Seafoam Green)',
    brand: 'Lenovo',
    category: 'Tablets',
    modelNumber: 'ZADA0169IN',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    description: 'Learning and entertainment tablet bundled with Lenovo Tab Pen, 90Hz IPS screen, and quad speakers with Dolby Atmos.',
    specifications: {
      'Display': '11-inch WUXGA (1920x1200) IPS 90Hz 400 nits',
      'Processor': 'MediaTek Helio G88 octa-core',
      'Included Accessory': 'Lenovo Tab Pen with 4096 levels of pressure sensitivity',
      'Battery': '7040 mAh with up to 10 hours video playback'
    },
    basePrice: 16999,
    originalPrice: 31000,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CQ7L8F8J'
    }
  },

  // ==========================================
  // CATEGORY 6: TELEVISIONS
  // ==========================================
  {
    name: 'LG 55-inch 4K OLED evo C3 Smart TV (OLED55C3PSA)',
    brand: 'LG',
    category: 'Televisions',
    modelNumber: 'OLED55C3PSA',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    description: 'Self-lit OLED evo pixels powered by the alpha 9 AI Processor Gen6, Brightness Booster, Dolby Vision, and 120Hz gaming.',
    specifications: {
      'Display': '55-inch 4K Self-Lit OLED evo (3840 x 2160)',
      'Processor': 'alpha 9 AI Processor 4K Gen6',
      'Gaming Features': 'G-Sync, FreeSync, 0.1ms response time, 4x HDMI 2.1',
      'Operating System': 'webOS 23 with ThinQ AI and Magic Remote'
    },
    basePrice: 119990,
    originalPrice: 169990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C7JMGK2Q'
    }
  },
  {
    name: 'Sony Bravia 65-inch 4K Google TV (KD-65X80L)',
    brand: 'Sony',
    category: 'Televisions',
    modelNumber: 'KD-65X80L',
    image: 'https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=600&auto=format&fit=crop&q=80',
    description: '4K HDR TV with 4K HDR Processor X1, Triluminos Pro, Dolby Vision and Atmos, and hands-free Google TV voice control.',
    specifications: {
      'Display': '65-inch 4K Ultra HD (3840 x 2160) Triluminos Pro',
      'Processor': '4K HDR Processor X1 with 4K X-Reality PRO',
      'Audio': '20W X-Balanced Speaker with Dolby Atmos',
      'Smart TV': 'Google TV with Apple AirPlay and Chromecast built-in'
    },
    basePrice: 89990,
    originalPrice: 129900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C392J639'
    }
  },
  {
    name: 'Samsung 55-inch The Frame QLED 4K Smart TV (QA55LS03BAKLXL)',
    brand: 'Samsung',
    category: 'Televisions',
    modelNumber: 'QA55LS03BAK',
    image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=80',
    description: 'Transform your TV into a work of art with Matte Display, customizable bezel frame, Art Mode, and Quantum Dot color.',
    specifications: {
      'Display': '55-inch 4K QLED Matte Display (Anti-reflection)',
      'Processor': 'Quantum Processor 4K with AI Upscaling',
      'Special Features': 'Art Mode, Motion Sensor, One Connect Box, SolarCell Remote',
      'Color Volume': '100% Color Volume with Quantum Dot'
    },
    basePrice: 79990,
    originalPrice: 119900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0B55YJ9K9'
    }
  },
  {
    name: 'Xiaomi Smart TV X 55-inch 4K Dolby Vision Google TV',
    brand: 'Xiaomi',
    category: 'Televisions',
    modelNumber: 'L55M8-A2IN',
    image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    description: 'Bezel-less 4K screen with Dolby Vision, HDR10, Vivid Picture Engine, 30W stereo speakers, and Google TV.',
    specifications: {
      'Display': '55-inch 4K Ultra HD (3840x2160), 94% DCI-P3 wide color gamut',
      'Audio': '30W Stereo speakers with Dolby Audio & DTS-HD',
      'Platform': 'Google TV with PatchWall UI integration',
      'Hardware': 'Quad Core A55 processor, 2GB RAM + 8GB storage'
    },
    basePrice: 36999,
    originalPrice: 54999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CG6G9X1X'
    }
  },
  {
    name: 'Acer 55-inch Advanced I Series 4K Ultra HD Smart LED Google TV',
    brand: 'Acer',
    category: 'Televisions',
    modelNumber: 'AR55GR2851UDFL',
    image: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600&auto=format&fit=crop&q=80',
    description: 'Frameless 4K Google TV with 30W High Fidelity speakers, Dolby Vision, MEMC motion compensation, and dual-band Wi-Fi.',
    specifications: {
      'Display': '55-inch 4K UHD with 1.07 Billion Colors & MEMC',
      'Audio': '30W High Fidelity Speakers with Dolby Atmos',
      'Connectivity': '3x HDMI 2.1, 2x USB, Dual Band Wi-Fi',
      'OS': 'Google TV with personal profile recommendations'
    },
    basePrice: 31999,
    originalPrice: 49999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0C5627NDB'
    }
  },

  // ==========================================
  // CATEGORY 7: CAMERAS
  // ==========================================
  {
    name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera (Body Only)',
    brand: 'Sony',
    category: 'Cameras',
    modelNumber: 'ILCE-7M4',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    description: '33MP full-frame Exmor R CMOS sensor, 4K 60p 10-bit 4:2:2 recording, real-time Eye AF for humans/animals/birds.',
    specifications: {
      'Sensor': '33.0 MP 35mm full-frame back-illuminated Exmor R CMOS',
      'Video': '4K 60p recording in Super 35mm, 4K 30p 7K oversampling',
      'Image Stabilization': '5-axis in-body optical image stabilization (5.5 stops)',
      'Autofocus': '759 phase-detection AF points covering 94% of frame'
    },
    basePrice: 214990,
    originalPrice: 242490,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B09HN21D96'
    }
  },
  {
    name: 'Sony ZV-E10 Mirrorless Vlog Camera with 16-50mm Lens',
    brand: 'Sony',
    category: 'Cameras',
    modelNumber: 'ZV-E10L',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80',
    description: 'Interchangeable lens vlog camera featuring 24.2MP APS-C sensor, Product Showcase setting, Background Defocus, and directional mic.',
    specifications: {
      'Sensor': '24.2 MP APS-C Exmor CMOS sensor',
      'Screen': 'Side-opening vari-angle LCD touchscreen',
      'Microphone': 'Directional 3-capsule mic with supplied windscreen',
      'Video': '4K HDR movie recording with oversampled 6K resolution'
    },
    basePrice: 61490,
    originalPrice: 69990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B09B19C91L'
    }
  },
  {
    name: 'GoPro HERO12 Black Action Camera',
    brand: 'GoPro',
    category: 'Cameras',
    modelNumber: 'CHDHX-121-FW',
    image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&auto=format&fit=crop&q=80',
    description: 'Rugged waterproof action camera with 5.3K60 HDR video, Emmy-winning HyperSmooth 6.0 stabilization, and wireless audio support.',
    specifications: {
      'Video Resolution': '5.3K60, 4K120, 2.7K240 slo-mo',
      'Photo Resolution': '27MP photos with RAW capture',
      'Stabilization': 'HyperSmooth 6.0 with 360-degree Horizon Lock',
      'Waterproof': 'Waterproof to 33ft (10m) without housing'
    },
    basePrice: 37990,
    originalPrice: 45000,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CGJBHHP7'
    }
  },

  // ==========================================
  // CATEGORY 8: GAMING ACCESSORIES
  // ==========================================
  {
    name: 'Sony PlayStation 5 DualSense Wireless Controller (White)',
    brand: 'Sony',
    category: 'Gaming Accessories',
    modelNumber: 'CFI-ZCT1W',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&auto=format&fit=crop&q=80',
    description: 'Immersive haptic feedback, dynamic adaptive triggers, and a built-in microphone integrated into an iconic comfortable design.',
    specifications: {
      'Feedback': 'Dual actuators haptic feedback',
      'Triggers': 'Adaptive triggers with dynamic resistance levels',
      'Connectivity': 'Bluetooth and USB-C wired connection',
      'Compatibility': 'PS5, PC, Mac, Android, iOS'
    },
    basePrice: 5799,
    originalPrice: 6390,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B08FC6C75B',
      flipkart: 'https://www.flipkart.com/sony-playstation-5-dualsense-wireless-controller/p/itm4817a15998a44',
      croma: 'https://www.croma.com/sony-dualsense-wireless-controller-for-playstation-5-white-/p/230155',
      'reliance-digital': 'https://www.reliancedigital.in/sony-dualsense-wireless-controller-for-playstation-5/p/491936180'
    }
  },
  {
    name: 'Logitech G502 HERO High Performance Gaming Mouse',
    brand: 'Logitech',
    category: 'Gaming Accessories',
    modelNumber: '910-005472',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    description: 'HERO 25K optical sensor with sub-micron tracking, 11 programmable buttons, adjustable weights, and LIGHTSYNC RGB.',
    specifications: {
      'Sensor': 'HERO 25K Sensor (100 - 25,600 DPI, zero smoothing)',
      'Buttons': '11 customizable buttons with onboard memory',
      'Weights': 'Five 3.6g repositionable weights included',
      'Lighting': 'LIGHTSYNC RGB with approx 16.8 million colors'
    },
    basePrice: 3995,
    originalPrice: 5495,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B07GBZ4Q68'
    }
  },
  {
    name: 'ASUS ROG Strix Scope II 96 Wireless Mechanical Gaming Keyboard',
    brand: 'ASUS',
    category: 'Gaming Accessories',
    modelNumber: '90MP037A-BKUA01',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Compact 96% layout with hot-swappable pre-lubed ROG NX Snow switches, sound-dampening foam, and tri-mode connectivity.',
    specifications: {
      'Switches': 'ROG NX Snow mechanical switches (hot-swappable)',
      'Layout': '96% layout retaining all function and numeric keys',
      'Connectivity': 'Bluetooth 5.1, 2.4GHz SpeedNova RF, USB wired',
      'Keycaps': 'UV-coated ABS or doubleshot PBT keycaps'
    },
    basePrice: 14999,
    originalPrice: 19999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0CD7LMRCV'
    }
  },
  {
    name: 'Acer Nitro Gaming Headset with Omnidirectional Mic',
    brand: 'Acer',
    category: 'Gaming Accessories',
    modelNumber: 'NHW820',
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=600&auto=format&fit=crop&q=80',
    description: '50mm drivers delivering rich bass and clear spatial sound with an adjustable flexible boom mic and cushioned earcups.',
    specifications: {
      'Driver Diameter': '50 mm High Definition Drivers',
      'Microphone': 'Flexible omnidirectional noise-suppressing mic',
      'Jack': '3.5 mm gold-plated audio/mic splitter included',
      'Cushions': 'Breathable protein leather over-ear pads'
    },
    basePrice: 1999,
    originalPrice: 3499,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B08J3Z7B12'
    }
  },
  {
    name: 'boAt Immortal IM1000D Dual Channel Gaming Headset with Dolby Atmos',
    brand: 'boAt',
    category: 'Gaming Accessories',
    modelNumber: 'IM1000D',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    description: 'Dolby Atmos 7.1 channel virtual surround sound gaming headset with dual mics, breathing RGB LEDs, and remote audio control.',
    specifications: {
      'Surround Sound': 'Dolby Atmos & 7.1 Channel Surround Sound',
      'Drivers': '50 mm Neodymium audio drivers',
      'Microphones': 'Dual microphones with environmental noise cancellation',
      'Lighting': 'Dynamic breathing RGB LEDs on earcups'
    },
    basePrice: 2499,
    originalPrice: 5990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B097746P56'
    }
  },

  // ==========================================
  // CATEGORY 9: COMPUTER ACCESSORIES
  // ==========================================
  {
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    brand: 'Logitech',
    category: 'Computer Accessories',
    modelNumber: '910-006561',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    description: 'Remastered ergonomic mouse with Quiet Clicks, 8K DPI any-surface tracking, and MagSpeed electromagnetic scrolling.',
    specifications: {
      'Sensor': 'Darkfield 8000 DPI sensor (tracks on glass)',
      'Scroll Wheel': 'MagSpeed electromagnetic scrolling (1000 lines/sec)',
      'Battery': 'Up to 70 days on a full charge, 3 hours from 1-min charge',
      'Connectivity': 'Bluetooth Low Energy & Logi Bolt USB receiver'
    },
    basePrice: 8995,
    originalPrice: 10995,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B09HM94VDS'
    }
  },
  {
    name: 'Keychron K2 Pro QMK/VIA Wireless Mechanical Keyboard',
    brand: 'Keychron',
    category: 'Computer Accessories',
    modelNumber: 'K2P-H3',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Customizable 75% layout wireless mechanical keyboard with QMK/VIA support, hot-swappable switches, and RGB backlighting.',
    specifications: {
      'Layout': '75% compact (84 keys)',
      'Connectivity': 'Bluetooth 5.1 & Type-C wired mode',
      'Keycaps': 'OSA Profile double-shot PBT keycaps',
      'Compatibility': 'Mac, Windows, and Linux layouts included'
    },
    basePrice: 8499,
    originalPrice: 9999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0B579RGL9'
    }
  },
  {
    name: 'Anker 737 Power Bank (PowerCore 24K, 140W 3-Port Portable Charger)',
    brand: 'Anker',
    category: 'Computer Accessories',
    modelNumber: 'A1289',
    image: 'https://images.unsplash.com/photo-1609592426508-cc02797b5e40?w=600&auto=format&fit=crop&q=80',
    description: 'Ultra-powerful two-way fast charging power bank with smart digital display, 24000mAh capacity, and 140W max output.',
    specifications: {
      'Capacity': '24,000 mAh (86.4 Wh)',
      'Total Output': '140W Max across two USB-C and one USB-A port',
      'Display': 'Smart digital display showing output/input power and time',
      'Protection': 'ActiveShield 2.0 temperature monitoring'
    },
    basePrice: 9999,
    originalPrice: 14999,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B09VPHVT2Z'
    }
  },
  {
    name: 'Dell Pro Wireless Keyboard and Mouse Combo (KM5221W)',
    brand: 'Dell',
    category: 'Computer Accessories',
    modelNumber: 'KM5221W',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Full-sized quiet keyboard with programmable shortcut keys and high-precision optical mouse with up to 36 months battery life.',
    specifications: {
      'Wireless Connection': '2.4 GHz RF with 128-bit AES encryption',
      'Battery Life': 'Up to 36 months battery life',
      'Mouse DPI': 'Up to 4000 DPI adjustable with Dell Peripheral Manager',
      'Keyboard Keys': 'Plunger keys with dedicated mute/volume shortcuts'
    },
    basePrice: 2299,
    originalPrice: 3299,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B08NPY9Z67'
    }
  },
  {
    name: 'HP Wireless Mouse 250 with 1600 DPI Optical Sensor',
    brand: 'HP',
    category: 'Computer Accessories',
    modelNumber: '250-MOUSE',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    description: 'Contoured ambidextrous wireless mouse with up to 12 months battery life and reliable 2.4GHz wireless connectivity.',
    specifications: {
      'Sensor': '1600 DPI optical sensor',
      'Wireless Range': 'Up to 10 meters (30 feet)',
      'Design': 'Ambidextrous contoured grip with textured sides',
      'Battery': '1 AA battery included (up to 12 months)'
    },
    basePrice: 699,
    originalPrice: 1299,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B084G471C2'
    }
  },
  {
    name: 'Lenovo 500 FHD Webcam with Privacy Shutter and Windows Hello',
    brand: 'Lenovo',
    category: 'Computer Accessories',
    modelNumber: 'GXC0X89715',
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&auto=format&fit=crop&q=80',
    description: 'Full HD 1080p USB video camera with infrared facial recognition login, 75-degree wide view, and 360-degree pan tilt.',
    specifications: {
      'Video Resolution': 'Full HD 1080p (1920 x 1080) at 30 fps',
      'Biometric Login': 'Windows Hello facial recognition compliant',
      'Privacy': 'Integrated physical slide privacy shutter',
      'Mounting': 'Universal tripod clip and monitor mount'
    },
    basePrice: 3999,
    originalPrice: 6990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B08BKV3GKB'
    }
  },

  // ==========================================
  // CATEGORY 10: HOME APPLIANCES
  // ==========================================
  {
    name: 'Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner',
    brand: 'Dyson',
    category: 'Home Appliances',
    modelNumber: 'V12-SLIM',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
    description: 'Laser reveals microscopic dust with acoustic piezo sensor particle measurement, single-button power control, and 60-min runtime.',
    specifications: {
      'Suction Power': '150 Air Watts with Dyson Hyperdymium motor',
      'Runtime': 'Up to 60 minutes fade-free power',
      'Filtration': 'Whole-machine filtration capturing 99.99% particles down to 0.3 microns',
      'Weight': '2.2 kg'
    },
    basePrice: 45900,
    originalPrice: 55900,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B09F9Z8V1R'
    }
  },
  {
    name: 'Philips Air Fryer XXL 1.4kg (HD9650/96)',
    brand: 'Philips',
    category: 'Home Appliances',
    modelNumber: 'HD9650/96',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    description: 'Twin TurboStar technology captures excess fat with XXL family-size capacity fitting a whole chicken or 1.4kg fries.',
    specifications: {
      'Capacity': '1.4 kg / 7.3 Liters XXL capacity',
      'Power': '2225 W with instant heat-up',
      'Fat Removal': 'Twin TurboStar technology extracts and traps fat',
      'Presets': '5 preset cooking programs with digital touchscreen'
    },
    basePrice: 18495,
    originalPrice: 24995,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B07R4X749Q'
    }
  },
  {
    name: 'LG 9 Kg 5 Star AI Direct Drive Front Load Washing Machine',
    brand: 'LG',
    category: 'Home Appliances',
    modelNumber: 'FHP1409Z9B',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
    description: 'AI Direct Drive with 6 Motion technology detects fabric softness, Steam wash for allergy care, and TurboWash 360.',
    specifications: {
      'Capacity': '9.0 kg wash capacity (ideal for large families)',
      'Energy Rating': '5 Star energy efficiency certified',
      'Motor': 'Inverter Direct Drive with 1400 RPM spin speed',
      'Hygiene': 'Steam wash removes 99.9% allergens'
    },
    basePrice: 38990,
    originalPrice: 53990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B08V5CJ96T'
    }
  },
  {
    name: 'LG 242 L 3 Star Smart Inverter Frost-Free Double Door Refrigerator',
    brand: 'LG',
    category: 'Home Appliances',
    modelNumber: 'GL-I292RPZX',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    description: 'Multi Air Flow cooling with Smart Inverter Compressor, Door Cooling+, anti-bacterial gasket, and toughened glass shelves.',
    specifications: {
      'Capacity': '242 Liters (Freezer 61L, Fresh Food 181L)',
      'Compressor': 'Smart Inverter with 10-year warranty',
      'Cooling Technology': 'Door Cooling+ and Multi Air Flow',
      'Energy Rating': '3 Star Energy Rating'
    },
    basePrice: 25990,
    originalPrice: 37099,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B0915993Q2'
    }
  },
  {
    name: 'Samsung 28 L Convection Microwave Oven (Slim Fry)',
    brand: 'Samsung',
    category: 'Home Appliances',
    modelNumber: 'CE1041DSB2',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=80',
    description: 'Slim Fry technology allows oil-free frying with Tandoor and Curd making presets and Ceramic Enamel cavity with 10-year warranty.',
    specifications: {
      'Capacity': '28 Liters convection',
      'Cavity': 'Ceramic Enamel interior (scratch resistant and anti-bacterial)',
      'Modes': 'Convection, Grill, Microwave, Slim Fry, Roti/Naan',
      'Auto Cook Menus': 'Indian recipe presets with deodorization mode'
    },
    basePrice: 11990,
    originalPrice: 16990,
    verifiedUrls: {
      amazon: 'https://www.amazon.in/dp/B07N8Z78XF'
    }
  }
];

const { validateStoreProductUrl } = require('./urlValidator');

// Helper to determine exact product listing details:
// Only verified exact product detail URLs are stored.
// If unavailable, productUrl is null and isExactProductUrl is false.
// SEARCH-QUERY URLs ARE STRICTLY FORBIDDEN.
function getStoreExactProductListing(product, storeSlug) {
  if (product.verifiedUrls && product.verifiedUrls[storeSlug]) {
    const rawUrl = product.verifiedUrls[storeSlug];
    const validation = validateStoreProductUrl(storeSlug, rawUrl);
    if (validation.isValid && validation.isExactProductUrl) {
      return {
        productUrl: validation.canonicalUrl,
        storeProductId: validation.storeProductId,
        isExactProductUrl: true,
        urlType: 'exact_product',
        urlVerifiedAt: new Date()
      };
    }
  }

  // Exact product detail page unavailable: NEVER generate search URL or homepage fallback
  return {
    productUrl: null,
    storeProductId: null,
    isExactProductUrl: false,
    urlType: 'unavailable',
    urlVerifiedAt: null
  };
}

async function seedDatabase() {
  console.log('============================================================');
  console.log('[Seed] Starting PriceTrack Database Seeding...');
  console.log('============================================================');

  await connectDB();
  const db = getDB();

  // 1. Upsert Administrator and Test Users (PRESERVE existing user credentials!)
  console.log('[Seed] Checking Administrator and Test Users...');
  let adminUser = await db.collection('users').findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!adminUser) {
    const adminPasswordHash = await hashPassword(ADMIN_PASSWORD);
    const adminRes = await db.collection('users').insertOne({
      name: 'PriceTrack Administrator',
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    adminUser = { _id: adminRes.insertedId };
    console.log(`[Seed] Admin user created: ${ADMIN_EMAIL}`);
  } else {
    console.log(`[Seed] Preserved existing admin user: ${ADMIN_EMAIL}`);
  }

  let demoUser = await db.collection('users').findOne({ email: DEMO_USER_EMAIL.toLowerCase() });
  if (!demoUser) {
    const userPasswordHash = await hashPassword(DEMO_USER_PASSWORD);
    const demoRes = await db.collection('users').insertOne({
      name: 'Suresh Kumar',
      email: DEMO_USER_EMAIL.toLowerCase(),
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    demoUser = { _id: demoRes.insertedId };
    console.log(`[Seed] Demo user created: ${DEMO_USER_EMAIL}`);
  } else {
    console.log(`[Seed] Preserved existing demo user: ${DEMO_USER_EMAIL}`);
  }

  // 2. Upsert Stores (PRESERVE existing store IDs!)
  console.log('[Seed] Synchronizing Stores...');
  const storeMap = {};
  for (const store of STORES_DATA) {
    const existing = await db.collection('stores').findOne({ storeSlug: store.storeSlug });
    if (existing) {
      await db.collection('stores').updateOne(
        { _id: existing._id },
        { $set: { storeName: store.storeName, storeLogo: store.storeLogo, website: store.website, isActive: true } }
      );
      storeMap[store.storeSlug] = existing;
    } else {
      const res = await db.collection('stores').insertOne({
        ...store,
        createdAt: new Date()
      });
      storeMap[store.storeSlug] = { _id: res.insertedId, ...store };
    }
  }
  console.log(`[Seed] Verified ${Object.keys(storeMap).length} stores.`);

  // 3. Upsert Products, Store Listings, and Historical Price Points
  console.log(`[Seed] Synchronizing ${PRODUCTS_DATA.length} products across 10 categories...`);
  const now = new Date();
  let addedCount = 0;
  let updatedCount = 0;

  for (const productData of PRODUCTS_DATA) {
    const { basePrice, originalPrice, verifiedUrls, ...pInfo } = productData;

    // Check if product exists by modelNumber (or exact name fallback)
    let existingProd = await db.collection('products').findOne({
      $or: [
        { modelNumber: productData.modelNumber },
        { name: productData.name }
      ]
    });

    let productId;
    if (existingProd) {
      productId = existingProd._id;
      await db.collection('products').updateOne(
        { _id: productId },
        {
          $set: {
            name: pInfo.name,
            brand: pInfo.brand,
            category: pInfo.category,
            image: pInfo.image,
            description: pInfo.description,
            specifications: pInfo.specifications,
            modelNumber: pInfo.modelNumber,
            verifiedUrls: verifiedUrls || {},
            basePrice: basePrice,
            originalPrice: originalPrice,
            updatedAt: now
          }
        }
      );
      updatedCount++;
    } else {
      const pDoc = {
        ...pInfo,
        verifiedUrls: verifiedUrls || {},
        basePrice: basePrice,
        originalPrice: originalPrice,
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: now
      };
      const pRes = await db.collection('products').insertOne(pDoc);
      productId = pRes.insertedId;
      addedCount++;
    }

    // Determine store listings for this product
    // For fashion/wearables (Headphones, Smartwatches): include Myntra
    // For other electronics: use Amazon, Flipkart, Croma, Reliance Digital
    let chosenStoreSlugs = ['amazon', 'flipkart', 'croma', 'reliance-digital'];
    if (['Headphones', 'Smartwatches'].includes(productData.category)) {
      chosenStoreSlugs.push('myntra');
    }

    // Pre-calculated realistic price variations
    const offsets = [0, -0.015, 0.02, 0.035, -0.025];
    const deliveryOptions = [
      'FREE Prime delivery in 2-4 days',
      'FREE delivery in 1-3 days',
      'Standard delivery in 3-5 days',
      'Express store pickup in 24 hours',
      'Guaranteed delivery in 2 days'
    ];

    for (let sIdx = 0; sIdx < chosenStoreSlugs.length; sIdx++) {
      const slug = chosenStoreSlugs[sIdx];
      const storeObj = storeMap[slug];
      if (!storeObj) continue;

      const exactInfo = getStoreExactProductListing(productData, slug);
      const offset = offsets[sIdx % offsets.length];
      const simPrice = Math.round((basePrice * (1 + offset)) / 10) * 10;
      const delivery = deliveryOptions[sIdx % deliveryOptions.length];

      // Upsert store listing
      await db.collection('storeListings').updateOne(
        {
          productId: new ObjectId(productId),
          storeId: new ObjectId(storeObj._id)
        },
        {
          $set: {
            productUrl: exactInfo.productUrl,
            storeProductId: exactInfo.storeProductId,
            isExactProductUrl: exactInfo.isExactProductUrl,
            urlType: exactInfo.urlType,
            urlVerifiedAt: exactInfo.urlVerifiedAt,
            currentPrice: simPrice,
            originalPrice: originalPrice || Math.round(simPrice * 1.15),
            availability: exactInfo.isExactProductUrl ? 'In Stock' : 'Check Store Availability',
            deliveryInformation: delivery,
            sourceType: 'demo_feed',
            lastUpdated: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        { upsert: true }
      );

      // Check if price history exists for this product and store
      const histCount = await db.collection('priceHistory').countDocuments({
        productId: new ObjectId(productId),
        storeId: new ObjectId(storeObj._id)
      });

      // Only generate initial 90-day history if no history exists yet (PRESERVE existing price history!)
      if (histCount === 0) {
        const historyRecords = [];
        for (let daysAgo = 90; daysAgo >= 0; daysAgo -= 3) {
          const recordDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          let historyPrice;

          if (daysAgo === 0) {
            historyPrice = simPrice; // Today's price matches current listing
          } else {
            const variance = 1 + ((Math.sin(daysAgo / 8) * 0.04) + (Math.cos(daysAgo / 12) * 0.02));
            historyPrice = Math.round((simPrice * variance) / 10) * 10;
          }

          historyRecords.push({
            productId: new ObjectId(productId),
            storeId: new ObjectId(storeObj._id),
            price: historyPrice,
            recordedAt: recordDate
          });
        }

        if (historyRecords.length > 0) {
          await db.collection('priceHistory').insertMany(historyRecords);
        }
      }
    }
  }

  // Strict cleanup: Invalidate any old records that contain search-query URLs or bare homepages
  const cleanupRes = await db.collection('storeListings').updateMany(
    {
      $or: [
        { productUrl: { $regex: '/search', $options: 'i' } },
        { productUrl: { $regex: '/s\\?k=', $options: 'i' } },
        { productUrl: { $regex: 'dsearch', $options: 'i' } },
        { productUrl: { $regex: 'searchB', $options: 'i' } },
        { productUrl: { $in: ['https://www.amazon.in', 'https://www.flipkart.com', 'https://www.croma.com', 'https://www.reliancedigital.in', 'https://www.myntra.com'] } }
      ]
    },
    {
      $set: {
        productUrl: null,
        storeProductId: null,
        isExactProductUrl: false,
        urlType: 'unavailable',
        urlVerifiedAt: null
      }
    }
  );
  console.log(`[Seed] Purged ${cleanupRes.modifiedCount} outdated search-query listings from database.`);

  // 4. Preserve existing user watchlist items and alerts; insert initial sample if none exists
  const firstProduct = await db.collection('products').findOne({ modelNumber: 'WH1000XM5' });
  if (firstProduct && demoUser) {
    const existingWatch = await db.collection('watchlists').findOne({
      userId: demoUser._id,
      productId: firstProduct._id
    });
    if (!existingWatch) {
      await db.collection('watchlists').insertOne({
        userId: demoUser._id,
        productId: firstProduct._id,
        targetPrice: 28000,
        isActive: true,
        createdAt: now
      });
    }

    const existingAlert = await db.collection('priceAlerts').findOne({
      userId: demoUser._id,
      productId: firstProduct._id
    });
    if (!existingAlert) {
      await db.collection('priceAlerts').insertOne({
        userId: demoUser._id,
        productId: firstProduct._id,
        targetPrice: 28000,
        alertStatus: 'active',
        lastNotifiedPrice: null,
        lastNotifiedAt: null,
        createdAt: now,
        updatedAt: now
      });
    }
  }

  const finalProductCount = await db.collection('products').countDocuments();
  const finalListingCount = await db.collection('storeListings').countDocuments();
  const finalCategories = await db.collection('products').distinct('category');
  const finalBrands = await db.collection('products').distinct('brand');

  console.log('------------------------------------------------------------');
  console.log('[Seed] Database synchronization completed successfully!');
  console.log(`[Seed] Total Products: ${finalProductCount} (${addedCount} added, ${updatedCount} updated)`);
  console.log(`[Seed] Total Store Listings: ${finalListingCount}`);
  console.log(`[Seed] Categories (${finalCategories.length}):`, finalCategories);
  console.log(`[Seed] Brands (${finalBrands.length}):`, finalBrands);
  console.log('------------------------------------------------------------');

  await closeDB();
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Seed] Error seeding database:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
