import { Process, Processor } from '@nestjs/bull';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const Solc = require('solc');

// @Processor('web3')
export class Web3Processor {
  private web3Handler;

  // @Process('transfer-token')
  // async transferToken(job: Job) {
  //   const { bidId } = job.data;
  //   const appConfig: AppConfig = this.configService.get<AppConfig>('app');
  //   const bid = await this.prisma.bid.findUnique({
  //     where: {
  //       id: bidId,
  //     },
  //     include: {
  //       item: {
  //         include: {
  //           collection: true,
  //           currentOwner: true,
  //           creator: true,
  //         },
  //       },
  //       sender: true,
  //     },
  //   });
  //   const histories = [];
  //
  //   // Transfer Bid Amount And Token
  //   const ownerTransferReceipt = await this.userService.transferBalance(
  //     bid.sender,
  //     bid.item.currentOwner,
  //     bid.amount,
  //   );
  //
  //   // Transfer Actual Token
  //   const abiString = fs
  //     .readFileSync(
  //       resolve(`contracts/compiled/${bid.item.collection.contractSymbol}.abi`),
  //     )
  //     .toString();
  //   const abi = JSON.parse(abiString);
  //   const nftContract = new this.web3Handler.eth.Contract(
  //     abi,
  //     bid.item.collection.contractAddress,
  //   );
  //   const nonce = await this.web3Handler.eth.getTransactionCount(
  //     bid.item.currentOwner.walletAddress,
  //     'latest',
  //   ); //get latest nonce
  //   const call = nftContract.methods.transferFrom(
  //     bid.item.currentOwner.walletAddress,
  //     bid.sender.walletAddress,
  //     bid.item.tokenId,
  //   );
  //   const signedTx = await this.web3Handler.eth.accounts.signTransaction(
  //     {
  //       from: bid.item.currentOwner.walletAddress,
  //       to: bid.item.collection.contractAddress,
  //       nonce: nonce,
  //       gas: 2000000,
  //       data: call.encodeABI(),
  //     },
  //     bid.item.currentOwner.walletPrivateKey,
  //   );
  //   const tokenTransferReceipt =
  //     await this.web3Handler.eth.sendSignedTransaction(signedTx.rawTransaction);
  //   histories.push({
  //     itemId: bid.itemId,
  //     fromId: bid.item.currentOwnerId,
  //     toId: bid.senderId,
  //     hash: tokenTransferReceipt.transactionHash,
  //     amount: bid.amount.toString(),
  //     type: 'TRANSFER',
  //     isValid: true,
  //   });
  //
  //   if (bid.item.currentOwnerId != bid.item.creatorId) {
  //     // Creator Royalties
  //     const royaltyAmount = bid.amount * (bid.item.collection.royalties / 100);
  //     const royaltyReceipt = await this.userService.transferBalance(
  //       bid.item.currentOwner,
  //       bid.item.creator,
  //       royaltyAmount,
  //     );
  //     histories.push({
  //       itemId: bid.itemId,
  //       fromId: bid.item.currentOwnerId,
  //       toId: bid.item.creatorId,
  //       hash: royaltyReceipt.transactionHash,
  //       amount: royaltyAmount.toString(),
  //       type: 'COMISSION',
  //       isValid: true,
  //     });
  //   }
  //
  //   // Transfer Admin Commission
  //   const adminCommission = bid.amount * (appConfig.adminCommission / 100);
  //   const adminCommissionTransferReceipt =
  //     await this.userService.transferBalance(
  //       bid.item.currentOwner,
  //       appConfig.adminWalletAddress,
  //       adminCommission,
  //     );
  //   histories.push({
  //     itemId: bid.itemId,
  //     fromId: bid.item.currentOwnerId,
  //     hash: adminCommissionTransferReceipt.transactionHash,
  //     amount: adminCommission.toString(),
  //     type: 'ADMIN_COMISSION',
  //     isValid: true,
  //   });
  //
  //   this.prisma.$transaction([
  //     this.prisma.bid.update({
  //       where: {
  //         id: bidId,
  //       },
  //       data: {
  //         status: 'TRANSFERED',
  //       },
  //     }),
  //     this.prisma.bid.updateMany({
  //       where: {
  //         id: {
  //           not: bidId,
  //         },
  //         itemId: bid.itemId,
  //         status: 'PENDING',
  //       },
  //       data: {
  //         status: 'CANCELED',
  //       },
  //     }),
  //     this.prisma.item.update({
  //       where: {
  //         id: bid.itemId,
  //       },
  //       data: {
  //         currentOwnerId: bid.senderId,
  //         price: bid.amount,
  //       },
  //     }),
  //     this.prisma.price.create({
  //       data: {
  //         itemId: bid.itemId,
  //         amount: bid.amount,
  //       },
  //     }),
  //     this.prisma.history.createMany({
  //       data: histories,
  //     }),
  //   ]);
  // }
  //

  // @Process('mint-token')
  // async mintItem(job: Job) {
  //   const { user, itemId, tokenUri } = job.data;
  //   const itemService = app.get(ItemService);
  //   itemService.mintItem(user, itemId, tokenUri);
  // }

  // async itemActivitySave(
  //   item_id: number,
  //   event: number,
  //   from_id: number | null = null,
  //   to_id: number | null = null,
  //   hash: string | null = null,
  //   amount: string | null = null,
  //   status = 1,
  // ) {
  //   const activity = await prisma_client.itemActivity.findFirst({
  //     where: {
  //       item_id: item_id,
  //       event: ITEM_EVENT_MINT,
  //     },
  //   });
  //   if (activity) {
  //     return await prisma_client.itemActivity.update({
  //       where: {
  //         id: activity.id,
  //       },
  //       data: {
  //         item_id,
  //         event,
  //         from_id,
  //         to_id,
  //         hash,
  //         amount,
  //         status,
  //       },
  //     });
  //   } else {
  //     return await prisma_client.itemActivity.create({
  //       data: {
  //         item_id,
  //         event,
  //         from_id,
  //         to_id,
  //         hash,
  //         amount,
  //         status,
  //       },
  //     });
  //   }
  // }
}
