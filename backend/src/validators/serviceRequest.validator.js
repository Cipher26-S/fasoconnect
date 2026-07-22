import { z } from 'zod';

const requestStatusSchema = z.enum([
  'PENDING',
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

const optionalDateSchema = z.string().datetime({ offset: true }).optional().or(z.string().date().optional());

export const serviceRequestParamSchema = z.object({
  id: z.string().uuid('Invalid service request ID'),
});

export const createServiceRequestSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  artisanId: z.string().uuid('Invalid artisan ID').optional(),
  title: z.string().trim().min(3, 'Title is required'),
  description: z.string().trim().min(10, 'Description is too short'),
  location: z.string().trim().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  budget: z.coerce.number().positive().optional(),
  scheduledAt: optionalDateSchema,
});

export const updateServiceRequestSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  artisanId: z.string().uuid('Invalid artisan ID').nullable().optional(),
  title: z.string().trim().min(3, 'Title is required').optional(),
  description: z.string().trim().min(10, 'Description is too short').optional(),
  location: z.string().trim().nullable().optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  budget: z.coerce.number().positive().nullable().optional(),
  scheduledAt: optionalDateSchema.nullable().optional(),
  status: requestStatusSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export const updateServiceRequestStatusSchema = z.object({
  status: requestStatusSchema,
});

export const serviceRequestQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: requestStatusSchema.optional(),
  city: z.string().trim().optional(),
  customer: z.string().trim().optional(),
  artisan: z.string().trim().optional(),
  date: z.string().date('Invalid date').optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sortBy: z.enum(['createdAt', 'scheduledAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
