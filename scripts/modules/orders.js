// Orders module
import { CONFIG } from '../config.js';
import { secureFetch, CacheManager } from '../utils.js';
import { showToast, FormValidator, Modal } from '../ui.js';

const ordersCache = new CacheManager(CONFIG.CACHE_KEYS.ORDERS);
let lastOrder = null;

export class OrderForm {
  constructor() {
    this.form = document.getElementById('orderForm');
    this.validator = new FormValidator('#orderForm');
    this.quantity = 1;
    this.toppings = ['none'];
    this.init();
  }

  init() {
    if (!this.form) return;

    this.setupQuantityControls();
    this.setupToppingSelects();
    this.setupFormSubmit();
    this.updatePrice();
  }

  setupQuantityControls() {
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyValue = document.getElementById('quantityValue');

    qtyMinus?.addEventListener('click', () => {
      this.quantity = Math.max(1, this.quantity - 1);
      if (qtyValue) qtyValue.value = this.quantity;
      this.updatePrice();
    });

    qtyPlus?.addEventListener('click', () => {
      this.quantity += 1;
      if (qtyValue) qtyValue.value = this.quantity;
      this.updatePrice();
    });

    qtyValue?.addEventListener('change', (e) => {
      this.quantity = Math.max(1, parseInt(e.target.value) || 1);
      this.updatePrice();
    });
  }

  setupToppingSelects() {
    const toppingSelects = document.querySelectorAll('[name="topping"]');
    toppingSelects.forEach(select => {
      select.addEventListener('change', () => {
        this.toppings = Array.from(toppingSelects)
          .filter(s => s.checked)
          .map(s => s.value);
        this.updatePrice();
      });
    });
  }

  updatePrice() {
    const basePrice = CONFIG.PRODUCT_PRICE * this.quantity;
    const toppingPrice = this.toppings.reduce((sum, topping) => {
      return sum + (CONFIG.TOPPING_PRICES[topping] || 0);
    }, 0) * this.quantity;

    const total = basePrice + toppingPrice;
    const totalDisplay = document.getElementById('totalPrice');
    if (totalDisplay) {
      totalDisplay.textContent = `₱${total.toFixed(2)}`;
    }
  }

  setupFormSubmit() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!this.validator.validate()) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      const orderData = {
        ...this.validator.getData(),
        quantity: this.quantity,
        toppings: this.toppings,
        total_price: this.calculateTotal(),
        order_date: new Date().toISOString()
      };

      await this.submitOrder(orderData);
    });
  }

  calculateTotal() {
    const basePrice = CONFIG.PRODUCT_PRICE * this.quantity;
    const toppingPrice = this.toppings.reduce((sum, topping) => {
      return sum + (CONFIG.TOPPING_PRICES[topping] || 0);
    }, 0) * this.quantity;
    return basePrice + toppingPrice;
  }

  async submitOrder(orderData) {
    try {
      showToast('Submitting order...', 'info');
      
      const res = await secureFetch(`${CONFIG.API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const result = await res.json();
        lastOrder = orderData;
        ordersCache.set(orderData);
        
        this.showConfirmation(orderData);
        this.form.reset();
        this.quantity = 1;
        this.updatePrice();
        
        showToast('Order submitted successfully!', 'success');
      } else {
        showToast('Failed to submit order. Please try again.', 'error');
      }
    } catch (e) {
      console.error('Order submission error:', e);
      showToast('Error submitting order', 'error');
    }
  }

  showConfirmation(orderData) {
    const modal = new Modal('#site-modal');
    const content = `
      <div class="confirmation">
        <h3>Order Confirmed!</h3>
        <p>Thank you for your order, <strong>${orderData.full_name}</strong></p>
        <div class="order-summary">
          <p>Quantity: ${orderData.quantity}</p>
          <p>Toppings: ${orderData.toppings.join(', ')}</p>
          <p>Total: ₱${orderData.total_price.toFixed(2)}</p>
          <p>We'll contact you at ${orderData.phone_number} to arrange delivery.</p>
        </div>
      </div>
    `;
    modal.show(content);
  }
}

export function initOrderForm() {
  return new OrderForm();
}
