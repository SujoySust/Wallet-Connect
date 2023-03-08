import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TransferEventQueue {
  constructor(@InjectQueue('transfer-event') private readonly queue: Queue) {}

  processEvent(event, blockchain) {
    this.queue.add('process-event', {
      event,
      blockchain,
    });
  }
}
