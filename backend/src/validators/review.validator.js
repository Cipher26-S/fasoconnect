import { z } from 'zod';

export const reviewParamSchema = z.object({
  id: z.string().uuid('Invalid review ID'),
});

export const createReviewSchema = z.object({
  serviceRequestId: z.string().uuid('Invalid service request ID'),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().trim().max(1000, 'Comment is too long').optional(),
});

export const reviewQuerySchema = z.object({
  serviceRequest: z.string().uuid('Invalid service request ID').optional(),
  reviewer: z.string().uuid('Invalid reviewer ID').optional(),
  reviewee: z.string().uuid('Invalid reviewee ID').optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  date: z.string().date('Invalid date').optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
