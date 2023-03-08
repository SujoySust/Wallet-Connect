import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MintQueue {
  constructor(@InjectQueue('mint') private readonly mintQueue: Queue) {}

  mintToken(user, itemId, tokenUri) {
    this.mintQueue.add('mint-token', {
      user,
      itemId,
      tokenUri,
    });
  }
}
