import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingResolver } from './setting.resolver';

@Module({
  providers: [SettingService, SettingResolver],
  imports: [],
})
export class SettingModule {}
