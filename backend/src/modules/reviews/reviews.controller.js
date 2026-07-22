import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  createReviewSchema,
  reviewParamSchema,
  reviewQuerySchema,
} from '../../validators/review.validator.js';
import {
  createReviewService,
  getReviewByIdService,
  listReviewsService,
} from '../../services/review.service.js';

const parseOrFail = (schema, value, next) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    next(new AppError(issue?.message || 'Invalid request data', 400));
    return null;
  }

  return parsed.data;
};

export const createReview = asyncHandler(async (req, res, next) => {
  const body = parseOrFail(createReviewSchema, req.body, next);
  if (!body) return;

  const review = await createReviewService(req.user, body);

  res.status(201).json({ success: true, data: review });
});

export const listReviews = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(reviewQuerySchema, req.query, next);
  if (!query) return;

  const result = await listReviewsService(query, req.user);

  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});

export const getReviewById = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(reviewParamSchema, req.params, next);
  if (!params) return;

  const review = await getReviewByIdService(params.id, req.user);

  res.status(200).json({ success: true, data: review });
});
