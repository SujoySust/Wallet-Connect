import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CollectionModule } from './modules/collection/collection.module';
import { BuyOfferModule } from './modules/offer/buy/buy-offer.module';
import { ItemModule } from './modules/item/item.module';
import { SellOfferModule } from './modules/offer/sell/sell-offer.module';
import { SettingModule } from './modules/staff/setting/setting.module';
import { StaffModule } from './modules/staff/staff.module';
import { UserModule } from './modules/user/user.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { HomeModule } from './modules/home/home.module';
import { APP_GUARD } from '@nestjs/core';
import { GqlThrottlerGuard } from 'src/libs/guards/gqlThrottle.guard';

@Module({
  imports: [
    AuthModule,
    HomeModule,
    CollectionModule,
    ItemModule,
    SellOfferModule,
    BuyOfferModule,
    ExchangeModule,
    TransferModule,
    UserModule,
    SettingModule,
    StaffModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
