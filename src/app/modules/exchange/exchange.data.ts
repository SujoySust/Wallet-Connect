import { Injectable } from '@nestjs/common';
import { EXCHANGE_STATUS_IN_PROGRESS } from 'src/app/helpers/coreconstants';
import { getUidFromTime } from 'src/app/helpers/functions';
import { BuyOffer } from '../offer/buy/buy-offer.model';
import { SellOffer } from '../offer/sell/sell-offer.model';

@Injectable()
export class ExchangeData {
  async prepareBuyNowData(sellOffer: SellOffer) {
    const data = {
      uid: getUidFromTime(),
      total_amount: sellOffer.total_amount,
      status: EXCHANGE_STATUS_IN_PROGRESS,
    };
    return data;
  }

  async prepareAcceptOfferData(buyOffer: BuyOffer) {
    const data = {
      uid: getUidFromTime(),
      total_amount: buyOffer.total_amount,
      status: EXCHANGE_STATUS_IN_PROGRESS,
    };
    return data;
  }
}
