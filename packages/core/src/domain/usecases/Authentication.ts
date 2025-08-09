import { SignupInput } from '../models/Authentication';

export interface IAuthenticationService {
  signup(input: SignupInput): Promise<null>;
}
