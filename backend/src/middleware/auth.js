import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';
import asyncHandler from '../common/asyncHandler.js';

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is required', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tokenType !== 'access') {
      return next(new AppError('Invalid authentication token', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        profilePicture: true,
        phone: true,
        city: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    if (user.status !== 'ACTIVE') {
      return next(new AppError('This account is suspended', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token', 401));
  }
});

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

export default auth;
