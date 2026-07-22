import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  artisanParamSchema,
  artisanProfileSchema,
  artisanQuerySchema,
  verifyArtisanSchema,
} from '../../validators/artisan.validator.js';
import { serializeArtisan } from '../../utils/serialization.js';
import {
  upsertArtisanProfile,
  listArtisansService,
  getArtisanProfileService,
  getOwnArtisanProfileService,
  deleteArtisanProfileService,
  uploadArtisanProfilePicture,
  verifyArtisanProfileService,
} from '../../services/artisan.service.js';

const buildPayload = async (req, data) => {
  let profilePictureUrl = null;

  if (req.file) {
    profilePictureUrl = await uploadArtisanProfilePicture(req.file);
  } else if (data.profilePicture) {
    profilePictureUrl = data.profilePicture;
  }

  return {
    ...data,
    ...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
  };
};

export const createOrUpdateArtisanProfile = asyncHandler(async (req, res, next) => {
  const parsed = artisanProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const payload = await buildPayload(req, parsed.data);
  const { artisan, created } = await upsertArtisanProfile(req.user.id, payload);

  res.status(created ? 201 : 200).json({ success: true, data: serializeArtisan(artisan) });
});

export const updateArtisanProfile = asyncHandler(async (req, res, next) => {
  const parsed = artisanProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const payload = await buildPayload(req, parsed.data);
  const { artisan, created } = await upsertArtisanProfile(req.user.id, payload);

  res.status(created ? 201 : 200).json({ success: true, data: serializeArtisan(artisan) });
});

export const listArtisans = asyncHandler(async (req, res, next) => {
  const parsed = artisanQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const result = await listArtisansService(parsed.data);

  res.status(200).json({ success: true, data: result.data.map(serializeArtisan), pagination: result.pagination });
});

export const getMyArtisanProfile = asyncHandler(async (req, res, next) => {
  const artisan = await getOwnArtisanProfileService(req.user.id);

  if (!artisan) {
    return next(new AppError('Artisan profile not found', 404));
  }

  res.status(200).json({ success: true, data: serializeArtisan(artisan) });
});

export const getArtisanProfile = asyncHandler(async (req, res, next) => {
  const parsed = artisanParamSchema.safeParse(req.params);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const artisan = await getArtisanProfileService(parsed.data.id);

  if (!artisan) {
    return next(new AppError('Artisan profile not found', 404));
  }

  res.status(200).json({ success: true, data: serializeArtisan(artisan) });
});

export const deleteArtisanProfile = asyncHandler(async (req, res, next) => {
  try {
    await deleteArtisanProfileService(req.user.id);
    res.status(200).json({ success: true, message: 'Artisan profile deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    throw error;
  }
});

export const verifyArtisanProfile = asyncHandler(async (req, res, next) => {
  try {
    const params = artisanParamSchema.safeParse(req.params);
    if (!params.success) {
      const issue = params.error.issues?.[0] || params.error.errors?.[0];
      return next(new AppError(issue?.message || 'Invalid request data', 400));
    }

    const parsed = verifyArtisanSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
      return next(new AppError(issue?.message || 'Invalid request data', 400));
    }

    const artisan = await verifyArtisanProfileService(params.data.id, parsed.data.verified);
    res.status(200).json({ success: true, data: serializeArtisan(artisan) });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    throw error;
  }
});
