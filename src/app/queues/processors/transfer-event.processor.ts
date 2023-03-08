import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TransferService } from 'src/app/modules/transfer/transfer.service';
import { app } from '../../helpers/functions';

@Processor('transfer-event')
export class TransferEventProcessor {
  @Process('process-event')
  async processEvent(job: Job) {
    const { event, blockchain } = job.data;
    const trnsService = app.get(TransferService);
    trnsService.processTransferForEvent(event, blockchain);
  }
}
