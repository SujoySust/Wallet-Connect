import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainResolver } from './blockchain.resolver';

@Module({
  providers: [BlockchainService, BlockchainResolver],
  imports: [],
})
export class BlockchainModule {}
