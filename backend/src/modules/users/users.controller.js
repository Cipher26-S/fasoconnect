import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  changePasswordSchema,
  listUsersQuerySchema,
  profileUpdateSchema,
  updateUserStatusSchema,
  userParamSchema,
} from '../../validators/user.validator.js';
import {
  getUserProfileById,
  listUsersService,
  updateUserProfile,
  updateUserStatusService,
  changeUserPassword,
} from '../../services/user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfileById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

export const listUsers = asyncHandler(async (req, res, next) => {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const result = await listUsersService(parsed.data);

  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});

export const updateUserStatus = asyncHandler(async (req, res, next) => {
  const params = userParamSchema.safeParse(req.params);
  if (!params.success) {
    const issue = params.error.issues?.[0] || params.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const body = updateUserStatusSchema.safeParse(req.body);
  if (!body.success) {
    const issue = body.error.issues?.[0] || body.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const user = await updateUserStatusService(params.data.id, body.data.status);

  res.status(200).json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const user = await updateUserProfile(req.user.id, parsed.data);

  res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  await changeUserPassword(req.user.id, parsed.data.currentPassword, parsed.data.newPassword);

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});
