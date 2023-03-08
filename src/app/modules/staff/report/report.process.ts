import {
  BUY_SELL_STATUS_COMPLETED,
  EXCHANGE_STATUS_DONE,
} from 'src/app/helpers/coreconstants';
import { prisma_client } from 'src/app/helpers/functions';

export async function feeCalulation() {
  const buy = await prisma_client.buyOffer.groupBy({
    by: ['payment_token_id'],
    where: {
      status: BUY_SELL_STATUS_COMPLETED,
      exchanges: {
        some: {
          status: EXCHANGE_STATUS_DONE,
        },
      },
    },
    _sum: {
      total_amount: true,
      seller_amount: true,
      fee_amount: true,
    },
  });

  const sell = await prisma_client.sellOffer.groupBy({
    by: ['payment_token_id'],
    where: {
      status: BUY_SELL_STATUS_COMPLETED,
      exchanges: {
        some: {
          status: EXCHANGE_STATUS_DONE,
          buy_offer_id: null,
        },
      },
    },
    _sum: {
      total_amount: true,
      seller_amount: true,
      fee_amount: true,
    },
  });

  buy.push(...sell);
  return buy;
}

export function processAmountSum(paymentTokenFees) {
  const initialFee = {
    total_amount: 0.0,
    fee_amount: 0.0,
    seller_amount: 0.0,
  };
  const totalFees = paymentTokenFees.reduce((init, item) => {
    const total_amount = parseFloat(item.payment_token.usd_rate.toString())
      ? parseFloat(item.total_amount.toString()) *
        parseFloat(item.payment_token.usd_rate.toString())
      : parseFloat(item.total_amount.toString());

    const fee_amount = parseFloat(item.payment_token.usd_rate.toString())
      ? parseFloat(item.fee_amount.toString()) *
        parseFloat(item.payment_token.usd_rate.toString())
      : parseFloat(item.fee_amount.toString());

    const seller_amount = parseFloat(item.payment_token.usd_rate.toString())
      ? parseFloat(item.seller_amount.toString()) *
        parseFloat(item.payment_token.usd_rate.toString())
      : parseFloat(item.seller_amount.toString());

    return {
      total_amount: init.total_amount + total_amount,
      fee_amount: init.fee_amount + fee_amount,
      seller_amount: init.seller_amount + seller_amount,
    };
  }, initialFee);

  return totalFees;
}
