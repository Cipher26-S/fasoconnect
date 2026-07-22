import { z } from 'zod';

const assignmentStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']);

export const assignmentParamSchema = z.object({
  id: z.string().uuid('Invalid assignment ID'),
});

export const createAssignmentSchema = z.object({
  serviceRequestId: z.string().uuid('Invalid service request ID'),
  artisanId: z.string().uuid('Invalid artisan ID'),
  message: z.string().trim().max(500, 'Message is too long').optional(),
});

export const assignmentQuerySchema = z.object({
  status: assignmentStatusSchema.optional(),
  artisan: z.string().uuid('Invalid artisan ID').optional(),
  serviceRequest: z.string().uuid('Invalid service request ID').optional(),
  date: z.string().date('Invalid date').optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
