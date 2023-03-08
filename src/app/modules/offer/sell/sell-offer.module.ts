import { Module } from '@nestjs/common';
import { OfferData } from 'src/app/modules/offer/offer.data';
import { OfferValidation } from 'src/app/modules/offer/offer.validation';
import { UserModule } from '../../user/user.module';
import { SellOfferResolver } from './sell-offer.resolver';
import { SellOfferService } from './sell-offer.service';

@Module({
  imports: [UserModule],
  providers: [SellOfferService, SellOfferResolver, OfferValidation, OfferData],
})
export class SellOfferModule {}
