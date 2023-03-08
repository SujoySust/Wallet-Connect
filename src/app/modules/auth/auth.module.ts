import { AuthResolver } from './auth.resolver';
import { Module } from '@nestjs/common';
import { QueueModule } from '../../queues/queue.module';
import { MailVerificationNotification } from '../../notifications/mailverification.notification';
import { AuthLibraryModule } from '../../../libs/auth/auth.library.module';
import { UserAuthService } from './user.auth.service';

@Module({
  imports: [AuthLibraryModule, QueueModule],
  providers: [UserAuthService, AuthResolver, MailVerificationNotification],
  exports: [],
})
export class AuthModule {}
