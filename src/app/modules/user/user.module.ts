import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { MailVerificationNotification } from '../../notifications/mailverification.notification';
import { PasswordService } from '../../../libs/auth/password.service';

@Module({
  providers: [
    UserResolver,
    UserService,
    MailVerificationNotification,
    PasswordService,
  ],
  exports: [UserService],
})
export class UserModule {}
