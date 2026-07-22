import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import { createCategorySchema } from '../../validators/category.validator.js';
import { listCategoriesService, createCategoryService } from '../../services/category.service.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await listCategoriesService();

  res.status(200).json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const category = await createCategoryService(parsed.data);
  res.status(201).json({ success: true, data: category });
});
