import { Token } from '../models/token.model';

export interface AuthServiceInterface {
  login(payload): Promise<Token>;
  getUserByIdentifier(authIdentifier);
  getUserFromToken(token: string);
  refreshToken(token: string): Token;
}
