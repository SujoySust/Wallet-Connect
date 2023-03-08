/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */

import {
  AlchemyWeb3,
  createAlchemyWeb3,
} from '@alch/alchemy-web3';
import { TransactionReceipt } from 'web3-eth';
import { Contract } from 'web3-eth-contract';
import {
  adminPrivateKey,
  clearTrailingSlash,
  convertTokenAmountToInt,
  executeTransaction,
  __,
} from '../helpers/functions';
import { BlockchainModel } from '../modules/staff/blockchain/blockchain.model';
import {
  BLOCKCHAIN_PROVIDER_ALCHEMY,
  BLOCKCHAIN_PROVIDER_OTHERS,
  BLOCKCHAIN_PROVIDER_MORALIS,
  BLOCKCHAIN_TRANSACTION_FEE_LIMIT,
  NULL_ETH_ADDRESS,
} from '../helpers/coreconstants';
import { EXCHANGE_CONTRACT_ABI } from 'contract/exchange_v3.abi';
import { Exchange } from '../modules/exchange/exchange.model';
import { TransactionService } from './transaction.service';
const Moralis = require('moralis/node');
const Web3 = require('web3');

export class ExchangeNftService {
  private blockChain: BlockchainModel;
  private exchangeContract: Contract;
  private web3: AlchemyWeb3;

  constructor(blockChain: BlockchainModel) {
    this.blockChain = blockChain;
  }

  async init() {
    if (
      (this.blockChain.provider == BLOCKCHAIN_PROVIDER_ALCHEMY ||
        this.blockChain.provider == BLOCKCHAIN_PROVIDER_OTHERS) &&
      this.blockChain.rpc_url
    ) {
      this.web3 = createAlchemyWeb3(
        `${clearTrailingSlash(this.blockChain.rpc_url)}`,
      );
    } else if (this.blockChain.provider == BLOCKCHAIN_PROVIDER_MORALIS) {
      await Moralis.start({ moralisSecret: this.blockChain.api_key });
      await Moralis.enableWeb3({ chainId: this.blockChain.chain_id });
      this.web3 = new Web3(Moralis.provider);
    } else {
      throw new Error(__('Invalid blockchain provider.'));
    }
    this.exchangeContract = new this.web3.eth.Contract(
      JSON.parse(EXCHANGE_CONTRACT_ABI),
      this.blockChain.exchange_contract,
    );
  }

  async exchangeNFTauction(exchange: Exchange): Promise<TransactionReceipt> {
    const token = exchange.payment_token;
    const buyOffer = exchange.buy_offer;
    const sellOffer = exchange.sell_offer;
    const tokenDecimal = token.total_decimal;
    const minBidToExecute = convertTokenAmountToInt(sellOffer.reserved_price, tokenDecimal);

    const buy = [buyOffer.nonce, parseInt((Number(new Date(buyOffer.start_date)) / 1000).toString()),
    parseInt((Number(new Date(buyOffer.end_date)) / 1000).toString()), this.blockChain.nft_contract,
    exchange.item.token_id, exchange.payment_token.contract_address,
    buyOffer.user.wallet_address, buyOffer.royalty_address || NULL_ETH_ADDRESS,
    convertTokenAmountToInt(buyOffer.seller_amount, tokenDecimal), 
    convertTokenAmountToInt(buyOffer.fee_amount, tokenDecimal),
    convertTokenAmountToInt(buyOffer.royalty_amount, tokenDecimal),
    // convertTokenAmountToInt(Number(buyOffer.fee_amount) + Number(buyOffer.royalty_amount), tokenDecimal),
    convertTokenAmountToInt(buyOffer.total_amount, tokenDecimal)];

    const sell = [sellOffer.nonce, parseInt((Number(new Date(sellOffer.start_date)) / 1000).toString()),
    parseInt((Number(new Date(sellOffer.end_date)) / 1000).toString()), this.blockChain.nft_contract,
    exchange.item.token_id, exchange.payment_token.contract_address, sellOffer.user.wallet_address,
    sellOffer.royalty_address || NULL_ETH_ADDRESS,
    convertTokenAmountToInt(sellOffer.seller_amount, tokenDecimal), 
    convertTokenAmountToInt(sellOffer.fee_amount, tokenDecimal),
    convertTokenAmountToInt(sellOffer.royalty_amount, tokenDecimal),
    // convertTokenAmountToInt(Number(sellOffer.fee_amount) + Number(sellOffer.royalty_amount), tokenDecimal),
    convertTokenAmountToInt(sellOffer.total_amount, tokenDecimal)];

    const call = this.exchangeContract.methods.exchangeNFTauction(sell, buy, exchange.uid,
      minBidToExecute, sellOffer.signature, buyOffer.signature);

    const adminAccount = this.web3.eth.accounts.privateKeyToAccount(adminPrivateKey());
    const gas = await call.estimateGas({
      from: adminAccount.address,
      // gas: BLOCKCHAIN_TRANSACTION_FEE_LIMIT,
    });
    if (gas > BLOCKCHAIN_TRANSACTION_FEE_LIMIT)
      throw new Error(`exchangeNFTauction method will ran out of gas. gas needed=${gas}, 
      gas sent=${BLOCKCHAIN_TRANSACTION_FEE_LIMIT}`);

    const nonce = await (new TransactionService().getLatestNonce(this.blockChain.chain_id ,adminAccount.address, this.web3));
    const tx = {
      nonce: nonce,
      to: this.blockChain.exchange_contract,
      gas: BLOCKCHAIN_TRANSACTION_FEE_LIMIT,
      data: call.encodeABI(),
    };
    const txObj = await executeTransaction(tx, this.web3, adminAccount.privateKey);
    return txObj;
  }
}
