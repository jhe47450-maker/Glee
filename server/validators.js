/**
 * Validation utilities for request data
 */

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {object} { valid: boolean, error?: string }
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  const phoneStr = String(phone).trim();
  if (phoneStr.length < 5) {
    return { valid: false, error: 'Phone number must be at least 5 characters' };
  }
  if (phoneStr.length > 20) {
    return { valid: false, error: 'Phone number cannot exceed 20 characters' };
  }

  // Only allow digits, spaces, dashes, plus, parentheses
  if (!/^[\d\s\-+()]*$/.test(phoneStr)) {
    return { valid: false, error: 'Phone number contains invalid characters' };
  }

  return { valid: true };
}



/**
 * Validate name/string field
 * @param {string} name - Name to validate
 * @param {object} options - { required, minLength, maxLength }
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateName(name, options = {}) {
  const {
    required = true,
    minLength = 2,
    maxLength = 100,
    fieldName = 'Name'
  } = options;

  if (!name) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  }

  const nameStr = String(name).trim();

  if (nameStr.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (nameStr.length > maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  // Only allow alphanumeric, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z0-9\s\-']+$/.test(nameStr)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  return { valid: true };
}

/**
 * Validate address
 * @param {string} address - Address
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateAddress(address) {
  if (!address) {
    return { valid: false, error: 'Address is required' };
  }

  const addressStr = String(address).trim();

  if (addressStr.length < 5) {
    return { valid: false, error: 'Address must be at least 5 characters' };
  }

  if (addressStr.length > 500) {
    return { valid: false, error: 'Address cannot exceed 500 characters' };
  }

  return { valid: true };
}

/**
 * Validate quantity
 * @param {*} quantity - Quantity
 * @param {object} options - { min, max }
 * @returns {object} { valid: boolean, error?: string, value?: number }
 */
export function validateQuantity(quantity, options = {}) {
  const { min = 1, max = 1000 } = options;

  if (quantity === null || quantity === undefined || quantity === '') {
    return { valid: false, error: 'Quantity is required' };
  }

  const qty = parseInt(quantity);

  if (isNaN(qty)) {
    return { valid: false, error: 'Quantity must be a number' };
  }

  if (qty < min) {
    return { valid: false, error: `Quantity must be at least ${min}` };
  }

  if (qty > max) {
    return { valid: false, error: `Quantity cannot exceed ${max}` };
  }

  return { valid: true, value: qty };
}

/**
 * Validate price (decimal)
 * @param {*} price - Price amount
 * @returns {object} { valid: boolean, error?: string, value?: number }
 */
export function validatePrice(price) {
  if (price === null || price === undefined || price === '') {
    return { valid: true, value: 0 }; // Optional
  }

  const p = parseFloat(price);

  if (isNaN(p)) {
    return { valid: false, error: 'Price must be a valid number' };
  }

  if (p < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }

  if (p > 999999.99) {
    return { valid: false, error: 'Price is too high' };
  }

  return { valid: true, value: Math.round(p * 100) / 100 };
}

/**
 * Validate rating (1-5)
 * @param {*} rating - Rating number
 * @returns {object} { valid: boolean, error?: string, value?: number }
 */
export function validateRating(rating) {
  if (rating === null || rating === undefined || rating === '') {
    return { valid: false, error: 'Rating is required' };
  }

  const r = parseInt(rating);

  if (isNaN(r)) {
    return { valid: false, error: 'Rating must be a number' };
  }

  if (r < 1 || r > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }

  return { valid: true, value: r };
}

/**
 * Validate text/review content
 * @param {string} text - Text to validate
 * @param {object} options - { required, minLength, maxLength }
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateText(text, options = {}) {
  const {
    required = true,
    minLength = 5,
    maxLength = 5000,
    fieldName = 'Text'
  } = options;

  if (!text) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  }

  const textStr = String(text).trim();

  if (textStr.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (textStr.length > maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Validate array of toppings/options
 * @param {*} toppings - Toppings array
 * @returns {object} { valid: boolean, error?: string, value?: array }
 */
export function validateToppings(toppings) {
  if (!toppings) {
    return { valid: true, value: [] };
  }

  let toppingsList = toppings;
  if (typeof toppings === 'string') {
    try {
      toppingsList = JSON.parse(toppings);
    } catch {
      return { valid: false, error: 'Toppings must be a valid JSON array' };
    }
  }

  if (!Array.isArray(toppingsList)) {
    return { valid: false, error: 'Toppings must be an array' };
  }

  if (toppingsList.length > 20) {
    return { valid: false, error: 'Too many toppings (max 20)' };
  }

  // Validate each topping string
  for (const t of toppingsList) {
    const tStr = String(t).trim();
    if (tStr.length < 1 || tStr.length > 50) {
      return { valid: false, error: 'Each topping must be 1-50 characters' };
    }
  }

  return { valid: true, value: toppingsList };
}

