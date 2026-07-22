import { z } from 'zod';

export const dashboardPaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const dashboardMonthlyQuerySchema = z.object({
  months: z.coerce.number().int().positive().max(36).optional().default(12),
});
