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
import logger, { requestLogger } from './logger.js';
import {
  validateOrderData,
  validateReviewData,
  validatePagination,
  validateOrderStatus
} from './validators.js';

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
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

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
app.get('/api/orders', async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    
    // Validate pagination
    const paginationVal = validatePagination(limit, offset);
    if (!paginationVal.valid) {
      logger.validationError('Invalid pagination', { error: paginationVal.error });
      return res.status(400).json({ error: paginationVal.error });
    }

    const options = {
      limit: paginationVal.limit,
      offset: paginationVal.offset
    };

    if (status) {
      const statusVal = validateOrderStatus(status);
      if (!statusVal.valid) {
        logger.validationError('Invalid status', { error: statusVal.error });
        return res.status(400).json({ error: statusVal.error });
      }
      options.status = statusVal.value;
    }

    const orders = await getAllOrders(options);
    logger.endpoint('GET', '/api/orders', 200, { count: orders.length });
    res.json(orders);
  } catch (error) {
    logger.error('Error reading orders', { error: error.message });
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

/**
 * GET /api/orders/search/:phone - Get orders by phone number
 */
app.get('/api/orders/search/:phone', async (req, res) => {
  try {
    if (!req.params.phone || req.params.phone.length < 5) {
      logger.validationError('Invalid phone', { error: 'Phone must be at least 5 characters' });
      return res.status(400).json({ error: 'Phone number must be at least 5 characters' });
    }

    const orders = await getOrdersByPhone(req.params.phone);
    res.json(orders);
  } catch (error) {
    logger.error('Error searching orders', { error: error.message });
    res.status(500).json({ error: 'Failed to search orders' });
  }
});

/**
 * GET /api/orders/:id - Get single order by ID
 */
app.get('/api/orders/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    logger.error('Error reading order', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Failed to read order' });
  }
});

/**
 * POST /api/orders - Create new order
 */
app.post('/api/orders', async (req, res) => {
  try {
    // Validate request data
    const validation = validateOrderData(req.body);

    if (!validation.valid) {
      logger.validationError('Invalid order data', validation.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Create order with validated data
    const newOrder = await createOrder({
      id: `ORD-${Date.now()}`,
      ...validation.data,
      order_date: req.body.order_date || new Date().toISOString(),
      delivery_date: req.body.delivery_date || null,
      status: 'pending'
    });

    logger.endpoint('POST', '/api/orders', 201, { id: newOrder.id, customer: newOrder.full_name });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    logger.error('Error creating order', { error: error.message });
    res.status(500).json({
      error: 'Failed to create order',
      message: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/orders/:id - Update order
 */
app.put('/api/orders/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Validate only provided fields
    const allowedFields = ['status', 'delivery_date', 'special_instructions', 'quantity', 'total_price'];
    const updateData = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    if (updateData.status) {
      const statusVal = validateOrderStatus(updateData.status);
      if (!statusVal.valid) {
        logger.validationError('Invalid status', { error: statusVal.error });
        return res.status(400).json({ error: statusVal.error });
      }
      updateData.status = statusVal.value;
    }

    const updatedOrder = await updateOrder(req.params.id, updateData);
    logger.endpoint('PUT', `/api/orders/:id`, 200, { id: req.params.id });

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    logger.error('Error updating order', { error: error.message, id: req.params.id });
    const statusCode = error.message === 'Order not found' ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to update order'
    });
  }
});

/**
 * DELETE /api/orders/:id - Delete order
 */
app.delete('/api/orders/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    await deleteOrder(req.params.id);
    logger.endpoint('DELETE', `/api/orders/:id`, 200, { id: req.params.id });

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting order', { error: error.message, id: req.params.id });
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
app.get('/api/reviews', async (req, res) => {
  try {
    const { minRating, limit, offset } = req.query;
    
    // Validate pagination
    const paginationVal = validatePagination(limit, offset);
    if (!paginationVal.valid) {
      logger.validationError('Invalid pagination', { error: paginationVal.error });
      return res.status(400).json({ error: paginationVal.error });
    }

    const options = {
      limit: paginationVal.limit,
      offset: paginationVal.offset
    };

    if (minRating) {
      const r = parseInt(minRating);
      if (isNaN(r) || r < 1 || r > 5) {
        logger.validationError('Invalid rating', { error: 'Rating must be between 1 and 5' });
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      options.minRating = r;
    }

    const reviews = await getAllReviews(options);
    logger.endpoint('GET', '/api/reviews', 200, { count: reviews.length });
    res.json(reviews);
  } catch (error) {
    logger.error('Error reading reviews', { error: error.message });
    res.status(500).json({ error: 'Failed to read reviews' });
  }
});

/**
 * GET /api/reviews/:id - Get single review by ID
 */
app.get('/api/reviews/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const review = await getReviewById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    logger.error('Error reading review', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Failed to read review' });
  }
});

/**
 * POST /api/reviews - Create new review
 */
app.post('/api/reviews', async (req, res) => {
  try {
    // Validate request data
    const validation = validateReviewData(req.body);

    if (!validation.valid) {
      logger.validationError('Invalid review data', validation.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Create review with validated data
    const newReview = await createReview({
      id: `REV-${Date.now()}`,
      ...validation.data,
      date: req.body.date || new Date().toISOString()
    });

    logger.endpoint('POST', '/api/reviews', 201, { id: newReview.id, rating: newReview.rating });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    logger.error('Error creating review', { error: error.message });
    res.status(500).json({
      error: 'Failed to create review',
      message: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/reviews/:id - Update review
 */
app.put('/api/reviews/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    // Only allow updating rating and review_text
    const updateData = {};
    if ('rating' in req.body) updateData.rating = req.body.rating;
    if ('review_text' in req.body) updateData.review_text = req.body.review_text;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedReview = await updateReview(req.params.id, updateData);
    logger.endpoint('PUT', `/api/reviews/:id`, 200, { id: req.params.id });

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    logger.error('Error updating review', { error: error.message, id: req.params.id });
    const statusCode = error.message === 'Review not found' ? 404 : 400;
    res.status(statusCode).json({
      error: error.message || 'Failed to update review'
    });
  }
});

/**
 * DELETE /api/reviews/:id - Delete review
 */
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    await deleteReview(req.params.id);
    logger.endpoint('DELETE', `/api/reviews/:id`, 200, { id: req.params.id });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting review', { error: error.message, id: req.params.id });
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
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error getting stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * GET /api/backup - Export database as JSON (for migration/backup)
 */
app.get('/api/backup', async (req, res) => {
  try {
    const backup = await backupToJSON();
    logger.endpoint('GET', '/api/backup', 200, { orders: backup.orders.length, reviews: backup.reviews.length });
    res.json(backup);
  } catch (error) {
    logger.error('Error creating backup', { error: error.message });
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

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  logger.error(`${req.method} ${req.path}`, {
    message: err.message,
    stack: isDev ? err.stack : undefined
  });

  res.status(statusCode).json({
    error: isDev ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// ============================================================================
// SERVER STARTUP & SHUTDOWN
// ============================================================================

let server;

async function start() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    server = app.listen(PORT, () => {
      logger.startup('GleeJeYly Backend Server Started! 🚀', {
        'URL': `http://localhost:${PORT}`,
        'Health Check': `http://localhost:${PORT}/health`,
        'Database': 'SQLite (server/database.sqlite)',
        'Node.js': process.version,
        'Environment': process.env.NODE_ENV || 'development'
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.warn('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.warn('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    await closeDatabase();
    process.exit(1);
  }
}

start();

export default app;
