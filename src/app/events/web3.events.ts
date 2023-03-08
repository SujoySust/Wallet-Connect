/* eslint-disable @typescript-eslint/no-var-requires */
import { EXCHANGE_CONTRACT_ABI } from 'contract/exchange_v3.abi';
import {
  LOG_LEVEL_ERROR,
  MyLogger,
  newConsole,
} from 'src/libs/log/logger.service';
import Web3 from 'web3';
import { app, prisma_client } from '../helpers/functions';
import { BlockchainModel } from '../modules/staff/blockchain/blockchain.model';
import { EventLog } from 'web3-core';
import { TransactionReceipt } from 'web3-eth';
import { ERC721_ABI } from 'contract/erc721.abi';
import { TransferEventQueue } from '../queues/transfer-event.queue';
import { ExchangeEventQueue } from '../queues/exchange-event.queue';
import { STATUS_ACTIVE } from '../helpers/coreconstants';
const web3p = require('web3');
const retrySeconds = 5 * 1000;

export async function web3Events() {
  const blockchains = await prisma_client.blockchain.findMany({
    where: {
      status: STATUS_ACTIVE,
    },
  });
  for (let i = 0; i < blockchains.length; i++) {
    processEventExchange(blockchains[i]);
    processTransferEvent(blockchains[i]);
  }
}

async function processEventExchange(blockchain: BlockchainModel) {
  if (blockchain.exchange_contract) {
    const excSub = await EventExchange(blockchain);
    /* setInterval(async () => {
      excSub.unsubscribe();
      EventExchange(blockchain);
    }, toMilliS(30)); */
  }
}

async function processTransferEvent(blockchain: BlockchainModel) {
  if (blockchain.nft_contract) {
    const trnsSub = await TransferEvent(blockchain);
    /* setInterval(async () => {
      trnsSub.unsubscribe();
      TransferEvent(blockchain);
    }, toMilliS(30)); */
  }
}

async function EventExchange(
  blockchain: BlockchainModel,
  subscriptionLog = true,
) {
  const logger = new MyLogger(`${blockchain.slug}-xchange-event.log`);
  try {
    const web3: Web3 = new web3p(blockchain.wss_url);
    const exchContract = new web3.eth.Contract(
      JSON.parse(EXCHANGE_CONTRACT_ABI),
      blockchain.exchange_contract,
    );
    const excSub = exchContract.events
      .Exchange()
      .on('connected', function (subscriptionId: any) {
        if (subscriptionLog) {
          const msg = `Event Exchange subscription id(${blockchain.network_name}): ${subscriptionId}`;
          if (process.env.APP_DEBUG != 'true') newConsole.log(msg);
          logger.write(msg);
        }
      })
      .on('data', async function (event: EventLog) {
        try {
          const excQue = app.get(ExchangeEventQueue);
          excQue.processEvent(event, blockchain);
        } catch (e) {
          logger.write(e.satck);
        }
      })
      .on('changed', function (event: EventLog) {
        logger.write(`---------------------`);
        const msg = `Event Exchange (${blockchain.network_name}): `;
        logger.write(`${msg} on changed`);
        logger.write(`event: ${JSON.stringify(event)}`);
        // const exchangeId = event.returnValues['exchangeId'];
        // logger.write(`exchangeId: ${exchangeId}`);
        logger.write(`---------------------`);
      })
      .on('error', function (error: any, receipt: TransactionReceipt) {
        // logger.write(`---------------------`);
        // const msg = `Event Exchange (${blockchain.network_name}): `;
        // logger.write(`${msg} on error: ${error.message}`);
        // newConsole.log('error:', error.message);
        // // newConsole.log('error:', error.code);
        // newConsole.log('receipt:', receipt);
        // logger.write(`---------------------`);

        setTimeout(() => {
          excSub.unsubscribe();
          EventExchange(blockchain, false);
        }, retrySeconds);
      });
    /* .on('end', function (error: any) {
        logger.write(`---------------------`);
        const msg = `Event Exchange (${blockchain.network_name}): `;
        logger.write(`${msg} on end`);
        newConsole.log('error:', error);
        logger.write(`---------------------`);

        excEvent.unsubscribe();
        EventExchange(blockchain);
      }); */
    return excSub;
  } catch (e) {
    setTimeout(() => {
      EventExchange(blockchain);
    }, retrySeconds);
    logger.write(blockchain.network_name);
    logger.write(e.stack, LOG_LEVEL_ERROR);
  }
}

async function TransferEvent(
  blockchain: BlockchainModel,
  subscriptionLog = true,
) {
  const logger = new MyLogger(`${blockchain.slug}-transfer-event.log`);
  try {
    const web3: Web3 = new web3p(blockchain.wss_url);
    const nftContract = new web3.eth.Contract(
      JSON.parse(ERC721_ABI),
      blockchain.nft_contract,
    );
    const trnsSub = nftContract.events
      .Transfer()
      .on('connected', function (subscriptionId: any) {
        if (subscriptionLog) {
          const msg = `Event Transfer subscription id(${blockchain.network_name}): ${subscriptionId}`;
          if (process.env.APP_DEBUG != 'true') newConsole.log(msg);
          logger.write(msg);
        }
      })
      .on('data', async function (event: EventLog) {
        try {
          const trnsQue = app.get(TransferEventQueue);
          trnsQue.processEvent(event, blockchain);
        } catch (e) {
          logger.write(e.satck);
        }
      })
      .on('changed', function (event: EventLog) {
        logger.write(`---------------------`);
        const msg = `Event Transfer (${blockchain.network_name}): `;
        logger.write(`${msg} on changed`);
        logger.write(`event: ${JSON.stringify(event)}`);

        logger.write(`---------------------`);
      })
      .on('error', function (error: any, receipt: TransactionReceipt) {
        // logger.write(`---------------------`);
        // const msg = `Event Transfer (${blockchain.network_name}): `;
        // logger.write(`${msg} on error: ${error.message}`);
        // newConsole.log('error:', error.message);
        // newConsole.log('receipt:', receipt);
        // logger.write(`---------------------`);

        setTimeout(() => {
          trnsSub.unsubscribe();
          TransferEvent(blockchain, false);
        }, retrySeconds);
      });
    /* .on('end', function (error: any) {
        logger.write(`---------------------`);
        const msg = `Event Transfer (${blockchain.network_name}): `;
        logger.write(`${msg} on end`);
        newConsole.log('error:', error);
        logger.write(`---------------------`);

        trnsSub.unsubscribe();
        TransferEvent(blockchain);
      }); */
    return trnsSub;
  } catch (e) {
    setTimeout(() => {
      TransferEvent(blockchain);
    }, retrySeconds);
    logger.write(blockchain.network_name);
    logger.write(e.stack, LOG_LEVEL_ERROR);
  }
}
