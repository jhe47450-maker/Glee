// Configuration constants - centralized
export const CONFIG = {
  // API Base - Automatically detect environment
  API_BASE: getAPIBase(),
  REQUEST_TIMEOUT: 10000,
  PRODUCT_PRICE: 25.00,
  TOPPING_PRICES: {
    none: 0.00,
    ube: 3.00,
    crashed_graham: 2.00
  },
  REVIEWS_STORAGE_KEY: 'gleejeyly_reviews',
  TOAST_DURATION: 3000,
  CACHE_KEYS: {
    REVIEWS: 'gleejeyly_reviews_cache',
    ORDERS: 'gleejeyly_orders_cache'
  },
  TIMEOUTS: {
    REQUEST: 10000,
    TOAST: 3000,
    ANIMATION: 300
  }
};

// Get API Base URL based on environment
function getAPIBase() {
  // 1. Check environment variable (build-time)
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // 2. Check if running on Replit
  if (window.location.hostname.includes('replit.dev')) {
    return `${window.location.origin}/api`;
  }

  // 3. Check if running on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    // GitHub Pages frontend might have backend elsewhere
    return import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
  }

  // 4. Check for running on Vercel
  if (window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }

  // 5. Local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  // 6. Fallback
  return `${window.location.origin}/api`;
}

// Feature detection
export const FEATURES = {
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTouchDevice: () => (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)),
  supportsServiceWorker: () => 'serviceWorker' in navigator,
  supportsLocalStorage: () => {
    try {
      localStorage.setItem('test', '1');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Init guards - prevent double-binding
export const initGuards = {
  mobile: false,
  navigation: false,
  faq: false,
  orderForm: false,
  reviews: false
};
