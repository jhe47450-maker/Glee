// Performance monitoring and metrics
export class PerformanceMonitor {
  static measure(label, fn) {
    if (!window.performance) return fn();

    const start = performance.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        });
      } else {
        const duration = performance.now() - start;
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        return result;
      }
    } catch (e) {
      const duration = performance.now() - start;
      console.error(`⏱️ ${label}: ${duration.toFixed(2)}ms (error)`, e);
      throw e;
    }
  }

  static timing() {
    if (!window.performance) return {};

    const timing = performance.getEntriesByType('navigation')[0];
    return timing ? {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domparsed: timing.domInteractive - timing.domLoading,
      interactive: timing.domContentLoadedEventEnd - timing.domLoading,
      complete: timing.loadEventEnd - timing.domLoading
    } : {};
  }

  static report() {
    const metrics = this.timing();
    console.table(metrics);
    console.log(`Total Load Time: ${metrics.complete}ms`);
  }

  static markResourceTiming() {
    if (!window.performance?.mark) return;

    // Mark critical moments
    performance.mark('app-init-start');
    
    return () => {
      performance.mark('app-init-end');
      performance.measure('app-init', 'app-init-start', 'app-init-end');
      const measure = performance.getEntriesByName('app-init')[0];
      console.log(`App initialization: ${measure.duration.toFixed(2)}ms`);
    };
  }
}

// Memory and heap monitoring (development only)
export function monitorMemory() {
  if (!performance.memory) return;

  const initialMemory = performance.memory.usedJSHeapSize;
  
  return () => {
    const currentMemory = performance.memory.usedJSHeapSize;
    const delta = (currentMemory - initialMemory) / 1024 / 1024;
    console.log(`Memory delta: ${delta.toFixed(2)}MB`);
  };
}

// Report Web Vitals
export function reportWebVitals() {
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    try {
      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        console.log('CLS:', cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }

    try {
      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('FID:', entry.processingDuration);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported (being replaced by INP)
    }
  }
}

export default {
  PerformanceMonitor,
  monitorMemory,
  reportWebVitals
};
