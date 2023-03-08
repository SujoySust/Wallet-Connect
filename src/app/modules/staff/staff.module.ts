import { Module } from '@nestjs/common';
import { PasswordService } from 'src/libs/auth/password.service';
import { StaffResolver } from './staff.resolver';
import { StaffService } from './staff.service';
import { StaffAuthModule } from './auth/staff-auth.module';

import { RoleModule } from './role/role.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [StaffAuthModule, RoleModule, BlockchainModule, TokenModule],
  providers: [StaffResolver, StaffService, PasswordService],
})
export class StaffModule {}
