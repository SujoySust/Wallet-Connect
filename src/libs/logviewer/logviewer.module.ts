import { Module } from '@nestjs/common';
import { LogviewerService } from './logviewer.service';
import { LogviewerController } from './logviewer.controller';
import { Crons } from './crons/jobs';

@Module({
  controllers: [LogviewerController],
  providers: [LogviewerService /*, Crons */],
})
export class LogviewerModule {}
