import { AccountSchema } from '../../domain/models/Authentication';

export interface IAuthenticationRepository {
  findByEmail(email: string): Promise<AccountSchema | null>;
  findById(id: string): Promise<AccountSchema | null>;
  insert(input: AccountSchema): Promise<Omit<AccountSchema, 'password'>>;
}
