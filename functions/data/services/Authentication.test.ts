import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationService } from './Authentication';
import { BaseError } from '../../shared/error';
import { loginResponse, mfaResponse, SignupInput } from '../../domain/models/Authentication';

describe('AuthenticationService', () => {
  const makeSut = () => {
    const authenticationRepository = {
      findByEmail: vi.fn(),
      insert: vi.fn(),
      findById: vi.fn(),
    };

    const hasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    const jwtBuilder = {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    };

    const otpRepository = {
      insert: vi.fn(),
      findById: vi.fn(),
    };

    const sut = new AuthenticationService(
      authenticationRepository,
      hasher,
      jwtBuilder,
      otpRepository,
    );

    return { sut, authenticationRepository, hasher, jwtBuilder, otpRepository };
  };

  const fixedDate = new Date('2020-01-01T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    vi.clearAllMocks();
  });

  const input: SignupInput = {
    username: 'User name',
    email: 'example@test.com',
    password: 'password',
    role: 'ADMIN',
  };

  describe('signup()', () => {
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
  describe('login()', () => {
    it('should throw error if user is not found', async () => {
      const { sut, authenticationRepository } = makeSut();

      authenticationRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(sut.login('test@test.com', '123456')).rejects.toThrow(
        new BaseError('Invalid credentials', 400),
      );
    });

    it('should throw error if password is invalid', async () => {
      const { sut, authenticationRepository, hasher } = makeSut();

      authenticationRepository.findByEmail.mockResolvedValueOnce(input);
      hasher.compare.mockResolvedValueOnce(false);

      await expect(sut.login('example@test.com', 'wrong-password')).rejects.toThrow(
        new BaseError('Invalid credentials', 400),
      );
    });
    it('should create otp value and insert in the repository', async () => {
      const { sut, authenticationRepository, hasher, otpRepository } = makeSut();

      authenticationRepository.findByEmail.mockResolvedValueOnce({ id: 'test', input });
      hasher.compare.mockResolvedValueOnce(true);
      hasher.hash.mockResolvedValueOnce('hashed_value');
      otpRepository.insert.mockResolvedValueOnce({ id: 'test' });

      const result = await sut.login('test', 'test');

      expect(otpRepository.insert).toHaveBeenCalledWith({
        createdAt: fixedDate.getTime(),
        expiresAt: fixedDate.getTime() + 60 * 60,
        otpHash: 'hashed_value',
        userId: 'test',
      });
      expect(result.mfaRequired).toBeTruthy();
      expect(result.otpId).toStrictEqual('test');
    });
  });
  describe('mfaCheck', () => {
    it('should call every repository with correct values', async () => {
      const { sut, authenticationRepository, otpRepository, hasher, jwtBuilder } = makeSut();

      otpRepository.findById.mockResolvedValueOnce({ otpHash: 'hash', userId: 'user_id' });
      hasher.compare.mockResolvedValueOnce(true);
      authenticationRepository.findById.mockResolvedValueOnce({ ...input, id: 'any' });
      jwtBuilder.encrypt.mockReturnValueOnce('token');

      const result = await sut.mfaCheck('id', 'code');

      expect(otpRepository.findById).toHaveBeenCalledWith('id');
      expect(hasher.compare).toHaveBeenCalledWith('code', 'hash');
      expect(authenticationRepository.findById).toHaveBeenCalledWith('user_id');
      expect(jwtBuilder.encrypt).toHaveBeenCalledWith({ id: 'any', role: input.role }, 60 * 60);

      const expected = mfaResponse.parse({
        accessToken: 'token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: { id: 'any', ...input },
      });

      expect(result).toEqual(expected);
    });
    it('should return error if otp does not exists', async () => {
      const { sut, otpRepository } = makeSut();

      otpRepository.findById.mockResolvedValueOnce(null);

      const promise = sut.mfaCheck('id', 'code');

      await expect(promise).rejects.toEqual(new BaseError('Invalid OTP', 400));
    });
    it('should return error if otp is invalid', async () => {
      const { sut, hasher, otpRepository } = makeSut();

      otpRepository.findById.mockResolvedValueOnce({ otpHash: 'hash' });
      hasher.compare.mockResolvedValueOnce(false);

      const promise = sut.mfaCheck('id', 'code');

      await expect(promise).rejects.toEqual(new BaseError('Invalid OTP', 400));
    });
  });
});
