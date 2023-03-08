/* eslint-disable @typescript-eslint/no-var-requires */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ETHService } from 'src/app/core.services/eth.service';
import {
  BUY_SELL_STATUS_ACTIVE,
  BUY_SELL_STATUS_CANCELLED,
  EXCHANGE_STATUS_DONE,
  EXCHANGE_STATUS_FAILED,
  EXCHANGE_STATUS_IN_PROGRESS,
  ITEM_EVENT_LISTING_CANCEL,
  ITEM_EVENT_TRANSFERS,
  NULL_ETH_ADDRESS,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import {
  app,
  checkAndGetAddress,
  errorResponse,
  getUUID,
  prisma_client,
  processException,
  randomUsernameFromWalletAddress,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { Item } from 'src/app/models/item.model';
import { User } from 'src/app/models/user.model';
import { TransactionReceipt } from 'web3-eth';
import Web3 from 'web3';
import { ItemService } from '../item/item.service';
import { Transfer } from './transfer.model';
import e from 'express';
import { MyLogger } from 'src/libs/log/logger.service';
import { EventLog } from 'web3-core';
import { BlockchainModel } from '../staff/blockchain/blockchain.model';
const web3 = require('web3');

@Injectable()
export class TransferService {
  private web3: Web3;
  constructor() {
    this.web3 = new web3();
  }

  async getTransferList(
    from_user_id: number,
    to_user_id: number,
  ): Promise<Transfer[]> {
    return await prisma_client.transfer.findMany({
      where: {
        user_id: from_user_id ?? undefined,
        to_user_id: to_user_id ?? undefined,
        status: EXCHANGE_STATUS_DONE,
      },
      include: {
        item: true,
        user: true,
        to_user: true,
      },
    });
  }

  async createTransfer(
    user: User,
    to: string,
    item_id: number,
  ): Promise<Transfer> {
    try {
      const item = await prisma_client.item.findFirst({
        where: {
          id: item_id,
          is_minted: STATUS_ACTIVE,
          status: STATUS_ACTIVE,
          collection: {
            blockchain: {
              status: STATUS_ACTIVE,
            },
          },
        },
      });
      await this.validateCreateTransfer(item, user, to);
      const transfer = await prisma_client.transfer.create({
        data: {
          uid: getUUID(),
          item: {
            connect: {
              id: item_id,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          to_address: to,
          to_user: {
            connectOrCreate: {
              where: {
                wallet_address: to,
              },
              create: {
                wallet_address: to,
                username: randomUsernameFromWalletAddress(to),
              },
            },
          },
          status: EXCHANGE_STATUS_IN_PROGRESS,
        },
      });
      if (!transfer) throw new Error(errorResponse().message);
      return transfer;
    } catch (e) {
      processException(e);
    }
  }

  async cancelTransfer(
    user: User,
    transfer_id: number,
  ): Promise<ResponseModel> {
    try {
      const transfer = await prisma_client.transfer.findFirst({
        where: {
          id: transfer_id,
          user_id: user.id,
          status: EXCHANGE_STATUS_IN_PROGRESS,
        },
      });
      if (!transfer)
        throw new BadRequestException(errorResponse(__('Invalid transfer id')));

      await prisma_client.transfer.update({
        where: {
          id: transfer.id,
        },
        data: {
          status: EXCHANGE_STATUS_FAILED,
        },
      });

      return successResponse('');
    } catch (e) {
      processException(e);
    }
  }

  async finishTransfer(
    transfer_id: number,
    transaction_hash: string,
  ): Promise<ResponseModel> {
    try {
      const transfer = await prisma_client.transfer.findFirst({
        where: {
          id: transfer_id,
        },
        include: {
          item: {
            include: {
              collection: {
                include: {
                  blockchain: true,
                },
              },
            },
          },
          user: true,
        },
      });
      if (!transfer)
        throw new BadRequestException(errorResponse(__('Invalid transfer id')));

      if (transfer.status == EXCHANGE_STATUS_DONE) return successResponse('');

      const tx = await this.validateTransferTx(transfer, transaction_hash);

      await this.transferFinishDataProcessing(transfer, tx);

      return successResponse('');
    } catch (e) {
      processException(e);
    }
  }

  async transferFinishDataProcessing(
    transfer: Transfer,
    tx: TransactionReceipt | { transactionHash: string; status: boolean },
  ) {
    await prisma_client.item.update({
      where: {
        id: transfer.item_id,
      },
      data: {
        owner_id: transfer.to_user_id,
      },
    });

    await prisma_client.transfer.update({
      where: {
        id: transfer.id,
      },
      data: {
        transaction_hash: tx.transactionHash,
        status: tx.status ? EXCHANGE_STATUS_DONE : EXCHANGE_STATUS_FAILED,
      },
    });

    if (tx.status) {
      const itemService = app.get(ItemService);
      await itemService.itemActivitySave(
        transfer.item_id,
        ITEM_EVENT_TRANSFERS,
        transfer.user_id,
        transfer.to_user_id,
        tx.transactionHash,
      );
      await this.cancelActiveSells(transfer.item_id);
      await this.cancelActiveBuyOffers(transfer.item_id, transfer.to_user_id);
    }
  }

  async cancelActiveSells(item_id: number) {
    await prisma_client.sellOffer.updateMany({
      where: {
        item_id: item_id,
        status: BUY_SELL_STATUS_ACTIVE,
      },
      data: {
        signature: null,
        status: BUY_SELL_STATUS_CANCELLED,
      },
    });
  }

  async cancelActiveBuyOffers(item_id: number, user_id: number) {
    await prisma_client.buyOffer.updateMany({
      where: {
        item_id: item_id,
        user_id: user_id,
        status: BUY_SELL_STATUS_ACTIVE,
      },
      data: {
        signature: null,
        status: BUY_SELL_STATUS_CANCELLED,
      },
    });
  }

  async validateCreateTransfer(item: Item, user: User, to: string) {
    if (!item)
      throw new BadRequestException(errorResponse(__('Invalid item.')));

    const transfer = await prisma_client.transfer.findFirst({
      where: {
        item_id: item.id,
        status: EXCHANGE_STATUS_IN_PROGRESS,
      },
    });
    if (transfer)
      throw new BadRequestException(
        errorResponse(__('Already a transfer process in progress.')),
      );

    const sell = await prisma_client.sellOffer.findFirst({
      where: {
        status: BUY_SELL_STATUS_ACTIVE,
        end_date: {
          gte: new Date(),
        },
        item_id: item.id,
      },
    });
    if (sell)
      throw new BadRequestException(
        errorResponse(__("A sell offer is going on. Can't transfer it now.")),
      );

    const exchange = await prisma_client.exchange.findFirst({
      where: {
        status: EXCHANGE_STATUS_IN_PROGRESS,
        item_id: item.id,
      },
    });
    if (exchange)
      throw new BadRequestException(
        errorResponse(
          __("This item is in a buy sell process. Can't transfer it now."),
        ),
      );

    to = checkAndGetAddress(this.web3, to);
    if (!to)
      throw new BadRequestException(errorResponse(__('Invalid to address.')));

    if (item.owner_id != user.id) {
      const itemService = app.get(ItemService);
      const syncedOwner = await itemService.syncItemOwner(item.id);
      if (syncedOwner?.id != user.id)
        throw new BadRequestException(
          errorResponse(__('You are not the owner of this item.')),
        );
    }
  }

  async validateTransferTx(transfer: Transfer, txHash: string) {
    const blockchain = transfer.item.collection.blockchain;
    const ethService = new ETHService(blockchain);
    await ethService.init();
    let tx: TransactionReceipt;
    try {
      tx = await ethService.getTransaction(txHash);
      if (
        tx.to.toLowerCase() == blockchain.nft_contract.toLowerCase() &&
        tx.from.toLowerCase() == transfer.user.wallet_address.toLowerCase() &&
        this.checkTransferTxLog(tx, transfer.to_address)
      )
        return tx;
      else throw new Error();
    } catch (e) {
      console.error(e.stack);
      console.error(
        `Invalid txHash: ${txHash}, chain: ${blockchain.slug}, transfer_uid: ${transfer.uid}`,
      );
      throw new BadRequestException(
        errorResponse(__('Invalid transaction hash:') + ` ${txHash}`),
      );
    }
  }

  checkTransferTxLog(tx: TransactionReceipt, to_address: string): boolean {
    for (let i = 0; i < tx.logs.length; i++) {
      if (
        this.web3.eth.abi
          .decodeParameter('address', tx.logs[i].topics[2])
          .toLowerCase() == to_address.toLowerCase()
      )
        return true;
    }
    return false;
  }

  async processTransferForEvent(event: EventLog, blockchain: BlockchainModel) {
    const logger = new MyLogger(`${blockchain.slug}-transfer-event.log`);
    try {
      logger.write(`---------------------`);
      logger.write(`on data`);
      logger.write(`txHash: ${event.transactionHash}`);

      const tokenId = event.returnValues['tokenId'];
      const from = event.returnValues['from'];
      const to = event.returnValues['to'];

      if (from == NULL_ETH_ADDRESS) {
        logger.write('Mint event. Skipped!!');
        logger.write(`---------------------`);
        return;
      }

      const item = await prisma_client.item.findFirst({
        where: {
          token_id: tokenId,
          collection: {
            blockchain_id: blockchain.id,
          },
        },
        include: {
          owner: true,
          collection: {
            include: {
              blockchain: true,
            },
          },
        },
      });
      if (!item) {
        logger.write(
          `tokenId: ${tokenId}, blockchain_id: ${blockchain.id}, contract: ${blockchain.nft_contract}`,
        );
        logger.write('Item not found');
        logger.write(`---------------------`);
        return;
      }

      const transfer = await prisma_client.transfer.findFirst({
        where: {
          status: EXCHANGE_STATUS_IN_PROGRESS,
          item_id: item.id,
          user: {
            wallet_address: from,
          },
          to_address: to,
        },
        orderBy: {
          id: 'desc',
        },
      });

      if (transfer) {
        logger.write('Transfer finishing process started...');
        const tx = {
          transactionHash: event.transactionHash,
          status: true,
        };
        this.transferFinishDataProcessing(transfer, tx);
        logger.write('Transfer finishing process end.');
        logger.write(`---------------------`);
      } else {
        if (item.owner.wallet_address.toLowerCase() == to.toLowerCase()) {
          logger.write(`---------------------`);
          return;
        } else {
          const exchange = await prisma_client.exchange.findFirst({
            where: {
              item_id: item.id,
              status: EXCHANGE_STATUS_IN_PROGRESS,
            },
          });
          if (exchange) {
            logger.write(`---------------------`);
            return;
          }
          const itemService = app.get(ItemService);
          const owner = await itemService.syncItemOwner(item.id, item);
          await this.cancelActiveSells(item.id);
          if (owner) await this.cancelActiveBuyOffers(item.id, owner.id);
          await prisma_client.itemActivity.create({
            data: {
              item: {
                connect: {
                  id: item.id,
                },
              },
              event: ITEM_EVENT_TRANSFERS,
              hash: event.transactionHash,
              to: {
                connect: {
                  id: owner?.id,
                },
              },
              from: {
                connectOrCreate: {
                  where: {
                    wallet_address: from,
                  },
                  create: {
                    wallet_address: from,
                    username: randomUsernameFromWalletAddress(from),
                  },
                },
              },
            },
          });

          logger.write(`---------------------`);
        }
      }
    } catch (e) {
      logger.write(e.satck);
      logger.write(`---------------------`);
    }
  }
}
