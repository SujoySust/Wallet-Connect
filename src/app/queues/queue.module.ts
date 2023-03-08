import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UserModule } from '../modules/user/user.module';
import { MintQueue } from './mint.queue';
import { MintProcessor } from './processors/mint.processor';
import { TransferEventQueue } from './transfer-event.queue';
import { TransferEventProcessor } from './processors/transfer-event.processor';
import { ExchangeEventQueue } from './exchange-event.queue';
import { ExchangeEventProcessor } from './processors/exchange-event.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mint',
    }),
    BullModule.registerQueue({
      name: 'transfer-event',
    }),
    BullModule.registerQueue({
      name: 'exchange-event',
    }),
    UserModule,
  ],
  providers: [
    MintQueue,
    MintProcessor,
    TransferEventQueue,
    TransferEventProcessor,
    ExchangeEventQueue,
    ExchangeEventProcessor,
  ],
  exports: [MintQueue, TransferEventQueue, ExchangeEventQueue],
})
export class QueueModule {}
