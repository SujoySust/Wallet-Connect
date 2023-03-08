export interface JwtDto {
  /*
   * Model Auth identifier, can be id or email or username
   * */
  authIdentifier: string | number;
  /*
   * Authentication Provider
   * */
  provider: string;
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;
}
