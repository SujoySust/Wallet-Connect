import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ExchangeData } from './exchange.data';
import { ExchangeResolver } from './exchange.resolver';
import { ExchangeService } from './exchange.service';
import { ExchangeValidation } from './exchange.validation';

@Module({
  imports: [UserModule],
  providers: [
    ExchangeService,
    ExchangeResolver,
    ExchangeData,
    ExchangeValidation,
  ],
})
export class ExchangeModule {}
