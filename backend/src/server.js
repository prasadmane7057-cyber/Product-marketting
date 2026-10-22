import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorResponse, successResponse } from './utils/response.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getSitemapXml, getRobotsTxt } from './controllers/marketingController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and Logging
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets (Uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// SEO & Webmaster Endpoints
app.get('/sitemap.xml', getSitemapXml);
app.get('/robots.txt', getRobotsTxt);

// Health Check
app.get('/api/health', (req, res) => {
  return successResponse(res, {
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: 'CONNECTED',
  }, 'NovaMarket API service is healthy and operational');
});

// Mount API Modules
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend static distribution if built
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found on NovaMarket API`, 404);
});

// SPA Fallback for client-side HTML5 history routing
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      return errorResponse(res, `Route ${req.originalUrl} not found on NovaMarket`, 404);
    }
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected internal error occurred';
  return errorResponse(res, message, status);
});

// Start Server if not imported by test suite
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 NovaMarket API Server running in ${config.nodeEnv} mode on port ${config.port}`);
    console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`🗺️ Sitemap: http://localhost:${config.port}/sitemap.xml`);
  });
}

export default app;
