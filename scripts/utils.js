import { CONFIG } from './config.js';

// Performance: Lazy load images
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  }
}

// Fetch with timeout & retry
export async function secureFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Security: HTML escape to prevent XSS
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Debounce utility for performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Cache utility with TTL
export class CacheManager {
  constructor(key) {
    this.key = key;
  }

  set(data, ttlSeconds = 3600) {
    try {
      localStorage.setItem(this.key, JSON.stringify({
        data,
        expires: Date.now() + (ttlSeconds * 1000)
      }));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }

  get() {
    try {
      const cached = localStorage.getItem(this.key);
      if (!cached) return null;

      const item = JSON.parse(cached);
      if (Date.now() > item.expires) {
        localStorage.removeItem(this.key);
        return null;
      }
      return item.data;
    } catch (e) {
      return null;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  }
}

// Performance: Request animation frame helper
export function onNextFrame(callback) {
  if (requestAnimationFrame) {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16);
  }
}

// DOM Ready helper
export function onDOMReady(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

// Loading indicator for better UX
export function setupLoadingIndicator() {
  const style = document.createElement('style');
  style.textContent = `
    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(to right, #E8704F, #FF9D5C);
      width: 0;
      z-index: 9999;
      animation: progress 2.5s ease;
    }
    @keyframes progress {
      0% { width: 10%; }
      50% { width: 60%; }
      100% { width: 100%; opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'loading-bar';
  document.body.appendChild(bar);

  setTimeout(() => bar.remove(), 2500);
}
