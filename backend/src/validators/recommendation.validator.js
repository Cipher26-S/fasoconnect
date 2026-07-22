import { z } from 'zod';

const booleanQuerySchema = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean());

export const artisanRecommendationQuerySchema = z.object({
  serviceRequestId: z.string().uuid('Invalid service request ID').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  category: z.string().trim().min(1, 'Category is required').optional(),
  city: z.string().trim().min(1, 'City is required').optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  maxDistanceKm: z.coerce.number().positive().max(500).optional(),
  budget: z.coerce.number().positive().optional(),
  availabilityOnly: booleanQuerySchema.optional().default(true),
  verifiedOnly: booleanQuerySchema.optional().default(false),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
}).refine((data) => data.serviceRequestId || data.categoryId || data.category, {
  message: 'Service request, category ID or category name is required',
});
