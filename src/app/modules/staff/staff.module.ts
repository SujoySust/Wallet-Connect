import { Module } from '@nestjs/common';
import { PasswordService } from 'src/libs/auth/password.service';
import { StaffResolver } from './staff.resolver';
import { StaffService } from './staff.service';
import { StaffAuthModule } from './auth/staff-auth.module';
import { CategoryModule } from './category/category.module';
import { RoleModule } from './role/role.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TokenModule } from './token/token.module';
import { StaffCollectionModule } from './collection/staff-collection.module';
import { StaffItemModule } from './item/staff-item.module';
import { StaffUserModule } from './user/staff-user.module';
import { ReportModule } from './report/report.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    DashboardModule,
    StaffAuthModule,
    CategoryModule,
    RoleModule,
    BlockchainModule,
    TokenModule,
    StaffUserModule,
    StaffCollectionModule,
    StaffItemModule,
    ReportModule,
  ],
  providers: [StaffResolver, StaffService, PasswordService],
})
export class StaffModule {}
