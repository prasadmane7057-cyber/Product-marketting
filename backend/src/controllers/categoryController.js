import { prisma } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, categories, 'Categories loaded');
  } catch (error) {
    console.error('getCategories error:', error);
    return errorResponse(res, 'Failed to fetch categories', 500);
  }
};

export const adminCreateCategory = async (req, res) => {
  try {
    const { name, slug, description, image, parentId } = req.body;
    if (!name) {
      return errorResponse(res, 'Category name is required', 400);
    }
    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (existing) {
      return errorResponse(res, 'Category with this slug already exists', 409);
    }

    const created = await prisma.category.create({
      data: {
        name,
        slug: catSlug,
        description,
        image,
        parentId,
      },
    });
    return successResponse(res, created, 'Category created successfully', 201);
  } catch (error) {
    console.error('adminCreateCategory error:', error);
    return errorResponse(res, 'Failed to create category', 500);
  }
};
