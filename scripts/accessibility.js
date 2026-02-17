// Accessibility module
export class AccessibilityManager {
  constructor() {
    this.focusableElements = 'button, a, input, select, textarea, [tabindex]';
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupSkipLinks();
    this.setupFocusIndicators();
    this.setupLiveRegions();
    this.setupPreferredMotion();
  }

  // Keyboard navigation with trap focus in modals
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Tab key focus management
      if (e.key === 'Tab' && this.isModalOpen()) {
        const modal = document.querySelector('[role="dialog"].show');
        if (modal) {
          this.trapFocus(e, modal);
        }
      }

      // Escape to close modal
      if (e.key === 'Escape' && this.isModalOpen()) {
        const modal = document.querySelector('[role="dialog"].show');
        modal?.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  trapFocus(e, element) {
    const focusable = Array.from(element.querySelectorAll(this.focusableElements))
      .filter(el => !el.hasAttribute('disabled'));

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Skip to main content links
  setupSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.setAttribute('aria-label', 'Skip to main content');
    document.body.insertBefore(skipLink, document.body.firstChild);

    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      mainContent.setAttribute('id', 'main');
    }
  }

  // Enhanced focus indicators
  setupFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      *:focus-visible {
        outline: 3px solid #E8704F;
        outline-offset: 2px;
      }
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #E8704F;
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
      }
      
      .skip-link:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // ARIA live regions for dynamic updates
  setupLiveRegions() {
    let statusRegion = document.querySelector('[role="status"]');
    if (!statusRegion) {
      statusRegion = document.createElement('div');
      statusRegion.setAttribute('role', 'status');
      statusRegion.setAttribute('aria-live', 'polite');
      statusRegion.setAttribute('aria-atomic', 'true');
      statusRegion.style.display = 'none';
      document.body.appendChild(statusRegion);
    }
    window.ariaLiveRegion = statusRegion;
  }

  announceLive(message) {
    if (window.ariaLiveRegion) {
      window.ariaLiveRegion.textContent = message;
    }
  }

  // Respect prefers-reduced-motion
  setupPreferredMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.scrollBehavior = 'auto';
      
      const styles = document.createElement('style');
      styles.textContent = `
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  isModalOpen() {
    return !!document.querySelector('[role="dialog"].show');
  }

  // Announce changes to screen readers
  static announce(message, priority = 'polite') {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.textContent = message;
    
    document.body.appendChild(region);
    setTimeout(() => region.remove(), 1000);
  }

  // Check color contrast (dev tool)
  static checkContrast(element) {
    const color = window.getComputedStyle(element).color;
    const bgColor = window.getComputedStyle(element).backgroundColor;
    console.log(`Element: ${element.tagName}`, { color, bgColor });
  }
}

// Auto-init accessibility
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityManager();
  });
} else {
  new AccessibilityManager();
}
