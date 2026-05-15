import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['admin', 'member']).optional().default('member'),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedTo: z.string().min(1, 'Assignee is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  deadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid deadline date'),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  deadline: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(['todo', 'in_progress', 'review', 'completed']),
});

export const addCommentSchema = z.object({
  taskId: z.string().min(1),
  text: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export const rescheduleSchema = z.object({
  taskId: z.string().min(1),
  newDeadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export const reviewRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  department: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
