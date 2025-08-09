import { z } from 'zod';

export const authRoles = z.enum(['CODER', 'ADMIN']);
export type AuthRoles = z.infer<typeof authRoles>;

export const accountSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Only letters, numbers, dots, underscores, and hyphens are allowed',
    ),

  email: z.string().email('Invalid email format').max(254, 'Email must be at most 254 characters'),

  password: z.string(),

  role: authRoles,
});
export type AccountSchema = z.infer<typeof accountSchema>;

export const signupSchema = accountSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export type SignupInput = z.infer<typeof signupSchema>;
