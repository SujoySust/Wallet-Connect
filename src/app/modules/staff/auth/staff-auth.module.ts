import { StaffAuthResolver } from './staff-auth.resolver';
import { Module } from '@nestjs/common';
import { AuthLibraryModule } from '../../../../libs/auth/auth.library.module';
import { StaffAuthService } from './staff.auth.service';

@Module({
  imports: [AuthLibraryModule],
  providers: [StaffAuthService, StaffAuthResolver],
  exports: [],
})
export class StaffAuthModule {}
