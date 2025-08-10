import * as jwt from 'jsonwebtoken';
import { JwtBuilder } from './JwtBuilder';
import { describe, expect, Mock, test, vi } from 'vitest';
import { jscDescribe } from 'bun:jsc';

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

const mockSut = () => {
  const secret = 'secret';
  const sut = new JwtBuilder('secret');

  return {
    sut,
    secret,
  };
};

describe('JwtBuilder', () => {
  describe('sign()', () => {
    test('Should call Jwt sign with correct values', () => {
      const { sut, secret } = mockSut();
      sut.encrypt('any_id');
      expect(jwt.sign).toHaveBeenCalledWith({ id: 'any_id' }, secret);
    });
    test('Should return a token on sign success', () => {
      const { sut } = mockSut();
      (jwt.sign as Mock).mockReturnValueOnce('any_token');
      const accessToken = sut.encrypt('any_id');
      expect(accessToken).toBe('any_token');
    });
    test('Should throw if sign thorws', () => {
      const { sut } = mockSut();
      (jwt.sign as Mock).mockImplementationOnce(() => {
        throw new Error('test');
      });
      try {
        sut.encrypt('any_id');
      } catch (error) {
        expect(error).toEqual(new Error('test'));
      }
    });
  });
  describe('verify()', () => {
    test('Should call Jwt verify with correct values', () => {
      const { sut, secret } = mockSut();
      sut.decrypt('any_token');
      expect(jwt.verify).toHaveBeenCalledWith('any_token', secret);
    });
    test('Should return a value on verify success', () => {
      const { sut } = mockSut();
      (jwt.verify as Mock).mockReturnValueOnce('any_value');
      const value = sut.decrypt('any_token');
      expect(value).toBe('any_value');
    });
    test('Should throw if verify thorws', () => {
      const { sut } = mockSut();
      (jwt.verify as Mock).mockImplementationOnce(() => {
        throw new Error('test');
      });
      try {
        sut.decrypt('any_token');
      } catch (error) {
        expect(error).toStrictEqual(new Error('test'));
      }
    });
  });
});
