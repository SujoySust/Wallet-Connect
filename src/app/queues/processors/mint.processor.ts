import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { app } from '../../helpers/functions';
import { ItemService } from '../../modules/item/item.service';

@Processor('mint')
export class MintProcessor {
  @Process('mint-token')
  async mintItem(job: Job) {
    const { user, itemId, tokenUri } = job.data;
    const itemService = app.get(ItemService);
    itemService.mintItem(user, itemId, tokenUri);
  }
}
