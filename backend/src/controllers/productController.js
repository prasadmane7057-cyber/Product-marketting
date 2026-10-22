import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      isFeatured,
      isBestSeller,
      isTrending,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const where = {
      status: 'PUBLISHED',
    };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { shortDesc: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    if (category) {
      // Find category by slug or id
      const catRecord = await prisma.category.findFirst({
        where: {
          OR: [{ slug: category }, { id: category }],
        },
      });
      if (catRecord) {
        where.categoryId = catRecord.id;
      }
    }

    if (brand) {
      where.brand = { equals: brand };
    }

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    if (isFeatured === 'true') where.isFeatured = true;
    if (isBestSeller === 'true') where.isBestSeller = true;
    if (isTrending === 'true') where.isTrending = true;

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
    else if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
    else if (sort === 'name_asc') orderBy = { name: 'asc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true },
          },
        },
      }),
    ]);

    // Attach computed rating & review count
    const formatted = products.map((prod) => {
      const revs = prod.reviews || [];
      const avgRating = revs.length > 0 ? revs.reduce((acc, r) => acc + r.rating, 0) / revs.length : 0;
      return {
        ...prod,
        reviewsCount: revs.length,
        averageRating: Number(avgRating.toFixed(1)),
        primaryImage: prod.images.find((i) => i.isPrimary)?.url || prod.images[0]?.url || null,
      };
    });

    return successResponse(res, {
      items: formatted,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return errorResponse(res, 'Failed to fetch products', 500);
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const revs = product.reviews || [];
    const avgRating = revs.length > 0 ? revs.reduce((acc, r) => acc + r.rating, 0) / revs.length : 0;

    // Get related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'PUBLISHED',
      },
      take: 4,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
      },
    });

    return successResponse(res, {
      ...product,
      reviewsCount: revs.length,
      averageRating: Number(avgRating.toFixed(1)),
      relatedProducts: relatedProducts.map((p) => ({
        ...p,
        primaryImage: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || null,
      })),
    });
  } catch (error) {
    console.error('getProductBySlug error:', error);
    return errorResponse(res, 'Failed to fetch product details', 500);
  }
};

export const getHomeSections = async (req, res) => {
  try {
    const [featured, bestSellers, newArrivals, trending, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true, status: 'PUBLISHED' },
        take: 8,
        include: { images: true, category: true, reviews: { where: { status: 'APPROVED' } } },
      }),
      prisma.product.findMany({
        where: { isBestSeller: true, status: 'PUBLISHED' },
        take: 8,
        include: { images: true, category: true, reviews: { where: { status: 'APPROVED' } } },
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { images: true, category: true, reviews: { where: { status: 'APPROVED' } } },
      }),
      prisma.product.findMany({
        where: { isTrending: true, status: 'PUBLISHED' },
        take: 8,
        include: { images: true, category: true, reviews: { where: { status: 'APPROVED' } } },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: true } } },
      }),
    ]);

    const formatItems = (list) =>
      list.map((p) => {
        const revs = p.reviews || [];
        const avg = revs.length > 0 ? revs.reduce((acc, r) => acc + r.rating, 0) / revs.length : 0;
        return {
          ...p,
          reviewsCount: revs.length,
          averageRating: Number(avg.toFixed(1)),
          primaryImage: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || null,
        };
      });

    return successResponse(res, {
      featured: formatItems(featured),
      bestSellers: formatItems(bestSellers),
      newArrivals: formatItems(newArrivals),
      trending: formatItems(trending),
      categories,
    });
  } catch (error) {
    console.error('getHomeSections error:', error);
    return errorResponse(res, 'Failed to fetch homepage data', 500);
  }
};
