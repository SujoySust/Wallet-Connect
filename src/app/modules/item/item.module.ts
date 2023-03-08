import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemResolver } from './item.resolver';
import { UserModule } from '../user/user.module';
import { ItemValidation } from './item.validation';
import { ItemData } from './item.data';

@Module({
  imports: [UserModule],
  providers: [ItemService, ItemResolver, ItemValidation, ItemData],
})
export class ItemModule {}
