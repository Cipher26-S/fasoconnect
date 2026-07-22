import { z } from 'zod';

export const favoriteArtisanParamSchema = z.object({
  artisanId: z.string().uuid('Invalid artisan ID'),
});

export const favoriteArtisanQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