/**
 * Validate order status
 * @param {string} status - Order status
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateOrderStatus(status) {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'on-way', 'delivered', 'cancelled'];

  if (!status) {
    return { valid: false, error: 'Status is required' };
  }

  const statusStr = String(status).toLowerCase().trim();

  if (!validStatuses.includes(statusStr)) {
    return { valid: false, error: `Status must be one of: ${validStatuses.join(', ')}` };
  }

  return { valid: true, value: statusStr };
}

/**
 * Validate pagination parameters
 * @param {*} limit - Items per page
 * @param {*} offset - Page offset
 * @returns {object} { valid: boolean, error?: string, limit?: number, offset?: number }
 */
export function validatePagination(limit, offset) {
  const validLimit = limit ? parseInt(limit) : 100;
  const validOffset = offset ? parseInt(offset) : 0;

  if (isNaN(validLimit) || validLimit < 1) {
    return { valid: false, error: 'Limit must be a positive number' };
  }

  if (isNaN(validOffset) || validOffset < 0) {
    return { valid: false, error: 'Offset must be a non-negative number' };
  }

  if (validLimit > 1000) {
    return { valid: false, error: 'Limit cannot exceed 1000' };
  }

  return { valid: true, limit: validLimit, offset: validOffset };
}

/**
 * Sanitize string (remove dangerous characters)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (!str) return '';

  return String(str)
    .trim()
    .slice(0, 1000) // Limit length
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, ''); // Remove script protocols
}

/**
 * Validate complete order object
 * @param {object} orderData - Order data to validate
 * @returns {object} { valid: boolean, errors: {}, data: {} }
 */
export function validateOrderData(orderData) {
  const errors = {};
  const data = {};

  // Validate full_name
  const nameVal = validateName(orderData.full_name, {
    required: true,
    fieldName: 'Full name'
  });
  if (!nameVal.valid) errors.full_name = nameVal.error;
  else data.full_name = String(orderData.full_name).trim();

  // Validate phone_number
  const phoneVal = validatePhone(orderData.phone_number);
  if (!phoneVal.valid) errors.phone_number = phoneVal.error;
  else data.phone_number = String(orderData.phone_number).trim();

  // Validate address
  const addrVal = validateAddress(orderData.address);
  if (!addrVal.valid) errors.address = addrVal.error;
  else data.address = String(orderData.address).trim();

  // Validate quantity
  const qtyVal = validateQuantity(orderData.quantity, { min: 1, max: 1000 });
  if (!qtyVal.valid) errors.quantity = qtyVal.error;
  else data.quantity = qtyVal.value;

  // Validate toppings
  const toppingVal = validateToppings(orderData.toppings);
  if (!toppingVal.valid) errors.toppings = toppingVal.error;
  else data.toppings = toppingVal.value;

  // Validate total_price
  const priceVal = validatePrice(orderData.total_price);
  if (!priceVal.valid) errors.total_price = priceVal.error;
  else data.total_price = priceVal.value;

  // Optional: special_instructions
  if (orderData.special_instructions) {
    const instrVal = validateText(orderData.special_instructions, {
      required: false,
      minLength: 1,
      maxLength: 500,
      fieldName: 'Special instructions'
    });
    if (!instrVal.valid) errors.special_instructions = instrVal.error;
    else data.special_instructions = String(orderData.special_instructions).trim();
  } else {
    data.special_instructions = '';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data
  };
}

/**
 * Validate complete review object
 * @param {object} reviewData - Review data to validate
 * @returns {object} { valid: boolean, errors: {}, data: {} }
 */
export function validateReviewData(reviewData) {
  const errors = {};
  const data = {};

  // Validate reviewer_name
  const nameVal = validateName(reviewData.reviewer_name, {
    required: true,
    fieldName: 'Reviewer name'
  });
  if (!nameVal.valid) errors.reviewer_name = nameVal.error;
  else data.reviewer_name = String(reviewData.reviewer_name).trim();

  // Validate review_text
  const textVal = validateText(reviewData.review_text, {
    required: true,
    minLength: 5,
    maxLength: 5000,
    fieldName: 'Review'
  });
  if (!textVal.valid) errors.review_text = textVal.error;
  else data.review_text = String(reviewData.review_text).trim();

  // Validate rating
  const ratingVal = validateRating(reviewData.rating);
  if (!ratingVal.valid) errors.rating = ratingVal.error;
  else data.rating = ratingVal.value;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data
  };
}


