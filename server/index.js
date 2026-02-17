import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

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

// Data paths
const dataDir = path.join(__dirname, 'server', 'data');
const ordersFile = path.join(dataDir, 'orders.json');
const reviewsFile = path.join(dataDir, 'reviews.json');

// Initialize data files
async function initDataFiles() {
  try {
    await fs.mkdir(dataDir, { recursive: true });

    // Create orders.json if doesn't exist
    try {
      await fs.access(ordersFile);
    } catch {
      await fs.writeFile(ordersFile, JSON.stringify([], null, 2));
    }

    // Create reviews.json if doesn't exist
    try {
      await fs.access(reviewsFile);
    } catch {
      await fs.writeFile(reviewsFile, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Utility functions
async function readOrders() {
  try {
    const data = await fs.readFile(ordersFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeOrders(orders) {
  await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2));
}

async function readReviews() {
  try {
    const data = await fs.readFile(reviewsFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeReviews(reviews) {
  await fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API: Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await readOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error reading orders:', error);
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

// API: Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orders = await readOrders();
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error reading order:', error);
    res.status(500).json({ error: 'Failed to read order' });
  }
});

// API: Create new order
app.post('/api/orders', async (req, res) => {
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

    const orders = await readOrders();
    const newOrder = {
      id: `ORD-${Date.now()}`,
      full_name: String(full_name).trim(),
      phone_number: String(phone_number).trim(),
      address: String(address).trim(),
      quantity: parseInt(quantity),
      toppings: Array.isArray(toppings) ? toppings : [],
      total_price: parseFloat(total_price) || 0,
      special_instructions: String(special_instructions || '').trim(),
      order_date: order_date || new Date().toISOString(),
      delivery_date: delivery_date || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    orders.push(newOrder);
    await writeOrders(orders);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// API: Update order
app.put('/api/orders/:id', async (req, res) => {
  try {
    const orders = await readOrders();
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = {
      ...orders[orderIndex],
      ...req.body,
      id: orders[orderIndex].id, // Don't allow ID change
      created_at: orders[orderIndex].created_at, // Don't allow creation time change
      updated_at: new Date().toISOString()
    };

    orders[orderIndex] = updatedOrder;
    await writeOrders(orders);

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// API: Delete order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const orders = await readOrders();
    const filteredOrders = orders.filter(o => o.id !== req.params.id);

    if (filteredOrders.length === orders.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await writeOrders(filteredOrders);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// API: Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await readReviews();
    res.json(reviews);
  } catch (error) {
    console.error('Error reading reviews:', error);
    res.status(500).json({ error: 'Failed to read reviews' });
  }
});

// API: Create review
app.post('/api/reviews', async (req, res) => {
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

    const reviews = await readReviews();
    const newReview = {
      id: `REV-${Date.now()}`,
      reviewer_name: String(reviewer_name).trim(),
      review_text: String(review_text).trim(),
      rating: parseInt(rating),
      date: date || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    reviews.push(newReview);
    await writeReviews(reviews);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// API: Update review
app.put('/api/reviews/:id', async (req, res) => {
  try {
    const reviews = await readReviews();
    const reviewIndex = reviews.findIndex(r => r.id === req.params.id);

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = {
      ...reviews[reviewIndex],
      ...req.body,
      id: reviews[reviewIndex].id,
      created_at: reviews[reviewIndex].created_at,
      updated_at: new Date().toISOString()
    };

    reviews[reviewIndex] = updatedReview;
    await writeReviews(reviews);

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// API: Delete review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const reviews = await readReviews();
    const filteredReviews = reviews.filter(r => r.id !== req.params.id);

    if (filteredReviews.length === reviews.length) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await writeReviews(filteredReviews);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

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

// Start server
async function start() {
  await initDataFiles();
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🍰 GleeJeYly Backend Server 🍰      ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}            ║
║  Status: http://localhost:${PORT}/health     ║
║  Node.js Version: ${process.version}        ║
║  Environment: ${process.env.NODE_ENV || 'development'} ║
╚════════════════════════════════════════╝

📍 Available Endpoints:
  GET  /health           - Server status
  GET  /api/orders       - List all orders
  POST /api/orders       - Create order
  GET  /api/orders/:id   - Get order
  PUT  /api/orders/:id   - Update order
  DELETE /api/orders/:id - Delete order
  
  GET  /api/reviews      - List all reviews
  POST /api/reviews      - Create review
  PUT  /api/reviews/:id  - Update review
  DELETE /api/reviews/:id- Delete review

📂 Data stored in: ${dataDir}
    `);
  });
}

start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
