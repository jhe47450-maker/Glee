// Main entry point with modern modular approach
import { FEATURES, initGuards } from './config.js';
import { setupLazyLoading, setupLoadingIndicator } from './utils.js';
import { reportWebVitals, PerformanceMonitor } from './performance.js';
import { initNavigation, initMobileOptimizations, initFAQ } from './modules/navigation.js';
import { initOrderForm } from './modules/orders.js';
import { loadReviews, initReviewForm } from './modules/reviews.js';
import { registerServiceWorker } from './pwa.js';

// Async initialization
async function initApp() {
  try {
    // Start performance tracking
    const endMeasure = PerformanceMonitor.markResourceTiming();
    
    // Setup loading state
    setupLoadingIndicator();
    
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    // Initialize core features
    if (!initGuards.mobile) {
      initMobileOptimizations();
      initGuards.mobile = true;
    }

    if (!initGuards.navigation) {
      initNavigation();
      initGuards.navigation = true;
    }

    // Initialize page-specific features
    if (document.querySelector('.faq') && !initGuards.faq) {
      initFAQ();
      initGuards.faq = true;
    }

    if (document.getElementById('orderForm') && !initGuards.orderForm) {
      initOrderForm();
      initGuards.orderForm = true;
    }

    // Load reviews
    const reviewsContainer = document.querySelector('[data-reviews]');
    if (reviewsContainer && !initGuards.reviews) {
      await loadReviews();
      initReviewForm();
      initGuards.reviews = true;
    }

    // Setup lazy loading for images
    setupLazyLoading();

    // Register Service Worker for offline support
    if (FEATURES.supportsServiceWorker()) {
      await registerServiceWorker();
    }

    // Report Web Vitals
    reportWebVitals();

    // End performance measurement
    endMeasure?.();

  } catch (error) {
    console.error('App initialization error:', error);
  } finally {
    document.documentElement.classList.add('app-ready');
  }
}

// Start the app
initApp();

// Graceful error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
