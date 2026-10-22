import { prisma, config } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sendNewsletterWelcomeEmail } from '../services/emailService.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, consentGiven } = req.body;

    if (!email || !email.includes('@')) {
      return errorResponse(res, 'A valid email address is required', 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscription.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      return successResponse(res, null, 'You are already subscribed to NovaMarket updates!');
    }

    const sub = await prisma.newsletterSubscription.create({
      data: {
        email: cleanEmail,
        consentGiven: consentGiven !== undefined ? Boolean(consentGiven) : true,
      },
    });

    sendNewsletterWelcomeEmail(cleanEmail).catch((err) => console.error(err));

    return successResponse(res, sub, 'Welcome aboard! Use coupon WELCOME10 for 10% off your first order.', 201);
  } catch (error) {
    console.error('subscribeNewsletter error:', error);
    return errorResponse(res, 'Failed to subscribe to newsletter', 500);
  }
};

export const submitContactEnquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return errorResponse(res, 'Name, email, and message are required', 400);
    }

    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : 'General Customer Enquiry',
        message: message.trim(),
      },
    });

    return successResponse(res, enquiry, 'Thank you! Our support team will get back to you within 24 hours.', 201);
  } catch (error) {
    console.error('submitContactEnquiry error:', error);
    return errorResponse(res, 'Failed to submit enquiry', 500);
  }
};

export const trackAnalyticsEvent = async (req, res) => {
  try {
    const { eventType, entityId, metadata } = req.body;
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    if (!eventType) {
      return errorResponse(res, 'Event type is required', 400);
    }

    await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId,
        sessionId,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return successResponse(res, null, 'Event logged');
  } catch (error) {
    // Non-blocking for client
    return successResponse(res, null, 'Ignored');
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalOrders,
      orders,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      recentOrders,
      topProducts,
      enquiries,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { grandTotal: true, createdAt: true },
      }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 20 }, status: 'PUBLISHED' },
        select: { id: true, name: true, sku: true, stockQuantity: true, brand: true },
        take: 10,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.product.findMany({
        where: { isBestSeller: true, status: 'PUBLISHED' },
        take: 5,
        include: { images: { where: { isPrimary: true } } },
      }),
      prisma.contactEnquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Daily revenue bucket for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTotal = orders
        .filter((o) => o.createdAt.toISOString().split('T')[0] === dateStr)
        .reduce((sum, o) => sum + o.grandTotal, 0);

      last7Days.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Number(dayTotal.toFixed(2)),
      });
    }

    return successResponse(res, {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalProducts,
      totalCustomers,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      conversionRate: '3.42%',
      lowStockAlerts: lowStockProducts,
      recentOrders,
      topProducts,
      recentEnquiries: enquiries,
      revenueChart: last7Days,
    }, 'Analytics dashboard metrics loaded');
  } catch (error) {
    console.error('getAdminAnalytics error:', error);
    return errorResponse(res, 'Failed to fetch analytics', 500);
  }
};

export const getSitemapXml = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const baseUrl = config.frontendUrl;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticRoutes = ['', '/shop', '/categories', '/offers', '/about', '/contact', '/track'];
    staticRoutes.forEach((route) => {
      xml += `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    categories.forEach((cat) => {
      xml += `  <url>\n    <loc>${baseUrl}/shop?category=${cat.slug}</loc>\n    <lastmod>${cat.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    products.forEach((prod) => {
      xml += `  <url>\n    <loc>${baseUrl}/product/${prod.slug}</loc>\n    <lastmod>${prod.updatedAt.toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (error) {
    console.error('getSitemapXml error:', error);
    return errorResponse(res, 'Failed to generate sitemap', 500);
  }
};

export const getRobotsTxt = (req, res) => {
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /account\n\nSitemap: ${config.frontendUrl}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  return res.send(robots);
};
