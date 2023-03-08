/* eslint-disable prettier/prettier */
import { BadRequestException } from '@nestjs/common';
import {
  BUY_OFFER_TYPE_BID,
  BUY_SELL_STATUS_ACTIVE,
  BUY_SELL_STATUS_EXPIRED,
  EXCHANGE_STATUS_IN_PROGRESS,
  NULL_ETH_ADDRESS,
  OFFER_TYPE_BUY,
  OFFER_TYPE_SELL,
  PAYMENT_TOKEN_TYPE_NATIVE_COIN,
  PAYMENT_TOKEN_TYPE_TOKEN,
  SELL_OFFER_TYPE_DEFAULT,
  STATUS_ACTIVE,
} from '../../helpers/coreconstants';
import {
  addMinutes,
  app,
  convertTokenAmountToInt,
  errorResponse,
  prisma_client,
  __,
} from '../../helpers/functions';
import { User } from '../../models/user.model';
import { CreateBidDto, CreateBuyOfferDto } from './offer.dto';
import { CreateSellOfferDto } from './offer.dto';
import * as ethers from 'ethers';
import { buyType, domainData, sellType } from 'src/app/helpers/corearray';
import { Item } from 'src/app/models/item.model';
import { PaymentTokenModel } from 'src/app/models/paymentToken.model';
import { OfferData } from './offer.data';
import { SETTINGS_MIN_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN, SETTINGS_MAX_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN } from 'src/app/helpers/slugconstants';
import { ItemService } from '../item/item.service';
import { SellOffer } from './sell/sell-offer.model';
import { boolean } from 'joi';
import { SigDataModel } from './sigdata.model';

export class OfferValidation {
  /**
   * Create Sell offer validation
   * @param payload
   * @param user
   * @param settings
   * @returns
   */
  async createSellOfferValidation(
    payload: CreateSellOfferDto,
    user: User,
    settings: any,
    skipSigValidation = false,
  ): Promise<{ item: Item, payment_token: PaymentTokenModel } | boolean | SigDataModel> {
    if (payload.amount <= 0) throw new BadRequestException(errorResponse(__('Amount must be greater than 0.')));
    const item = await this.validateItem(payload.item_id, user.id);
    await this.checkInProgressExchange(item.id);
    await this.checkInProgressTransfer(item.id);
    await this.validateDate(payload.start_date, payload.end_date, settings);
    const payment_token = await this.validatePaymentTokenForSellOffer(
      payload.payment_token_id,
      item,
      payload.type,
    );
    const sigResult = await this.validateSignatureOrGetSigData(
      skipSigValidation ? 'get' : 'validate',
      user,
      payload,
      OFFER_TYPE_SELL,
      item,
      payment_token,
      settings,
    );
    const activSellOffer = await this.getActiveSellOffer(item.id);
    if (activSellOffer) this.throwError(__('Sell already exists!'));
    return skipSigValidation ? sigResult : { item, payment_token };
  }

  /**
   * Create Buy offer validation
   * @param payload
   * @param user
   * @param settings
   * @returns
   */
  async createBuyOfferValidation(
    payload: CreateBuyOfferDto,
    user: User,
    settings: any,
    skipSigValidation = false,
  ): Promise<{ item: Item, payment_token: PaymentTokenModel } | boolean | SigDataModel> {
    if (payload.amount <= 0) throw new BadRequestException(errorResponse(__('Amount must be greater than 0.')));
    const item = await this.validateItem(payload.item_id, user.id, OFFER_TYPE_BUY);
    if (payload.type == BUY_OFFER_TYPE_BID) {
      if (!item['active_sell'])
        this.throwError(__('Invalid Bidding request. No Auction is going on.'));
      if (payload.amount < Number(item['active_sell'].total_amount)) 
        this.throwError(__("Bidding amount can't be less than auction starting price"));
    }
    await this.validateDate(payload.start_date, payload.end_date, settings);
    const payment_token = await this.validatePaymentTokenForBuyOffer(
      payload.payment_token_id,
      item,
      payload.type,
    );
    const activBuyOffer = await this.getActiveBuyOffer(item.id, user.id);
    if (activBuyOffer) this.throwError(__('You already placed an offer, Cancel previous to place new one.'));
    const sigResult = await this.validateSignatureOrGetSigData(
      skipSigValidation ? 'get' : 'validate',
      user,
      payload,
      OFFER_TYPE_BUY,
      item,
      payment_token,
      settings,
    );
    return skipSigValidation ? sigResult : { item, payment_token };
  }

  async createBidValidation(payload: CreateBidDto, user: User, settings: any) {
    /* if (payload.amount <= 0) throw new BadRequestException(errorResponse(__('Amount must be greater than 0.')));
    const item = await this.validateItem(payload.item_id, user.id, OFFER_TYPE_BUY);
    const sellOffer = await this.validateSellOffer(payload.sell_offer_id);
    await this.validateDate(payload.start_date, payload.end_date, settings);
    const payment_token = await this.validatePaymentTokenForBuyOffer(
      payload.payment_token_id,
    );
    return { item, payment_token, sellOffer }; */
  }

