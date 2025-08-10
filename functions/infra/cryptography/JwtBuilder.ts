import * as jwt from 'jsonwebtoken';

import { IJwtBuilder } from '../../data/domain/JwtBuilder';

export class JwtBuilder implements IJwtBuilder {
  constructor(private readonly secret: string) {}

  encrypt(value: string | object, expiresIn?: number): string {
    if (!expiresIn) return jwt.sign({ id: value }, this.secret);
    return jwt.sign({ id: value }, this.secret, { expiresIn });
  }

  decrypt(token: string): string | object | null {
    return jwt.verify(token, this.secret);
  }
}
