import { z } from 'zod';

export const authRoles = z.enum(['CODER', 'ADMIN']);
export type AuthRoles = z.infer<typeof authRoles>;

const email = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email must be at most 254 characters');

const baseAccount = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  email,
  password: z.string(),
  role: authRoles,
});

export const accountSchema = baseAccount.extend({
  id: z.string(),
});
export type AccountSchema = z.infer<typeof accountSchema>;

export const loginResponse = z.object({
  mfaRequired: z.boolean(),
  otpId: z.string(),
});

// export const loginResponse = z.object({
//   accessToken: z.string(),
//   expiresIn: z.number(),
//   tokenType: z.enum(['Bearer']),
//   user: accountSchema.omit({ password: true }),
// });
// export type LoginResponse = z.infer<typeof loginResponse>;
//
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

export const signupSchema = baseAccount.extend({
  password,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email,
  password,
});
