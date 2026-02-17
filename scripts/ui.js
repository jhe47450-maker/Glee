import { CONFIG } from './config.js';

// Toast notifications with accessibility
export function showToast(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), CONFIG.TIMEOUTS.ANIMATION);
  }, duration);
}

// Modal utilities with accessibility
export class Modal {
  constructor(selector) {
    this.modal = document.querySelector(selector);
    this.backdrop = this.modal?.querySelector('.modal-backdrop');
    this.setupA11y();
  }

  setupA11y() {
    if (this.modal) {
      this.modal.setAttribute('role', 'dialog');
      this.modal.setAttribute('aria-modal', 'true');
      this.modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.hide();
      });
    }
  }

  show(content = null) {
    if (!this.modal) return;
    
    if (content) {
      const body = this.modal.querySelector('.modal-body');
      if (body) body.innerHTML = content;
    }

    this.modal.classList.add('show');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    if (!this.modal) return;
    
    this.modal.classList.remove('show');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle() {
    this.modal.classList.contains('show') ? this.hide() : this.show();
  }
}

// Form utilities with validation
export class FormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.errors = new Map();
    this.setupValidation();
  }

  setupValidation() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => {
      if (!this.validate()) {
        e.preventDefault();
      }
    });

    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    let error = null;

    // Required check
    if (field.hasAttribute('required') && !value) {
      error = `${field.labels?.[0]?.textContent || name} is required`;
    }
    // Email validation
    else if (field.type === 'email' && value && !this.isValidEmail(value)) {
      error = 'Invalid email address';
    }
    // Phone validation
    else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
      error = 'Invalid phone number';
    }
    // Min length
    else if (field.minLength && value.length < field.minLength) {
      error = `Minimum ${field.minLength} characters required`;
    }

    this.setFieldError(field, error);
    return !error;
  }

  validate() {
    let isValid = true;
    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  }

  setFieldError(field, error) {
    const errorEl = field.parentElement?.querySelector('.error-msg');
    if (errorEl) {
      errorEl.textContent = error || '';
      field.setAttribute('aria-invalid', error ? 'true' : 'false');
    }
    this.errors.set(field.name, error);
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^\d{10,}$/.test(phone.replace(/\D/g, ''));
  }

  getData() {
    const formData = new FormData(this.form);
    return Object.fromEntries(formData);
  }

  reset() {
    this.form.reset();
    this.errors.clear();
  }
}

// Accessible dropdown/menu
export class AccessibleMenu {
  constructor(triggerSelector, menuSelector) {
    this.trigger = document.querySelector(triggerSelector);
    this.menu = document.querySelector(menuSelector);
    this.setupA11y();
  }

  setupA11y() {
    if (!this.trigger || !this.menu) return;

    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.menu.setAttribute('role', 'navigation');

    this.trigger.addEventListener('click', () => this.toggle());
    document.addEventListener('click', (e) => {
      if (!this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
        this.close();
      }
    });

    // Keyboard navigation
    this.menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateMenu(e.key === 'ArrowDown' ? 1 : -1);
      }
    });
  }

  toggle() {
    this.trigger.getAttribute('aria-expanded') === 'true' ? this.close() : this.open();
  }

  open() {
    this.menu.classList.add('open');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.menu.querySelectorAll('a')[0]?.focus();
  }

  close() {
    this.menu.classList.remove('open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.focus();
  }

  navigateMenu(direction) {
    const links = Array.from(this.menu.querySelectorAll('a'));
    const current = document.activeElement;
    const index = links.indexOf(current);
    const nextIndex = (index + direction + links.length) % links.length;
    links[nextIndex]?.focus();
  }
}
