import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { Parser } from 'json2csv';
import csv from 'csv-parser';
import stream from 'stream';

export const adminGetProducts = async (req, res) => {
  try {
    const { q, categoryId, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { brand: { contains: q } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
    ]);

    return successResponse(res, {
      items: products,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('adminGetProducts error:', error);
    return errorResponse(res, 'Failed to fetch admin products', 500);
  }
};

export const adminCreateProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      sku,
      shortDesc,
      description,
      brand,
      regularPrice,
      sellingPrice,
      discountPercent,
      isFeatured,
      isBestSeller,
      isTrending,
      status,
      weight,
      dimensions,
      specifications,
      shippingInfo,
      returnWarrantyInfo,
      tags,
      seoTitle,
      seoDescription,
      stockQuantity,
      categoryId,
      images = [],
      variants = [],
    } = req.body;

    if (!name || !sku || !regularPrice || !sellingPrice || !categoryId) {
      return errorResponse(res, 'Name, SKU, regular price, selling price, and category are required', 400);
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check SKU or Slug uniqueness
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ sku }, { slug: generatedSlug }],
      },
    });

    if (existing) {
      return errorResponse(res, 'A product with this SKU or URL slug already exists', 409);
    }

    const reg = parseFloat(regularPrice);
    const sell = parseFloat(sellingPrice);
    const computedDiscount = discountPercent !== undefined ? parseFloat(discountPercent) : ((reg - sell) / reg) * 100;

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        sku,
        shortDesc: shortDesc || name,
        description: description || name,
        brand: brand || 'NovaMarket',
        regularPrice: reg,
        sellingPrice: sell,
        discountPercent: Number(Math.max(0, computedDiscount).toFixed(2)),
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isTrending: Boolean(isTrending),
        status: status || 'PUBLISHED',
        weight,
        dimensions,
        specifications: typeof specifications === 'object' ? JSON.stringify(specifications) : specifications,
        shippingInfo,
        returnWarrantyInfo,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || shortDesc,
        stockQuantity: parseInt(stockQuantity || 50, 10),
        categoryId,
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            altText: img.altText || name,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
            sortOrder: idx,
          })),
        },
        variants: {
          create: variants.map((v) => ({
            name: v.name,
            sku: v.sku || `${sku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            price: parseFloat(v.price || sell),
            stockQuantity: parseInt(v.stockQuantity || 10, 10),
            attributes: typeof v.attributes === 'object' ? JSON.stringify(v.attributes) : v.attributes,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    // Record inventory log
    await prisma.inventoryLog.create({
      data: {
        productId: newProduct.id,
        changeAmount: newProduct.stockQuantity,
        previousStock: 0,
        newStock: newProduct.stockQuantity,
        reason: 'ADMIN_CREATE',
        referenceId: `ADMIN_${req.user.id}`,
      },
    });

    return successResponse(res, newProduct, 'Product created successfully and published to catalogue', 201);
  } catch (error) {
    console.error('adminCreateProduct error:', error);
    return errorResponse(res, 'Failed to create product', 500);
  }
};

export const adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      sku,
      shortDesc,
      description,
      brand,
      regularPrice,
      sellingPrice,
      discountPercent,
      isFeatured,
      isBestSeller,
      isTrending,
      status,
      weight,
      dimensions,
      specifications,
      shippingInfo,
      returnWarrantyInfo,
      tags,
      seoTitle,
      seoDescription,
      stockQuantity,
      categoryId,
      images,
      variants,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });

    if (!existingProduct) {
      return errorResponse(res, 'Product not found', 404);
    }

    const reg = regularPrice !== undefined ? parseFloat(regularPrice) : existingProduct.regularPrice;
    const sell = sellingPrice !== undefined ? parseFloat(sellingPrice) : existingProduct.sellingPrice;
    const computedDiscount = discountPercent !== undefined ? parseFloat(discountPercent) : ((reg - sell) / reg) * 100;

    // Handle stock quantity change in inventory logs
    const newStock = stockQuantity !== undefined ? parseInt(stockQuantity, 10) : existingProduct.stockQuantity;
    if (newStock !== existingProduct.stockQuantity) {
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          changeAmount: newStock - existingProduct.stockQuantity,
          previousStock: existingProduct.stockQuantity,
          newStock,
          reason: 'ADMIN_MANUAL_ADJUSTMENT',
          referenceId: `ADMIN_${req.user.id}`,
        },
      });
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((img, idx) => ({
          productId: id,
          url: img.url,
          altText: img.altText || name || existingProduct.name,
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
          sortOrder: idx,
        })),
      });
    }

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.productVariant.createMany({
        data: variants.map((v) => ({
          productId: id,
          name: v.name,
          sku: v.sku || `${existingProduct.sku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          price: parseFloat(v.price || sell),
          stockQuantity: parseInt(v.stockQuantity || 10, 10),
          attributes: typeof v.attributes === 'object' ? JSON.stringify(v.attributes) : v.attributes,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        slug: slug !== undefined ? slug : undefined,
        sku: sku !== undefined ? sku : undefined,
        shortDesc: shortDesc !== undefined ? shortDesc : undefined,
        description: description !== undefined ? description : undefined,
        brand: brand !== undefined ? brand : undefined,
        regularPrice: reg,
        sellingPrice: sell,
        discountPercent: Number(Math.max(0, computedDiscount).toFixed(2)),
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
        isTrending: isTrending !== undefined ? Boolean(isTrending) : undefined,
        status: status !== undefined ? status : undefined,
        weight: weight !== undefined ? weight : undefined,
        dimensions: dimensions !== undefined ? dimensions : undefined,
        specifications: typeof specifications === 'object' ? JSON.stringify(specifications) : specifications,
        shippingInfo: shippingInfo !== undefined ? shippingInfo : undefined,
        returnWarrantyInfo: returnWarrantyInfo !== undefined ? returnWarrantyInfo : undefined,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
        seoTitle: seoTitle !== undefined ? seoTitle : undefined,
        seoDescription: seoDescription !== undefined ? seoDescription : undefined,
        stockQuantity: newStock,
        categoryId: categoryId !== undefined ? categoryId : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return successResponse(res, updated, 'Product updated successfully');
  } catch (error) {
    console.error('adminUpdateProduct error:', error);
    return errorResponse(res, 'Failed to update product', 500);
  }
};

export const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      await prisma.product.delete({ where: { id } });
      return successResponse(res, null, 'Product permanently removed from database');
    }

    // Soft delete/archive
    const archived = await prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    return successResponse(res, archived, 'Product archived successfully');
  } catch (error) {
    console.error('adminDeleteProduct error:', error);
    return errorResponse(res, 'Failed to delete or archive product', 500);
  }
};

export const adminExportCSV = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    const fields = [
      'id',
      'name',
      'sku',
      'brand',
      'regularPrice',
      'sellingPrice',
      'stockQuantity',
      'status',
      'category.name',
    ];

    const json2csv = new Parser({ fields });
    const csvData = json2csv.parse(products);

    res.header('Content-Type', 'text/csv');
    res.attachment('novamarket-products-export.csv');
    return res.send(csvData);
  } catch (error) {
    console.error('adminExportCSV error:', error);
    return errorResponse(res, 'Failed to export products to CSV', 500);
  }
};

export const adminUploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return successResponse(res, { url: imageUrl, filename: req.file.filename }, 'Image uploaded successfully', 201);
  } catch (error) {
    console.error('adminUploadImage error:', error);
    return errorResponse(res, 'Image upload failed', 500);
  }
};
