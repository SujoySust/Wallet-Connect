import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LogService } from './log.service';

@Global()
@Module({
  imports: [WinstonModule.forRoot({})],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
