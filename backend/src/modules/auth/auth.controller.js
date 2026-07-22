import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import { registerSchema, loginSchema } from '../../validators/auth.validator.js';
import { registerUser, loginUser, refreshAccessToken } from '../../services/auth.service.js';

export const register = asyncHandler(async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const result = await registerUser(parsed.data);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    ...result,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    return next(new AppError(issue?.message || 'Invalid request data', 400));
  }

  const result = await loginUser(parsed.data);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    ...result,
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken: token } = req.body || {};

  if (!token) {
    return next(new AppError('Refresh token is required', 400));
  }

  const result = await refreshAccessToken({ refreshToken: token });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    ...result,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});
