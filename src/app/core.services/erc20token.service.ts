/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */

import {
  AlchemyWeb3,
  createAlchemyWeb3,
} from '@alch/alchemy-web3';
import { Contract } from 'web3-eth-contract';
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
import { ERC20_ABI } from 'contract/erc20.abi';
const Moralis = require('moralis/node');
const Web3 = require('web3');

export class ERC20TokenService {
  private blockChain: BlockchainModel;
  private tokenContract: Contract;
  private web3: AlchemyWeb3;
  private tokenAddress: string;

  constructor(blockChain: BlockchainModel, tokenAddress: string) {
    this.blockChain = blockChain;
    this.tokenAddress = tokenAddress;
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
    this.tokenContract = new this.web3.eth.Contract(
      JSON.parse(ERC20_ABI),
      this.tokenAddress,
    );
  }

  async balanceOf(owner: string): Promise<string> {
    return await this.tokenContract.methods.balanceOf(owner).call();
  }

  async totalDecimal(): Promise<string> {
    return await this.tokenContract.methods.totalDecimal().call();
  }

  async allowance(owner: string, operator: string): Promise<string> {
    return await this.tokenContract.methods.allowance(owner, operator).call();
  }
}
