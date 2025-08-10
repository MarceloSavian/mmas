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
import { IOtpRepository } from '../domain/OtpRepository';
import * as crypto from 'crypto';

//TO-DO move to a different file or either a adapter if it makes sense
function generateOtp(): string {
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE() % 1_000_000;
  return number.toString().padStart(6, '0');
}

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly authenticationRepostory: IAuthenticationRepository,
    private readonly hasher: IHasher,
    private readonly jwtBuilder: IJwtBuilder,
    private readonly otpRepository: IOtpRepository,
  ) {}

  async signup(input: SignupInput): Promise<AccountSchema> {
    const userExists = await this.authenticationRepostory.findByEmail(input.email);

    if (userExists) throw new BaseError('Email already exists in the system', 400);

    /**
     *  TODO: I could authenticate this request here with the token
     *  get the user information and ROLE, with that I could guarantee that only admins
     *  create users. I believe it goes a bit out of the scope here but I would have a
     *  object detailing the hierachy of each role
     *
     *  Something like this
     *  const hierachy = { "ADMIN": ["CODER"], "SUPER_ADMIN": ["CODER", "ADMIN"] }
     *
     *  hierachy[user.role].includes(input.role)
     * */

    const passwordHash = await this.hasher.hash(input.password);

    return await this.authenticationRepostory.insert({ ...input, password: passwordHash });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.authenticationRepostory.findByEmail(email);

    if (!user) throw new BaseError('Invalid credentials', 400);

    const isPasswordValid = await this.hasher.compare(password, user.password);

    if (!isPasswordValid) throw new BaseError('Invalid credentials', 400);

    const createdAt = new Date().getTime();
    const expiresAt = createdAt + 60 * 60;
    const otpNumber = generateOtp();

    const otpHash = await this.hasher.hash(otpNumber);

    const otp = await this.otpRepository.insert({ createdAt, expiresAt, otpHash, userId: user.id });
    // const EXPIRES_IN = 60 * 60;
    //
    // const jwtData = this.jwtBuilder.encrypt({ id: user.id, role: user.role }, EXPIRES_IN);
    //
    // return loginResponse.parse({
    //   accessToken: jwtData,
    //   expiresIn: EXPIRES_IN,
    //   tokenType: 'Bearer',
    //   user,
    // });
  }
}
