import {
  AccountSchema,
  loginResponse,
  LoginResponse,
  SignupInput,
} from '../../domain/models/Authentication';
import { IAuthenticationService } from '../../domain/usecases/Authentication';
import { BaseError } from '../../shared/error';
import { IAuthenticationRepository } from '../domain/AuthenticationRepository';
import { IHasher } from '../domain/Hasher';
import { IJwtBuilder } from '../domain/JwtBuilder';

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly authenticationRepostory: IAuthenticationRepository,
    private readonly hasher: IHasher,
    private readonly jwtBuilder: IJwtBuilder,
  ) {}

  async signup(input: SignupInput): Promise<AccountSchema> {
    const userExists = await this.authenticationRepostory.findByEmail(input.email);

    if (userExists) throw new BaseError('Email already exists in the system', 400);

    const passwordHash = await this.hasher.hash(input.password);

    return await this.authenticationRepostory.insert({ ...input, password: passwordHash });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.authenticationRepostory.findByEmail(email);

    if (!user) throw new BaseError('Invalid credentials', 400);

    const isPasswordValid = await this.hasher.compare(password, user.password);

    if (!isPasswordValid) throw new BaseError('Invalid credentials', 400);

    const EXPIRES_IN = 60 * 60;

    const jwtData = this.jwtBuilder.encrypt({ id: user.id, role: user.role }, EXPIRES_IN);

    return loginResponse.parse({
      accessToken: jwtData,
      expiresIn: EXPIRES_IN,
      tokenType: 'Bearer',
      user,
    });
  }
}
