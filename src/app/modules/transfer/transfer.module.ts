import { Module } from '@nestjs/common';
import { TransferReslover } from './transfer.resolver';
import { TransferService } from './transfer.service';

@Module({
  providers: [TransferReslover, TransferService],
})
export class TransferModule {}
