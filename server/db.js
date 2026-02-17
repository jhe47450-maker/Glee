import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON', (err) => {
  if (err) console.error('Error enabling foreign keys:', err);
});

// Promisify database methods
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

/**
 * Initialize database schema
 * Creates tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    // Create orders table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        address TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        toppings TEXT NOT NULL DEFAULT '[]',
        total_price REAL NOT NULL DEFAULT 0,
        special_instructions TEXT,
        order_date TEXT NOT NULL,
        delivery_date TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT,
        CONSTRAINT valid_quantity CHECK (quantity > 0),
        CONSTRAINT valid_price CHECK (total_price >= 0),
        CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'preparing', 'on-way', 'delivered', 'cancelled'))
      )
    `);

    // Create indexes for orders
    await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone_number)');

    // Create reviews table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        reviewer_name TEXT NOT NULL,
        review_text TEXT NOT NULL,
        rating INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
      )
    `);

    // Create indexes for reviews
    await dbRun('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at)');

    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// ============================================================================
// ORDERS FUNCTIONS
// ============================================================================

/**
 * Get all orders with optional filtering
 * @param {Object} options - Filter options (status, limit, offset)
 * @returns {Array} Array of orders
 */
export async function getAllOrders(options = {}) {
  const { status, limit = 1000, offset = 0 } = options;

  try {
    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await dbAll(query, params);

    return rows.map(order => ({
      ...order,
      toppings: JSON.parse(order.toppings || '[]')
    }));
  } catch (error) {
    console.error('Error reading orders:', error);
    throw error;
  }
}

/**
 * Get single order by ID
 * @param {string} id - Order ID
 * @returns {Object|null} Order object or null
 */
export async function getOrderById(id) {
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);

    if (!order) return null;

    return {
      ...order,
      toppings: JSON.parse(order.toppings || '[]')
    };
  } catch (error) {
    console.error('Error reading order:', error);
    throw error;
  }
}

/**
 * Get orders count
 * @returns {number} Total orders count
 */
export async function getOrdersCount() {
  try {
    const result = await dbGet('SELECT COUNT(*) as count FROM orders');
    return result.count;
  } catch (error) {
    console.error('Error counting orders:', error);
    throw error;
  }
}

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @returns {Object} Created order
 */
