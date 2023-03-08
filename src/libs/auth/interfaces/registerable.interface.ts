import { Token } from '../models/token.model';

export interface RegisterableAuthServiceInterface {
  register(payload): Promise<Token>;
}
