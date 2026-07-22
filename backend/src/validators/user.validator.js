import { z } from 'zod';

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  profilePicture: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must contain at least 6 characters'),
});

export const userParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'CUSTOMER', 'ARTISAN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});
