import bcrypt from 'bcrypt';
import { IHasher } from '../../data/domain/Hasher';

export class BcryptAdapter implements IHasher {
  constructor(private readonly salt: number) {}

  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, this.salt);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(value, hash);
    return await Promise.resolve(isValid);
  }
}
