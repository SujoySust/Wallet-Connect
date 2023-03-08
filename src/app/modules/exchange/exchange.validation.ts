/* eslint-disable @typescript-eslint/no-var-requires */
import { BadRequestException } from '@nestjs/common';
import { ETHService } from 'src/app/core.services/eth.service';
import { Item } from 'src/app/models/item.model';
import {
  BUY_SELL_STATUS_EXPIRED,
  EXCHANGE_STATUS_DONE,
  EXCHANGE_STATUS_FAILED,
  EXCHANGE_STATUS_IN_PROGRESS,
  SELL_OFFER_TYPE_DEFAULT,
  STATUS_ACTIVE,
} from '../../helpers/coreconstants';
import { app, errorResponse, prisma_client, __ } from '../../helpers/functions';
import { User } from '../../models/user.model';
import { TransactionReceipt } from 'web3-eth';
import { Exchange } from './exchange.model';
import Web3 from 'web3';
import { ItemService } from '../item/item.service';
import { OfferValidation } from '../offer/offer.validation';
const web3p = require('web3');
const web3: Web3 = new web3p();

export class ExchangeValidation {
  /**
   * Buy now process validation
   * @param sell_offer_id
   * @param user
   * @returns
   */
  async buyNowValidation(sell_offer_id: number, user: User) {
    const sellOffer = await this.validateFixedSellOffer(sell_offer_id);
    await this.checkBuyNowOwner(sellOffer.user_id, user.id);
    const item = await this.validateItem(sellOffer.item_id);
    await this.checkPendingExchange(item.id);
    return { sellOffer, item };
  }

  /**
   * Accept offer process validation
   * @param buy_offer_id
   * @param user
   * @returns
   */
  async acceptOfferValidation(buy_offer_id: number, user: User) {
    const buyOffer = await this.validateBuyOffer(buy_offer_id);
    const item = await this.validateItem(buyOffer.item_id);
    await this.checkAcceptOfferOwner(user.id, item);
    await this.checkPendingExchange(item.id);
    return { buyOffer, item };
  }

  async exchangeFinishValidation(exchange_id: number, txHash: string) {
    const exchange = await this.validateExchange(exchange_id);
    if (exchange.status == EXCHANGE_STATUS_DONE)
      return { exchange, tx: null, alreadyDone: true };
    const tx = await this.validateExchangeTx(exchange, txHash);
    return { exchange, tx, alreadyDone: false };
  }

  async validateExchangeTx(exchange: Exchange, txHash: string) {
    const token = await prisma_client.paymentToken.findFirst({
      where: {
        id: exchange.payment_token_id,
      },
      include: {
        blockchain: true,
      },
    });
    const ethService = new ETHService(token.blockchain);
    await ethService.init();
    let tx: TransactionReceipt;
    try {
      tx = await ethService.getTransaction(txHash);
      if (
        tx.to.toLowerCase() ==
          token.blockchain.exchange_contract.toLowerCase() &&
        (tx.from.toLowerCase() == exchange.buyer.wallet_address.toLowerCase() ||
          tx.from.toLowerCase() ==
            exchange.seller.wallet_address.toLowerCase()) &&
        this.checkExUidTxLog(tx, exchange.uid)
        // web3.utils.toUtf8(tx.logs[0].data).search(exchange.uid) >= 0
      )
        return tx;
      else throw new Error();
    } catch (e) {
      console.error(e.stack);
      console.error(
        `Invalid txHash: ${txHash}, chain: ${token.blockchain.slug}, exchange_uid: ${exchange.uid}`,
      );
      this.throwError(__('Invalid txHash:') + ` ${txHash}`);
    }
  }

  checkExUidTxLog(tx: TransactionReceipt, exUid: string): boolean {
    for (let i = 0; i < tx.logs.length; i++) {
      if (web3.utils.toDecimal(tx.logs[i].topics[1]).toString() == exUid)
        return true;
    }
    return false;
  }

  // Validate sell offer
  async validateFixedSellOffer(sell_offer_id: number) {
    const activeSellOffer = await prisma_client.sellOffer.findFirst({
      where: {
        id: sell_offer_id,
        type: SELL_OFFER_TYPE_DEFAULT,
        status: STATUS_ACTIVE,
      },
    });

    if (!activeSellOffer) {
      this.throwError(__('Invalid sell offer!'));
    }

    if (new Date(activeSellOffer.end_date).getTime() < new Date().getTime()) {
      await new OfferValidation().expireSellOffer(activeSellOffer);
      this.throwError(__('Sell offer already expired!'));
    }
    return activeSellOffer;
  }

  // Validate buy offer
  async validateBuyOffer(buy_offer_id: number) {
    const activeBuyOffer = await prisma_client.buyOffer.findFirst({
      where: {
        id: buy_offer_id,
        status: STATUS_ACTIVE,
      },
    });

    if (!activeBuyOffer) {
      this.throwError(__('Invalid buy offer!'));
    }

    if (new Date(activeBuyOffer.end_date).getTime() < new Date().getTime()) {
      await prisma_client.buyOffer.update({
        where: {
          id: activeBuyOffer.id,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_EXPIRED,
        },
      });
      this.throwError(__('Buy offer already expired!'));
    }
    return activeBuyOffer;
  }

  // Validate exchange by id
  async validateExchange(exchange_id: number) {
    const exchange = await prisma_client.exchange.findFirst({
      where: {
        id: exchange_id,
      },
      include: {
        item: {
          include: {
            creator: true,
          },
        },
        seller: true,
        buyer: true,
      },
    });
    if (!exchange) {
      this.throwError(__('Exchange request not valid!'));
    }
    return exchange;
  }

  // Check pending buy and sell offer
  async checkPendingExchange(itemId: number) {
    const exchange = await prisma_client.exchange.findFirst({
      where: {
        item_id: itemId,
        status: {
          not: EXCHANGE_STATUS_FAILED,
        },
      },
    });
    if (exchange) {
      if (exchange.status == EXCHANGE_STATUS_IN_PROGRESS)
        this.throwError(__('Item is under a sale process already.'));
    }
  }

  // Check buy now owner
  async checkBuyNowOwner(sell_offer_user_id: number, user_id: number) {
    if (sell_offer_user_id === user_id) {
      this.throwError(__('You can not buy your own item!'));
    }
  }

  // Check item owner with authenticated user
  async checkAcceptOfferOwner(user_id: number, item: Item) {
    if (item.owner_id !== user_id) {
      const itemService = app.get(ItemService);
      const syncedOwner = await itemService.syncItemOwner(item.id);
      if (syncedOwner?.id != user_id)
        this.throwError(__('You are not the owner of this item.'));
    }
  }

  // Validate item
  async validateItem(item_id: number) {
    const item = await prisma_client.item.findFirst({
      where: {
        id: item_id,
        status: STATUS_ACTIVE,
        is_minted: STATUS_ACTIVE,
        collection: {
          status: STATUS_ACTIVE,
        },
      },
      include: {
        collection: {
          include: {
            blockchain: true,
          },
        },
        owner: true,
      },
    });
    if (!item) {
      this.throwError(__('Invalid Item!'));
    }
    if (item.collection.blockchain.status != STATUS_ACTIVE) {
      this.throwError(
        __("This item's blockchain is not active. Can't do this action now"),
      );
    }
    return item;
  }

  throwError(error: string) {
    throw new BadRequestException(errorResponse(error));
  }
}
