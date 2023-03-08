import { ResetPasswordInput } from '../dto/reset-password.input';

export interface PasswordResettableAuthServiceInterface {
  sendForgetPasswordNotification(payload): Promise<boolean>;
  resetPassword(payload: ResetPasswordInput): Promise<boolean>;
}
