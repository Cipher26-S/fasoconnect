import { z } from 'zod';

export const artisanParamSchema = z.object({
  id: z.string().uuid('Invalid artisan ID'),
});

export const artisanProfileSchema = z.object({
  categoryId: z.string().min(1, 'Category is required').optional(),
  experienceYears: z.coerce.number().int().min(0).optional(),
  hourlyRate: z.coerce.number().positive().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  availability: z.coerce.boolean().optional(),
  fullName: z.string().min(2, 'Full name is required').optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  profilePicture: z.string().optional(),
});

export const verifyArtisanSchema = z.object({
  verified: z.coerce.boolean().optional().default(true),
});

export const artisanQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  availability: z.enum(['true', 'false']).optional(),
  verified: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sortBy: z.enum(['createdAt', 'experience', 'rating']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
