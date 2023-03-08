import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from '../../../libs/decorators/user.decorator';
import { User } from '../../models/user.model';
import { UserService } from './user.service';
import { UpdateProfileInput } from './dto/user.dto';
import { GqlAuthGuard } from '../../../libs/auth/gql.auth.guard';
import { ResponseModel } from '../../models/dto/response.model';
import { UserUniqueFilter } from './dto/filter.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard())
  @Query(() => User)
  async me(@UserEntity() user: User): Promise<User> {
    return user;
  }

  @Query(() => ResponseModel)
  async checkUniqueUser(
    @Args('wallet_address') wallet_address: string,
    @Args({ nullable: true }) filter: UserUniqueFilter,
  ): Promise<ResponseModel> {
    return await this.userService.checkUniqueUser(wallet_address, filter);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async updateProfile(
    @Args('data') data: UpdateProfileInput,
    @UserEntity() user: User,
  ): Promise<ResponseModel> {
    return await this.userService.updateProfile(data, user);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async resendVerifcationEmail(
    @UserEntity() user: User,
  ): Promise<ResponseModel> {
    return await this.userService.resendVerificationEmail(user);
  }
}
