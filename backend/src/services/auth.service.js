import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';

const signAccessToken = (user) => jwt.sign({ id: user.id, role: user.role, tokenType: 'access' }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
});

const signRefreshToken = (user) => jwt.sign({ id: user.id, role: user.role, tokenType: 'refresh' }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
});

const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
});

export const registerUser = async ({ fullName, email, password, phone, role = 'CUSTOMER' }) => {
  const normalizedRole = role.toUpperCase();

  if (normalizedRole === 'ADMIN' && process.env.NODE_ENV === 'production' && process.env.ALLOW_ADMIN_REGISTRATION !== 'true') {
    throw new AppError('Public administrator registration is disabled', 403);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: normalizedRole,
    },
  });

  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: toPublicUser(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('This account is suspended', 403);
  }

  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: toPublicUser(user),
  };
};

export const refreshAccessToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.tokenType !== 'refresh') {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, fullName: true, email: true, role: true, status: true },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('This account is suspended', 403);
    }

    return {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user,
    };
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};
