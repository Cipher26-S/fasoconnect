import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('A valid email is required'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ARTISAN', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});
