import { z } from 'zod';

export const otpData = z.object({
  id: z.string(),
  userId: z.string(),
  otpHash: z.string(),
  expiresAt: z.number(),
  createdAt: z.number(),
});

export type OtpData = z.infer<typeof otpData>;

export interface IOtpRepository {
  insert(data: Omit<OtpData, 'id'>): Promise<OtpData>;
  findById(id: string): Promise<OtpData | null>;
}
