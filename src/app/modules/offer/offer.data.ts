import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { STATUS_ACTIVE } from 'src/app/helpers/coreconstants';
import { getPercantageValue, getUUID } from 'src/app/helpers/functions';
import { SETTINGS_BUY_SELL_FEE_PERCENTAGE } from 'src/app/helpers/slugconstants';
import { Item } from 'src/app/models/item.model';
import { CreateBidDto, CreateBuyOfferDto } from './offer.dto';
import { CreateSellOfferDto } from './offer.dto';

@Injectable()
export class OfferData {
  async prepareSellOfferData(
    payload: CreateSellOfferDto,
    item: Item,
    settings: any,
  ) {
    const {
      total_amount,
      seller_amount,
      fee_percentage,
      fee_amount,
      royalty_percentage,
      royalty_amount,
    } = await this.calculateAmount(payload, item, settings);

    const data = {
      uid: getUUID(),
      type: payload.type,
      signature: payload.signature,
      nonce: payload.nonce,
      total_amount: total_amount.toString(),
      seller_amount: seller_amount.toString(),
      fee_percentage: fee_percentage,
      fee_amount: fee_amount.toString(),
      royalty_address: item.collection.payout_address,
      royalty_percentage: royalty_percentage,
      royalty_amount: royalty_amount.toString(),
      start_date: new Date(payload.start_date),
      end_date: new Date(payload.end_date),
      reserved_address: payload.reserved_address,
      reserved_price:
        payload.reserved_price ||
        item.payment_token.min_amount_to_execute_auction,
      status: STATUS_ACTIVE,
    };
    return data;
  }

  async prepareBuyOfferData(
    payload: CreateBuyOfferDto | CreateBidDto,
    item: Item,
    settings: any,
  ) {
    const {
      total_amount,
      seller_amount,
      fee_percentage,
      fee_amount,
      royalty_percentage,
      royalty_amount,
    } = await this.calculateAmount(payload, item, settings);

    const data = {
      uid: getUUID(),
      type: payload.type,
      signature: payload.signature,
      nonce: payload.nonce,
      total_amount: total_amount.toString(),
      seller_amount: seller_amount.toString(),
      fee_percentage: fee_percentage,
      fee_amount: fee_amount.toString(),
      royalty_address: item.collection.payout_address,
      royalty_percentage: royalty_percentage,
      royalty_amount: royalty_amount.toString(),
      start_date: new Date(payload.start_date),
      end_date: new Date(payload.end_date),
      status: STATUS_ACTIVE,
    };
    return data;
  }

  async calculateAmount(
    payload: CreateSellOfferDto | CreateBuyOfferDto | CreateBidDto,
    item: Item,
    settings: { [x: string]: string },
  ) {
    const total_amount = payload.amount;
    const fee_percentage = settings[SETTINGS_BUY_SELL_FEE_PERCENTAGE]
      ? parseFloat(settings[SETTINGS_BUY_SELL_FEE_PERCENTAGE])
      : 0;
    const fee_amount = fee_percentage
      ? getPercantageValue(total_amount, fee_percentage)
      : 0;
    const royalty_percentage = item.collection.royalties;

    const royalty_amount = royalty_percentage
      ? getPercantageValue(total_amount, royalty_percentage)
      : 0;
    const seller_amount = total_amount - fee_amount - royalty_amount;
    return {
      total_amount,
      seller_amount,
      fee_percentage,
      fee_amount,
      royalty_percentage,
      royalty_amount,
    };
  }
}
