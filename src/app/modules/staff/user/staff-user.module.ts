import { Module } from '@nestjs/common';
import { StaffUserResolver } from './staff-user.resolver';
import { StaffUserService } from './staff-user.service';

@Module({
  imports: [],
  providers: [StaffUserResolver, StaffUserService],
})
export class StaffUserModule {}
