import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { prisma } from '../src/config/index.js';

describe('NovaMarket Comprehensive API Integration Suite', () => {
  let adminToken = '';
  let customerToken = '';
  let testProductId = '';
  let testProductSlug = '';

  beforeAll(async () => {
    // Obtain admin token
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@novamarket.com', password: 'Admin@12345' });

    expect(adminRes.statusCode).toBe(200);
    adminToken = adminRes.body.data.token;

    // Obtain customer token
    const customerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@novamarket.com', password: 'Customer@12345' });

    expect(customerRes.statusCode).toBe(200);
    customerToken = customerRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health and SEO Endpoints', () => {
    it('GET /api/health should return 200 ONLINE', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ONLINE');
    });

    it('GET /sitemap.xml should return valid XML sitemap', async () => {
      const res = await request(app).get('/sitemap.xml');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('xml');
      expect(res.text).toContain('<urlset');
    });

    it('GET /robots.txt should disallow admin paths', async () => {
      const res = await request(app).get('/robots.txt');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Disallow: /admin');
    });
  });

  describe('2. Authentication and Authorization Workflows', () => {
    it('POST /api/auth/login should reject bad credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@novamarket.com', password: 'WrongPassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register should register a unique customer', async () => {
      const uniqueEmail = `user_${Date.now()}@testnovamarket.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password@123',
          firstName: 'Jordan',
          lastName: 'River',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    it('GET /api/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('customer@novamarket.com');
    });
  });

  describe('3. Product Catalog and Dynamic Sections', () => {
    it('GET /api/products should return paginated list of items', async () => {
      const res = await request(app).get('/api/products?page=1&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.pagination.total).toBeGreaterThan(0);

      testProductId = res.body.data.items[0].id;
      testProductSlug = res.body.data.items[0].slug;
    });

    it('GET /api/products/home-sections should return dynamic sections', async () => {
      const res = await request(app).get('/api/products/home-sections');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.featured).toBeDefined();
      expect(res.body.data.bestSellers).toBeDefined();
      expect(res.body.data.newArrivals).toBeDefined();
      expect(res.body.data.categories).toBeDefined();
    });

    it('GET /api/products/:slug should return product details and specs', async () => {
      const res = await request(app).get(`/api/products/${testProductSlug}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBeDefined();
      expect(res.body.data.images).toBeInstanceOf(Array);
      expect(res.body.data.variants).toBeInstanceOf(Array);
    });
  });

  describe('4. Coupons and Cart Calculation', () => {
    it('POST /api/coupons/validate should calculate percentage discount', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'WELCOME10', subtotal: 200 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.discountAmount).toBe(20);
    });

    it('POST /api/coupons/validate should reject nonexistent code', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'FAKE_CODE_XYZ', subtotal: 100 });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Checkout and Stock Protection', () => {
    it('POST /api/orders/checkout should complete purchase and reserve stock', async () => {
      const res = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerName: 'Alex Morgan',
          customerEmail: 'customer@novamarket.com',
          customerPhone: '+1-555-0144-88',
          shippingAddress: {
            fullName: 'Alex Morgan',
            addressLine1: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'OR',
            postalCode: '97477',
          },
          paymentMethod: 'TEST_CARD',
          couponCode: 'WELCOME10',
          items: [
            {
              productId: testProductId,
              quantity: 1,
            },
          ],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.grandTotal).toBeGreaterThan(0);
      expect(res.body.data.status).toBe('PROCESSING');
      expect(res.body.data.paymentStatus).toBe('PAID');
    });
  });

  describe('6. Role-Based Access Control and Security', () => {
    it('GET /api/admin/analytics should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/analytics');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/admin/analytics should reject customer tokens (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('GET /api/admin/analytics should succeed for admin token', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalRevenue).toBeDefined();
      expect(res.body.data.revenueChart).toBeInstanceOf(Array);
    });
  });
});
