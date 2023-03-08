import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ExchangeService } from 'src/app/modules/exchange/exchange.service';
import { app } from '../../helpers/functions';

@Processor('exchange-event')
export class ExchangeEventProcessor {
  @Process('process-event')
  async processEvent(job: Job) {
    const { event, blockchain } = job.data;
    const excService = app.get(ExchangeService);
    excService.processExchangeForEvent(event, blockchain);
  }
}
