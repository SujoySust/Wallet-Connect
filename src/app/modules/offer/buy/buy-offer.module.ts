import { Module } from '@nestjs/common';
import { OfferData } from 'src/app/modules/offer/offer.data';
import { OfferValidation } from 'src/app/modules/offer/offer.validation';
import { UserModule } from '../../user/user.module';
import { BuyOfferResolver } from './buy-offer.resolver';
import { BuyOfferService } from './buy-offer.service';

@Module({
  imports: [UserModule],
  providers: [BuyOfferService, BuyOfferResolver, OfferData, OfferValidation],
})
export class BuyOfferModule {}
