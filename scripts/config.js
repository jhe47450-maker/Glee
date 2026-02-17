// Configuration constants - centralized
export const CONFIG = {
  // API Base - use environment variable or default to Railway
  API_BASE: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
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
