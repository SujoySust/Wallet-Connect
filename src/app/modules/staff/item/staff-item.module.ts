import { Module } from '@nestjs/common';
import { StaffItemResolver } from './staff-item.resolver';
import { StaffItemService } from './staff-item.service';

@Module({
  imports: [],
  providers: [StaffItemResolver, StaffItemService],
})
export class StaffItemModule {}
