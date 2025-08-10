export interface OtpData {
  id: string;
  userId: string;
  otpHash: string;
  expiresAt: number;
  createdAt: number;
}

export interface IOtpRepository {
  insert(data: Omit<OtpData, 'id'>): Promise<OtpData>;
  findById(id: string): Promise<OtpData>;
}
