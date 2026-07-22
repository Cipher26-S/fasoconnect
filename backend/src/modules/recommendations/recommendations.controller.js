import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import { artisanRecommendationQuerySchema } from '../../validators/recommendation.validator.js';
import { recommendArtisansService } from '../../services/recommendation.service.js';

const parseOrFail = (schema, value, next) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    next(new AppError(issue?.message || 'Invalid request data', 400));
    return null;
  }

  return parsed.data;
};

export const recommendArtisans = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(artisanRecommendationQuerySchema, req.query, next);
  if (!query) return;

  const result = await recommendArtisansService(query, req.user);

  res.status(200).json({ success: true, context: result.context, data: result.data });
});
