import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  initializeDatabase,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByPhone,
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getStats,
  backupToJSON,
  closeDatabase
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'https://gleejeyly.com',
    'https://*.github.io',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Serve static files from dist/ (Replit full-stack deployment)
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir, {
  maxAge: '1h',
  etag: false
}));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'SQLite'
  });
});

// ============================================================================
// ORDERS API
// ============================================================================

/**
 * GET /api/orders - Get all orders with optional filtering
 * Query params: status, limit, offset
 */
app.get('/api/orders', (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const options = {};

    if (status) options.status = status;
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    const orders = getAllOrders(options);
    res.json(orders);
  } catch (error) {
    console.error('Error reading orders:', error);
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

/**
 * GET /api/orders/search/:phone - Get orders by phone number
 */
app.get('/api/orders/search/:phone', (req, res) => {
  try {
    const orders = getOrdersByPhone(req.params.phone);
    res.json(orders);
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ error: 'Failed to search orders' });
  }
});

/**
 * GET /api/orders/:id - Get single order by ID
 */
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error reading order:', error);
    res.status(500).json({ error: 'Failed to read order' });
  }
});

/**
 * POST /api/orders - Create new order
 */
app.post('/api/orders', (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      address,
      quantity,
      toppings,
      total_price,
      special_instructions,
      order_date,
      delivery_date
    } = req.body;

    // Validation
    if (!full_name || !phone_number || !address || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newOrder = createOrder({
      id: `ORD-${Date.now()}`,
      full_name,
      phone_number,
      address,
      quantity,
      toppings,
      total_price,
      special_instructions,
      order_date,
      delivery_date,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({
      error: error.message || 'Failed to create order'
    });
  }
});

/**
 * PUT /api/orders/:id - Update order
 */
app.put('/api/orders/:id', (req, res) => {
  try {
    const updatedOrder = updateOrder(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    const statusCode = error.message === 'Order not found' ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to update order'
    });
  }
});

/**
 * DELETE /api/orders/:id - Delete order
 */
app.delete('/api/orders/:id', (req, res) => {
  try {
    deleteOrder(req.params.id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    const statusCode = error.message === 'Order not found' ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to delete order'
    });
  }
});

// ============================================================================
// REVIEWS API
// ============================================================================

/**
 * GET /api/reviews - Get all reviews with optional filtering
 * Query params: minRating, limit, offset
 */
app.get('/api/reviews', (req, res) => {
  try {
    const { minRating, limit, offset } = req.query;
    const options = {};

    if (minRating) options.minRating = parseInt(minRating);
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    const reviews = getAllReviews(options);
    res.json(reviews);
  } catch (error) {
    console.error('Error reading reviews:', error);
    res.status(500).json({ error: 'Failed to read reviews' });
  }
});

/**
 * GET /api/reviews/:id - Get single review by ID
 */
app.get('/api/reviews/:id', (req, res) => {
  try {
    const review = getReviewById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error reading review:', error);
    res.status(500).json({ error: 'Failed to read review' });
  }
});

/**
 * POST /api/reviews - Create new review
 */
app.post('/api/reviews', (req, res) => {
  try {
    const {
      reviewer_name,
      review_text,
      rating,
      date
    } = req.body;

    // Validation
    if (!reviewer_name || !review_text || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const newReview = createReview({
      id: `REV-${Date.now()}`,
      reviewer_name,
      review_text,
      rating,
      date
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({
      error: error.message || 'Failed to create review'
    });
  }
});

/**
 * PUT /api/reviews/:id - Update review
 */
app.put('/api/reviews/:id', (req, res) => {
  try {
    const updatedReview = updateReview(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    const statusCode = error.message === 'Review not found' ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to update review'
    });
  }
});

/**
 * DELETE /api/reviews/:id - Delete review
 */
app.delete('/api/reviews/:id', (req, res) => {
  try {
    deleteReview(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    const statusCode = error.message === 'Review not found' ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to delete review'
    });
  }
});

// ============================================================================
// ADMIN API (Database Stats & Management)
// ============================================================================

/**
 * GET /api/stats - Database statistics
 */
app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * GET /api/backup - Export database as JSON (for migration/backup)
 */
app.get('/api/backup', (req, res) => {
  try {
    const backup = backupToJSON();
    res.json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// ============================================================================
// SPA FALLBACK & ERROR HANDLING
// ============================================================================

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================================================
// SERVER STARTUP & SHUTDOWN
// ============================================================================

let server;

async function start() {
  try {
    // Initialize database
    initializeDatabase();

    // Start server
    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🍰 GleeJeYly Backend Server 🍰      ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}            ║
║  Status: http://localhost:${PORT}/health     ║
║  Database: SQLite (server/database.sqlite) ║
║  Node.js Version: ${process.version}        ║
║  Environment: ${process.env.NODE_ENV || 'development'} ║
╚════════════════════════════════════════╝

📍 Available Endpoints:
  ✅ GET  /health           - Server status
  
  📦 ORDERS:
     GET  /api/orders       - List all orders
     POST /api/orders       - Create order
     GET  /api/orders/:id   - Get order
     PUT  /api/orders/:id   - Update order
     DELETE /api/orders/:id - Delete order
     GET  /api/orders/search/:phone - Search by phone
  
  ⭐ REVIEWS:
     GET  /api/reviews      - List all reviews
     POST /api/reviews      - Create review
     GET  /api/reviews/:id  - Get review
     PUT  /api/reviews/:id  - Update review
     DELETE /api/reviews/:id- Delete review
  
  📊 ADMIN:
     GET  /api/stats        - Database statistics
     GET  /api/backup       - Export to JSON

🗄️  Database: SQLite (server/database.sqlite)
    `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⏹️  SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        closeDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⏹️  SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        closeDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    closeDatabase();
    process.exit(1);
  }
}

start();

export default app;
