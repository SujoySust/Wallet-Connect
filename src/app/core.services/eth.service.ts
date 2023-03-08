/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */

import {
  AlchemyWeb3,
  createAlchemyWeb3,
} from '@alch/alchemy-web3';
import { TransactionReceipt } from 'web3-eth';
import {
  clearTrailingSlash,
  __,
} from '../helpers/functions';
import { BlockchainModel } from '../modules/staff/blockchain/blockchain.model';
import {
  BLOCKCHAIN_PROVIDER_ALCHEMY,
  BLOCKCHAIN_PROVIDER_OTHERS,
  BLOCKCHAIN_PROVIDER_MORALIS,
} from '../helpers/coreconstants';
const Moralis = require('moralis/node');
const Web3 = require('web3');

export class ETHService {
  private blockChain: BlockchainModel;
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
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance);
  }

  async getTransaction(hash: string): Promise<TransactionReceipt> {
    const tx = await this.web3.eth.getTransactionReceipt(hash);
    return tx;
  }

}