  // Check if active sell offer exists
  async getActiveSellOffer(item_id: number) {
    const activeSellOffer = await prisma_client.sellOffer.findFirst({
      where: {
        item_id: item_id,
        status: STATUS_ACTIVE,
      },
      include: {
        payment_token: true,
      }
    });
    if (activeSellOffer) {
      if (
        new Date(activeSellOffer.end_date).getTime() > new Date().getTime()
      ) {
        return activeSellOffer;
      }

      if (activeSellOffer.type == SELL_OFFER_TYPE_DEFAULT) {
        await this.expireSellOffer(activeSellOffer);
      }
    }
    return null;
  }

  async expireSellOffer(sell: SellOffer) {
    await prisma_client.sellOffer.update({
      where: {
        id: sell.id,
      },
      data: {
        signature: null,
        status: BUY_SELL_STATUS_EXPIRED,
      },
    });
    
    await prisma_client.item.update({
      where: {
        id: sell.item_id,
      },
      data: {
        price: 0,
        payment_token_id: null,
      },
    });
  }

  // Check if item is validate
  async validateItem(item_id: number, user_id: number, offer_type = OFFER_TYPE_SELL) {
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
      this.throwError(__("This item's blockchain is not active. Can't make offer now"));
    }

    if (offer_type == OFFER_TYPE_SELL && item.owner_id != user_id) {
      const itemService = app.get(ItemService);
      const syncedOwner = await itemService.syncItemOwner(item.id);
      if (syncedOwner?.id != user_id) this.throwError(__('You are not the owner of this item.'));
    } else if (offer_type == OFFER_TYPE_BUY && item.owner_id == user_id)
      this.throwError(__("You can't create offer on your own item."));

