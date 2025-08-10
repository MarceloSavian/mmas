import { AccountSchema, SignupInput } from '../../domain/models/Authentication';
import { IAuthenticationService } from '../../domain/usecases/Authentication';
import { BaseError } from '../../shared/error';
import { IAuthenticationRepository } from '../domain/AuthenticationRepository';
import { IHasher } from '../domain/Hasher';

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly authenticationRepostory: IAuthenticationRepository,
    private readonly hasher: IHasher,
  ) {}

  async signup(input: SignupInput): Promise<AccountSchema> {
    const userExists = await this.authenticationRepostory.findByEmail(input.email);

    if (userExists) throw new BaseError('Email already exists in the system', 400);

    const passwordHash = await this.hasher.hash(input.password);

    return await this.authenticationRepostory.insert({ ...input, password: passwordHash });
  }
}
