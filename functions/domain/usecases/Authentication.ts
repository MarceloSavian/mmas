import { AccountSchema, LoginResponse, SignupInput } from '../models/Authentication';

export interface IAuthenticationService {
  signup(input: SignupInput): Promise<AccountSchema>;
  login(email: string, password: string): Promise<LoginResponse>;
}