    if (offer_type == OFFER_TYPE_BUY)
      item['active_sell'] = await this.getActiveSellOffer(item.id);  
    return item;
  }

  //check if the item has any auction finishing job in progress
  async checkInProgressExchange(item_id: number) {
    const exchange = await prisma_client.exchange.findFirst({
      where: {
        item_id: item_id,
        status: EXCHANGE_STATUS_IN_PROGRESS
      }
    });
    if (exchange) this.throwError(__("This item is in a Buy Sell process. Try later"));
  }

  //check if the item has any transfer in progress
  async checkInProgressTransfer(item_id: number) {
    const transfer = await prisma_client.transfer.findFirst({
      where: {
        item_id: item_id,
        status: EXCHANGE_STATUS_IN_PROGRESS
      }
    });
    if (transfer) this.throwError(__("Item Transfer in progress. Try again later"));
  }

  // Check date validation
  async validateDate(start_date: string, end_date: string, settings: any) {
    if (new Date(start_date) >= new Date(end_date)) {
      this.throwError(__('End date must be greater than start date'));
    }
    if (
      addMinutes(
        start_date,
        settings[SETTINGS_MIN_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN],
      ) >= new Date(end_date)
    ) {
      const message =
        __('Minimum duration is ') +
        settings[SETTINGS_MIN_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN] +
        __(' min');

      this.throwError(message);
    }

    if (
      addMinutes(
        start_date,
        settings[SETTINGS_MAX_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN],
      ) <= new Date(end_date)
    ) {
      const message =
        __('Maximum duration is ') +
        settings[SETTINGS_MAX_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN] +
        __(' min');

      this.throwError(message);
    }
  }

  // Check payment token validation
  async validatePaymentTokenForSellOffer(
    payment_token_id: number,
    item: Item,
    offer_type: number,
  ) {
    const payment_token = await prisma_client.paymentToken.findFirst({
      where: {
        id: payment_token_id,
        status: STATUS_ACTIVE,
        type: offer_type == SELL_OFFER_TYPE_DEFAULT
          ? PAYMENT_TOKEN_TYPE_NATIVE_COIN : PAYMENT_TOKEN_TYPE_TOKEN,
        blockchain: {
          id: item.collection.blockchain_id,
          status: STATUS_ACTIVE,
        },
        payment_token_mappings: {
          some: {
            payment_token_id: payment_token_id,
            collection_id: item.collection_id,
          }
        }
      },
    });
    if (!payment_token) {
      this.throwError(__('Invalid payment token'));
    }
    return payment_token;
  }

  async validatePaymentTokenForBuyOffer(
    payment_token_id: number,
    item: Item,
    offer_type: number,
  ) {
    const payment_token = await prisma_client.paymentToken.findFirst({
      where: {
        id: payment_token_id,
        status: STATUS_ACTIVE,
        type: PAYMENT_TOKEN_TYPE_TOKEN,
        blockchain: {
          id: item.collection.blockchain_id,
          status: STATUS_ACTIVE,
        },
        payment_token_mappings: {
          some: {
            payment_token_id: payment_token_id,
            collection_id: item.collection_id,
          }
        }
      },
    });
    if (!payment_token) {
      this.throwError(__('Invalid payment token'));
    }

    if (offer_type == BUY_OFFER_TYPE_BID && 
      item['active_sell'].payment_token_id != payment_token_id ) {
        this.throwError(__('Invalid payment token for bidding.'));
    }

    return payment_token;
  }


  // Validate signature
  async validateSignatureOrGetSigData(
    validateOrGet: 'validate' | 'get',
    user: User,
    offerDto: CreateSellOfferDto | CreateBuyOfferDto,
    offer_type: number,
    item: Item,
    payment_token: PaymentTokenModel,
    settings: any,
  ) : Promise<boolean | SigDataModel> {

    const blockchain = item.collection.blockchain;
    domainData.chainId = blockchain.chain_id;
    domainData.verifyingContract = blockchain.exchange_contract;

    const amtObj = await new OfferData().calculateAmount(
      offerDto,
      item,
      settings,
    );

    const offerValue = {
      _nonce: offerDto.nonce,
      _startsAt: parseInt(
        (Number(new Date(offerDto.start_date)) / 1000).toString(),
      ),
      _expiresAt: parseInt(
        (Number(new Date(offerDto.end_date)) / 1000).toString(),
      ),
      _nftContract: blockchain.nft_contract,
      _nftTokenId: item.token_id,
      _paymentTokenContract: payment_token.contract_address,
      _royaltyPayTo: item.collection.payout_address || NULL_ETH_ADDRESS,
      _sellerAmount: convertTokenAmountToInt(
        amtObj.seller_amount,
        payment_token.total_decimal,
      ),
      _feeAmount: convertTokenAmountToInt(
        amtObj.fee_amount,
        payment_token.total_decimal,
      ),
      _royaltyAmount: convertTokenAmountToInt(
        amtObj.royalty_amount,
        payment_token.total_decimal,
      ),
      _totalAmount: convertTokenAmountToInt(
        amtObj.total_amount,
        payment_token.total_decimal,
      ),
      /* _feeWithRoyalty: convertTokenAmountToInt(
        amtObj.fee_amount + amtObj.royalty_amount,
        payment_token.total_decimal,
      ), */
    };

    offerValue[offer_type == OFFER_TYPE_SELL ? '_seller' : '_buyer'] = user.wallet_address;
    const type = offer_type == OFFER_TYPE_SELL ? sellType : buyType;

    if (validateOrGet == 'get') {
      return {domainData, type, offerValue}
    }

    if (!offerDto.signature) this.throwError(__('Signature is empty.'));

    let signer: string;
    try {
      signer = ethers.utils.verifyTypedData(
        domainData,
        type,
        offerValue,
        offerDto.signature,
      );
    } catch(e) {
      console.error(e.stack);
      this.throwError(__('Invalid signature'));
      
    }
    
    if (signer != user.wallet_address) {
      console.log(`offer_req: ${JSON.stringify(offerDto)}`);
      console.log(`offer_gen: ${JSON.stringify(offerValue)}`);
      console.log(`signer address from sig: ${signer}`);
      console.log(`user address to compare signer: ${user.wallet_address}`);
      console.error('Invalid signature'); 
      this.throwError(__('Invalid signature'));
    }
    return true;
  }

  /* async validateSellOffer(offerId: number) {
    const sellOffer = await prisma_client.sellOffer.findFirst({
      where: {
        id: offerId,
        status: BUY_SELL_STATUS_ACTIVE,
      },
    });
    if (!sellOffer) {
      this.throwError(__('Invalid sell offer'));
    }
    if (sellOffer.type == SELL_OFFER_TYPE_DEFAULT && new Date() > new Date(sellOffer.end_date)) {
      await prisma_client.sellOffer.update({
        where: {
          id: sellOffer.id,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_EXPIRED,
        },
      });
      this.throwError(__('Sell offer already expired.'));
    }
    return sellOffer;
  } */

  async getActiveBuyOffer(item_id: number, user_id: number) {
    const activeBuyOffer = await prisma_client.buyOffer.findFirst({
      where: {
        item_id: item_id,
        user_id: user_id,
        status: BUY_SELL_STATUS_ACTIVE,
      },
      include: {
        payment_token: true,
        user: true,
      }
    });
    if (activeBuyOffer) {
      if (new Date(activeBuyOffer.end_date).getTime() > new Date().getTime()) {
        return activeBuyOffer;
      }

      await prisma_client.buyOffer.update({
        where: {
          id: activeBuyOffer.id,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_EXPIRED,
        },
      });
    }
    return null;
  }

  throwError(error: string) {
    throw new BadRequestException(errorResponse(error));
  }
}