export async function createOrder(orderData) {
  try {
    const {
      id,
      full_name,
      phone_number,
      address,
      quantity,
      toppings = [],
      total_price = 0,
      special_instructions = '',
      order_date,
      delivery_date = null,
      status = 'pending'
    } = orderData;

    // Validation
    if (!id || !full_name || !phone_number || !address || !quantity) {
      throw new Error('Missing required fields');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (total_price < 0) {
      throw new Error('Total price cannot be negative');
    }

    const now = new Date().toISOString();
    await dbRun(
      `INSERT INTO orders (
        id, full_name, phone_number, address, quantity, toppings,
        total_price, special_instructions, order_date, delivery_date,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(full_name).trim(),
        String(phone_number).trim(),
        String(address).trim(),
        parseInt(quantity),
        JSON.stringify(toppings),
        parseFloat(total_price),
        String(special_instructions || '').trim(),
        order_date || now,
        delivery_date,
        status,
        now
      ]
    );

    return getOrderById(id);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update order
 * @param {string} id - Order ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated order
 */
export async function updateOrder(id, updates) {
  try {
    const order = await getOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const allowedFields = [
      'full_name', 'phone_number', 'address', 'quantity', 'toppings',
      'total_price', 'special_instructions', 'delivery_date', 'status'
    ];

    const updateFields = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields[key] = value;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return order;
    }

    const setClauses = Object.keys(updateFields).map(key => `${key} = ?`);
    setClauses.push('updated_at = ?');

    const values = Object.values(updateFields);
    if (updateFields.toppings) {
      values[values.length - 1] = JSON.stringify(updateFields.toppings);
    }
    values.push(new Date().toISOString());
    values.push(id);

    const setClause = setClauses.join(', ');
    await dbRun(`UPDATE orders SET ${setClause} WHERE id = ?`, values);

    return getOrderById(id);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Delete order
 * @param {string} id - Order ID
 * @returns {boolean} True if deleted
 */
export async function deleteOrder(id) {
  try {
    const order = await getOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    await dbRun('DELETE FROM orders WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

/**
 * Get orders by phone number
 * @param {string} phoneNumber - Phone number to search
 * @returns {Array} Orders matching phone number
 */
export async function getOrdersByPhone(phoneNumber) {
  try {
    const rows = await dbAll(
      'SELECT * FROM orders WHERE phone_number = ? ORDER BY created_at DESC',
      [phoneNumber]
    );
    return rows.map(order => ({
      ...order,
      toppings: JSON.parse(order.toppings || '[]')
    }));
  } catch (error) {
    console.error('Error reading orders by phone:', error);
    throw error;
  }
}

// ============================================================================
// REVIEWS FUNCTIONS
// ============================================================================

/**
 * Get all reviews with optional filtering
 * @param {Object} options - Filter options (minRating, limit, offset)
 * @returns {Array} Array of reviews
 */
export async function getAllReviews(options = {}) {
  const { minRating = 1, limit = 1000, offset = 0 } = options;

  try {
    const rows = await dbAll(
      `SELECT * FROM reviews WHERE rating >= ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [minRating, limit, offset]
    );
    return rows;
  } catch (error) {
    console.error('Error reading reviews:', error);
    throw error;
  }
}

/**
 * Get review by ID
 * @param {string} id - Review ID
 * @returns {Object|null} Review object or null
 */
export async function getReviewById(id) {
  try {
    return await dbGet('SELECT * FROM reviews WHERE id = ?', [id]) || null;
  } catch (error) {
    console.error('Error reading review:', error);
    throw error;
  }
}

/**
 * Get reviews count
 * @returns {number} Total reviews count
 */
export async function getReviewsCount() {
  try {
    const result = await dbGet('SELECT COUNT(*) as count FROM reviews');
    return result.count;
  } catch (error) {
    console.error('Error counting reviews:', error);
    throw error;
  }
}

/**
 * Get average rating
 * @returns {number} Average rating (0-5)
 */
export async function getAverageRating() {
  try {
    const result = await dbGet('SELECT AVG(rating) as avg_rating FROM reviews');
    return result.avg_rating ? Math.round(result.avg_rating * 10) / 10 : 0;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
}

/**
 * Get rating distribution
 * @returns {Object} Distribution by rating (1-5)
 */
export async function getRatingDistribution() {
  try {
    const dist = await dbAll(
      `SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating ASC`
    );

    const result = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    dist.forEach(row => {
      result[row.rating] = row.count;
    });
    return result;
  } catch (error) {
    console.error('Error getting rating distribution:', error);
    throw error;
  }
}

/**
 * Create new review
 * @param {Object} reviewData - Review data
 * @returns {Object} Created review
 */
export async function createReview(reviewData) {
  try {
    const {
      id,
      reviewer_name,
      review_text,
      rating,
      date
    } = reviewData;

    // Validation
    if (!id || !reviewer_name || !review_text || !rating) {
      throw new Error('Missing required fields');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const now = new Date().toISOString();
    await dbRun(
      `INSERT INTO reviews (id, reviewer_name, review_text, rating, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(reviewer_name).trim(),
        String(review_text).trim(),
        parseInt(rating),
        date || now,
        now
      ]
    );

    return getReviewById(id);
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Update review
 * @param {string} id - Review ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated review
 */
export async function updateReview(id, updates) {
  try {
    const review = await getReviewById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    const allowedFields = ['reviewer_name', 'review_text', 'rating', 'date'];
    const updateFields = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields[key] = value;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return review;
    }

    // Validate rating if provided
    if (updateFields.rating && (updateFields.rating < 1 || updateFields.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const setClauses = Object.keys(updateFields).map(key => `${key} = ?`);
    setClauses.push('updated_at = ?');

    const values = Object.values(updateFields);
    values.push(new Date().toISOString());
    values.push(id);

    const setClause = setClauses.join(', ');
    await dbRun(`UPDATE reviews SET ${setClause} WHERE id = ?`, values);

    return getReviewById(id);
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Delete review
 * @param {string} id - Review ID
 * @returns {boolean} True if deleted
 */
export async function deleteReview(id) {
  try {
    const review = await getReviewById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    await dbRun('DELETE FROM reviews WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

// ============================================================================
// DATABASE UTILITIES
// ============================================================================

/**
 * Get database statistics
 * @returns {Object} Database stats
 */
export async function getStats() {
  try {
    return {
      orders_count: await getOrdersCount(),
      reviews_count: await getReviewsCount(),
      average_rating: await getAverageRating(),
      rating_distribution: await getRatingDistribution(),
      database_type: 'SQLite',
      database_path: dbPath
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {};
  }
}

/**
 * Backup database to JSON (for migration or export)
 * @returns {Object} Complete database snapshot
 */
export async function backupToJSON() {
  try {
    return {
      orders: await getAllOrders({ limit: 999999 }),
      reviews: await getAllReviews({ minRating: 1, limit: 999999 }),
      exported_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  }
}

/**
 * Clear all data (DANGEROUS - use with caution)
 * @returns {boolean} True if cleared
 */
export async function clearAllData() {
  try {
    await dbRun('DELETE FROM orders');
    await dbRun('DELETE FROM reviews');

    console.warn('⚠️  All data cleared from database');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        reject(err);
      } else {
        console.log('✅ Database connection closed');
        resolve();
      }
    });
  });
}

export default db;
