import { StaffLoginInput } from './dto/staff-login.input';
import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { Token } from '../../../../libs/auth/models/token.model';
import { StaffAuthService } from './staff.auth.service';
import { RefreshTokenInput } from '../../../../libs/auth/dto/refresh-token.input';
import { ResetPasswordInput } from '../../../../libs/auth/dto/reset-password.input';
import { ResponseModel } from 'src/app/models/dto/response.model';

@Resolver('StaffAuth')
export class StaffAuthResolver {
  constructor(private readonly auth: StaffAuthService) {}

  @Mutation(() => Token)
  async StaffLogin(@Args('data') data: StaffLoginInput) {
    return await this.auth.login(data);
  }

  @Mutation(() => Token)
  async refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.auth.refreshToken(token);
  }

  @Mutation(() => ResponseModel)
  async sendStaffForgetPasswordMail(@Args('email') email: string) {
    return await this.auth.sendStaffForgetPasswordNotification({
      email,
    });
  }

  @Mutation(() => ResponseModel)
  async changeStaffPassword(@Args('data') data: ResetPasswordInput) {
    return await this.auth.resetStaffPassword(data);
  }
}
