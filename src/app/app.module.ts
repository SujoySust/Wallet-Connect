import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { SettingModule } from './modules/staff/setting/setting.module';
import { StaffModule } from './modules/staff/staff.module';
import { UserModule } from './modules/user/user.module';

import { APP_GUARD } from '@nestjs/core';
import { GqlThrottlerGuard } from 'src/libs/guards/gqlThrottle.guard';

@Module({
  imports: [AuthModule, UserModule, SettingModule, StaffModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
