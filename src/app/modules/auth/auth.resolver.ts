import { WalletLoginInput, WalletLoginMessage } from './dto/login.input';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { RefreshTokenInput } from '../../../libs/auth/dto/refresh-token.input';
import { Token } from '../../../libs/auth/models/token.model';
import { ResponseMessageWithStatusModel } from '../../models/dto/response-message-with-status.model';
import { ResetPasswordInput } from '../../../libs/auth/dto/reset-password.input';
import { UserAuthService } from './user.auth.service';
import { responseMessageWithStatus } from '../../models/dto/response-message-with-status';
import { User } from '../../models/user.model';
import { UserEntity } from 'src/libs/decorators/user.decorator';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { GqlGetUserGuard } from 'src/libs/auth/gql.get-user.guard';
import { errorResponse, __ } from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: UserAuthService) {}

  @UseGuards(GqlGetUserGuard())
  @Query(() => User)
  async getUserByToken(@UserEntity() user: User): Promise<User> {
    if (!user) throw new NotFoundException(errorResponse(__('No user found.')));
    return user;
  }

  @Mutation(() => ResponseModel)
  async userVerifyMail(
    @Args('verificationCode') verificationCode: string,
  ): Promise<ResponseModel> {
    return await this.auth.userVerifyMail(verificationCode);
  }

  @Query(() => User)
  async getAccountByAddress(@Args('wallet_address') address: string) {
    return await this.auth.getOrGenerateAccount(address);
  }

  @Query(() => User)
  async getAccount(@Args('address_or_username') address_or_username: string) {
    return await this.auth.getAccount(address_or_username);
  }

  @Mutation(() => WalletLoginMessage)
  async generateLoginMessage(@Args('wallet_address') address: string) {
    return await this.auth.generateLoginMessage(address);
  }

  @Mutation(() => Token)
  async walletLogin(@Args('data') data: WalletLoginInput) {
    return await this.auth.walletLogin(data);
  }

  @Mutation(() => Token)
  async refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.auth.refreshToken(token);
  }

  @Mutation(() => ResponseMessageWithStatusModel)
  async sendForgetPasswordMail(@Args('email') email: string) {
    try {
      const response = await this.auth.sendForgetPasswordNotification({
        email,
      });
      return response
        ? responseMessageWithStatus(
            true,
            'Forget password mail sent successfully!',
          )
        : responseMessageWithStatus(false, 'Forget password mail send failed!');
    } catch (e) {
      console.error(e.stack);
      return responseMessageWithStatus(false, e.message);
    }
  }

  @Mutation(() => ResponseMessageWithStatusModel)
  async changePassword(@Args('data') data: ResetPasswordInput) {
    try {
      const response = await this.auth.resetPassword(data);
      return response
        ? responseMessageWithStatus(true, 'Password changed successfully!')
        : responseMessageWithStatus(false, 'Password change failed!');
    } catch (e) {
      console.error(e.stack);
      return responseMessageWithStatus(false, e.message);
    }
  }
}
