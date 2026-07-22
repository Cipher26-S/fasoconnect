import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  favoriteArtisanParamSchema,
  favoriteArtisanQuerySchema,
} from '../../validators/favorite.validator.js';
import {
  addFavoriteArtisanService,
  listFavoriteArtisansService,
  removeFavoriteArtisanService,
} from '../../services/favorite.service.js';

const parseOrFail = (schema, value, next) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    next(new AppError(issue?.message || 'Invalid request data', 400));
    return null;
  }

  return parsed.data;
};

export const listFavoriteArtisans = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(favoriteArtisanQuerySchema, req.query, next);
  if (!query) return;

  const result = await listFavoriteArtisansService(req.user, query);

  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});

export const addFavoriteArtisan = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(favoriteArtisanParamSchema, req.params, next);
  if (!params) return;

  const favorite = await addFavoriteArtisanService(req.user, params.artisanId);

  res.status(201).json({ success: true, data: favorite });
});

export const removeFavoriteArtisan = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(favoriteArtisanParamSchema, req.params, next);
  if (!params) return;

  await removeFavoriteArtisanService(req.user, params.artisanId);

  res.status(200).json({ success: true, message: 'Favorite artisan removed successfully' });
});
