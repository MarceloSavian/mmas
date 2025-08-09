import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationService } from './Authentication';
import { BaseError } from '../../shared/error';
import { SignupInput } from '../../domain/models/Authentication';

describe('AuthenticationService', () => {
  const makeSut = () => {
    const authenticationRepository = {
      findByEmail: vi.fn(),
      insert: vi.fn(),
    };

    const hasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    const sut = new AuthenticationService(authenticationRepository, hasher);

    return { sut, authenticationRepository, hasher };
  };
  describe('signup()', () => {
    const input: SignupInput = {
      username: 'User name',
      email: 'example@test.com',
      password: 'password',
      role: 'ADMIN',
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call email repository correctly', async () => {
      const { sut, authenticationRepository } = makeSut();

      await sut.signup(input);

      expect(authenticationRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(authenticationRepository.findByEmail).toHaveBeenCalledTimes(1);
    });
    it('should return error in case user already exists', async () => {
      const { sut, authenticationRepository } = makeSut();

      authenticationRepository.findByEmail.mockResolvedValueOnce(input);

      const result = sut.signup(input);

      await expect(result).rejects.toThrow(
        new BaseError('Email already exists in the system', 400),
      );
    });
    it('should call hasher correctly', async () => {
      const { sut, hasher } = makeSut();

      await sut.signup(input);

      expect(hasher.hash).toHaveBeenCalledWith(input.password);
      expect(hasher.hash).toHaveBeenCalledTimes(1);
    });
    it('should call insert repository correctly', async () => {
      const { sut, authenticationRepository, hasher } = makeSut();

      authenticationRepository.findByEmail.mockResolvedValueOnce(null);
      hasher.hash.mockResolvedValueOnce('hashed-string');

      await sut.signup(input);

      expect(authenticationRepository.insert).toHaveBeenCalledWith({
        ...input,
        password: 'hashed-string',
      });
      expect(authenticationRepository.insert).toHaveBeenCalledTimes(1);
    });
  });
});
