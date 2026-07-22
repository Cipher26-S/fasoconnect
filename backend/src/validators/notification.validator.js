import { z } from 'zod';

const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

export const notificationParamSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export const notificationQuerySchema = z.object({
  user: z.string().uuid('Invalid user ID').optional(),
  isRead: booleanQuerySchema.optional(),
  date: z.string().date('Invalid date').optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
