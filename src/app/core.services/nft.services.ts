/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */

import {
  AlchemyWeb3,
  createAlchemyWeb3,
  GetNftsResponse,
} from '@alch/alchemy-web3';
import { TransactionReceipt } from 'web3-eth';
import { ERC721_ABI } from 'contract/erc721.abi';
import { Contract } from 'web3-eth-contract';
import {
  adminPrivateKey,
  clearTrailingSlash,
  executeTransaction,
  __,
} from '../helpers/functions';
import { BlockchainModel } from '../modules/staff/blockchain/blockchain.model';
import {
  BLOCKCHAIN_PROVIDER_ALCHEMY,
  BLOCKCHAIN_PROVIDER_OTHERS,
  BLOCKCHAIN_PROVIDER_MORALIS,
  BLOCKCHAIN_TRANSACTION_FEE_LIMIT,
} from '../helpers/coreconstants';
import { TransactionService } from './transaction.service';
const Moralis = require('moralis/node');
const Web3 = require('web3');

export class NftService {
  private blockChain: BlockchainModel;
  private nftContract: Contract;
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
    this.nftContract = new this.web3.eth.Contract(
      JSON.parse(ERC721_ABI),
      this.blockChain.nft_contract,
    );
  }

  async ownerOf(tokenId: string): Promise<string> {
    return await this.nftContract.methods.ownerOf(tokenId).call();
  }

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return await this.nftContract.methods.isApprovedForAll(owner, operator).call();
  }

  async mint(receiver: string, tokenURI: string): Promise<TransactionReceipt> {
    const call = this.nftContract.methods.mint(receiver, tokenURI);
    const adminAccount = this.web3.eth.accounts.privateKeyToAccount(adminPrivateKey())
    const gas = await call.estimateGas({
      from: adminAccount.address,
    });
    if (gas > BLOCKCHAIN_TRANSACTION_FEE_LIMIT)
      throw new Error(`Minting method will ran out of gas. gas needed=${gas}, 
      gas sent=${BLOCKCHAIN_TRANSACTION_FEE_LIMIT}`);

    const nonce = await (new TransactionService().getLatestNonce(this.blockChain.chain_id, adminAccount.address, this.web3));
    const tx = {
      nonce: nonce,
      to: this.blockChain.nft_contract,
      gas: BLOCKCHAIN_TRANSACTION_FEE_LIMIT,
      data: call.encodeABI(),
    };
    const txObj = await executeTransaction(tx, this.web3, adminAccount.privateKey);
    if (txObj.status) {
      txObj['tokenId'] = this.web3.utils.hexToNumberString(
        txObj.logs[0].topics[3],
      );
    }
    return txObj;
  }

  async getAllNfts(accountAddress: string) {
    if (this.blockChain.provider == BLOCKCHAIN_PROVIDER_ALCHEMY) {
      return this.getNftsFromAlchemy(accountAddress);
    } else if (this.blockChain.provider == BLOCKCHAIN_PROVIDER_MORALIS) {
      return this.getNftsFromMoralis(accountAddress);
    } else {
      throw new Error(__("The provider does't support NFT list fetching."));
    }
  }

  async getNftsFromAlchemy(accountAddress: string) {
    const nfts = await this.web3.alchemy.getNfts({
      owner: accountAddress,
      contractAddresses: [this.blockChain.nft_contract],
    });
    console.log(nfts);
    return nfts.totalCount;
  }

  async getNftsFromMoralis(accountAddress: string) {
    const options = {
      chain: this.web3.utils.fromDecimal(this.blockChain.chain_id), //0x4
      address: accountAddress,
      token_address: this.blockChain.nft_contract,
    };
    const nfts = await Moralis.Web3API.account.getNFTsForContract(options);
    console.log(nfts);
    return nfts.total;
  }

  async transferNft(
    from: string,
    fromAccountPrivateKey: string,
    to: string,
    tokenId: number,
  ): Promise<TransactionReceipt> {
    const call = this.nftContract.methods.safeTransferFrom(from, to, tokenId);
    const tx = {
      to: this.blockChain.nft_contract,
      gas: BLOCKCHAIN_TRANSACTION_FEE_LIMIT,
      data: call.encodeABI(),
    };
    const txObj = await executeTransaction(
      tx,
      this.web3,
      fromAccountPrivateKey,
    );
    return txObj;
  }
}
