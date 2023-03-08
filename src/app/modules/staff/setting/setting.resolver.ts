import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { generalSettingsInput } from './dto/general-settings.input';
import { UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { Setting } from './setting.model';
import { mailSettingsInput } from './dto/mail-settings.input';
import { logoSettingsInput } from './dto/logo-settings.input';
import { HomepageSettingsInput } from './dto/homepage-settings.input';
import { socialSettingsInput } from './dto/social-settings.input';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { ApplicationSettingsInput } from './dto/application-settings.input';
import { PERMISSION_KEY_SETTINGS } from 'src/app/helpers/permission_constant';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';
import { UsefulLinkSettingsInput } from './dto/useful-link-settings.input';
import {
  SETTINGS_GROUP_APPLICATION,
  SETTINGS_GROUP_EMAIL,
  SETTINGS_GROUP_HOMEPAGE,
  SETTINGS_GROUP_GENERAL,
  SETTINGS_GROUP_LOGO,
  SETTINGS_GROUP_SOCIAL,
  SETTINGS_GROUP_FOOTER,
} from 'src/app/helpers/slugconstants';

@Resolver(() => Setting)
export class SettingResolver {
  constructor(private readonly settingService: SettingService) {}
  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_SETTINGS))
  @Mutation(() => ResponseModel)
  async generalSettingsSave(
    @Args('data') data: generalSettingsInput,
  ): Promise<ResponseModel> {
    return this.settingService.settingSave(data, SETTINGS_GROUP_GENERAL);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_SETTINGS))
  @Mutation(() => ResponseModel)
  async applicationSettingsSave(
    @Args('data') data: ApplicationSettingsInput,
  ): Promise<ResponseModel> {
    return this.settingService.settingSave(data, SETTINGS_GROUP_APPLICATION);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_SETTINGS))
  @Mutation(() => ResponseModel)
  async mailSettingsSave(
    @Args('data') data: mailSettingsInput,
  ): Promise<ResponseModel> {
    return this.settingService.settingSave(data, SETTINGS_GROUP_EMAIL);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_SETTINGS))
  @Mutation(() => ResponseModel)
  async logoSettingsSave(
    @Args('data') data: logoSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP_LOGO);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_SETTINGS))
  @Mutation(() => ResponseModel)
  async usefulLinkSettingsSave(
    @Args('data') data: UsefulLinkSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP_FOOTER);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_SETTINGS))
  @Mutation(() => ResponseModel)
  async homepageSettingsSave(
    @Args('data') data: HomepageSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(
      data,
      SETTINGS_GROUP_HOMEPAGE,
      'application/settings/homepage',
    );
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_SETTINGS))
  @Mutation(() => ResponseModel)
  async socialSettingsSave(
    @Args('data') data: socialSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP_SOCIAL);
  }

  @Query(() => [Setting])
  async getSettingsData(
    @Args({ name: 'optionGroup', type: () => [String], nullable: true })
    optionGroup,
  ): Promise<Setting[]> {
    return await this.settingService.getSettingsData(optionGroup);
  }
}
