import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from '../../../libs/decorators/user.decorator';
import { User } from '../../models/user.model';
import { UserService } from './user.service';
import { UpdateProfileInput } from './dto/user.dto';
import { GqlAuthGuard } from '../../../libs/auth/gql.auth.guard';
import { ResponseModel } from '../../models/dto/response.model';
import { UserFilter, UserUniqueFilter } from './dto/filter.dto';
import { NotificationEventModel } from 'src/app/models/notification-event.model';
import { NotificationEvents } from 'src/app/helpers/corearray';
import { UserNotificationSettingDto } from './dto/user-notification-setting.dto';
import { NotificationSettingModel } from 'src/app/models/notification-setting.model';
import { UserConnection } from 'src/app/models/pagination/user-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { CollectionWithItemFilter } from '../collection/dto/filter.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard())
  @Query(() => User)
  async me(@UserEntity() user: User): Promise<User> {
    return user;
  }

  @Query(() => UserConnection)
  async getAccountListsPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: UserFilter,
    @Args({ nullable: true }) withItemFilter: CollectionWithItemFilter,
  ): Promise<UserConnection> {
    return await this.userService.getAccountListsPaginate(
      paginate,
      filter,
      withItemFilter,
    );
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

  @UseGuards(GqlAuthGuard())
  @Query(() => [NotificationEventModel])
  async getNotificationSettingsEvent(): Promise<NotificationEventModel[]> {
    return NotificationEvents;
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async userNotificationSettingSave(
    @UserEntity() user: User,
    @Args('data') data: UserNotificationSettingDto,
  ): Promise<ResponseModel> {
    return await this.userService.userNotificationSettingSave(user, data);
  }

  @UseGuards(GqlAuthGuard())
  @Query(() => NotificationSettingModel, { nullable: true })
  async getNotificationSettings(
    @UserEntity() user: User,
  ): Promise<NotificationSettingModel> {
    return await this.userService.getNotificationSetting(user);
  }
}
