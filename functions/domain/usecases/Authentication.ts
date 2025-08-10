import { AccountSchema, SignupInput } from '../models/Authentication';

export interface IAuthenticationService {
  signup(input: SignupInput): Promise<AccountSchema>;
}
