import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ExchangeEventQueue {
  constructor(@InjectQueue('exchange-event') private readonly queue: Queue) {}

  processEvent(event, blockchain) {
    this.queue.add('process-event', {
      event,
      blockchain,
    });
  }
}
