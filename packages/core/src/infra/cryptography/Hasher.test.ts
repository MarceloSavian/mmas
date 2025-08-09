import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { BcryptAdapter } from './Hasher';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('BcryptAdapter', () => {
  const salt = 12;

  const makeSut = () => {
    const sut = new BcryptAdapter(salt);
    return { sut };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hash()', () => {
    it('should call bcrypt.hash with correct values', async () => {
      const { sut } = makeSut();
      (bcrypt.hash as any).mockResolvedValueOnce('hashed-value');

      const result = await sut.hash('any-value');

      expect(bcrypt.hash).toHaveBeenCalledWith('any-value', salt);
      expect(result).toBe('hashed-value');
    });
  });

  describe('compare()', () => {
    it('should call bcrypt.compare with correct values', async () => {
      const { sut } = makeSut();
      (bcrypt.compare as any).mockResolvedValueOnce(true);

      const result = await sut.compare('plain', 'hashed');

      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
      expect(result).toBe(true);
    });

    it('should return false if bcrypt.compare returns false', async () => {
      const { sut } = makeSut();
      (bcrypt.compare as any).mockResolvedValueOnce(false);

      const result = await sut.compare('plain', 'hashed');

      expect(result).toBe(false);
    });
  });
});
