import prisma from '../config/prisma.js';

export const listCategoriesService = async () => prisma.category.findMany({
  orderBy: { name: 'asc' },
});

export const createCategoryService = async (data) => prisma.category.create({ data });
