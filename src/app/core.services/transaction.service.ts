/* eslint-disable @typescript-eslint/no-var-requires */
import Web3 from 'web3';
import { prisma_client } from '../helpers/functions';

export class TransactionService {
  async getLatestNonce(
    chain_id: number,
    address: string,
    web3: Web3,
  ): Promise<number> {
    const txCount = await web3.eth.getTransactionCount(address, 'latest');
    let txNonce = await prisma_client.txNonce.findFirst({
      where: {
        chain_id: chain_id,
        wallet_address: address,
      },
    });
    if (!txNonce) {
      txNonce = await prisma_client.txNonce.create({
        data: {
          chain_id: chain_id,
          wallet_address: address,
        },
      });
    }
    let nonce = Number(txNonce.nonce);
    if (nonce == 0 || nonce < txCount) {
      nonce = txCount;
    } else {
      nonce++;
    }
    await prisma_client.txNonce.update({
      where: {
        id: txNonce.id,
      },
      data: {
        nonce: nonce.toString(),
      },
    });
    return nonce;
  }
}
