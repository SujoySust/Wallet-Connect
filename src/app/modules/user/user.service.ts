import { BadRequestException, Injectable } from '@nestjs/common';
import { MailVerificationNotification } from '../../notifications/mailverification.notification';
import { NotificationService } from '../../../libs/notification/notification.service';
import { UpdateProfileInput } from './dto/user.dto';
import { User } from '../../models/user.model';
import {
  __,
  errorResponse,
  IgnoreUnique,
  processException,
  successResponse,
  getRandomNumber,
  marketplace_url,
} from '../../helpers/functions';
import { FilesystemService } from '../../filesystem/filesystem.service';
import {
  MODEL_TYPE_USER,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
  FILE_TYPE_IMAGE,
  GLOBAL_SEARCH_QUERY_LIMIT,
} from '../../helpers/coreconstants';
import { prisma_client } from 'src/app/helpers/functions';
import { isAlphanumeric, isEmail } from 'class-validator';
import { UserNotificationSettingDto } from './dto/user-notification-setting.dto';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { NotificationSettingModel } from 'src/app/models/notification-setting.model';
import { UserConnection } from 'src/app/models/pagination/user-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { Prisma } from '@prisma/client';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { UserFilter } from './dto/filter.dto';
import { CollectionWithItemFilter } from '../collection/dto/filter.dto';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';

@Injectable()
export class UserService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly fileService: FilesystemService,
  ) {}

  async getAccountListsPaginate(
    paginate: PaginationArgs,
    filter: UserFilter,
    withItemFilter: CollectionWithItemFilter,
  ): Promise<UserConnection> {
    return await findManyCursorConnection<
      User,
      Pick<Prisma.CollectionWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.user.findMany({
          where: {
            status: STATUS_ACTIVE,
            OR: [
              {
                name: {
                  contains: filter.query,
                  mode: 'insensitive',
                },
              },
              {
                username: {
                  contains: filter.query,
                  mode: 'insensitive',
                },
              },
              {
                wallet_address: {
                  contains: filter.query,
                  mode: 'insensitive',
                },
              },
            ],
          },
          include: {
            ownedItems:
              withItemFilter && withItemFilter.withItem
                ? {
                    take: withItemFilter.totalItem ?? GLOBAL_SEARCH_QUERY_LIMIT,
                    orderBy: { id: 'desc' },
                  }
                : false,
            _count: {
              select: {
                ownedItems: true,
              },
            },
          },
          orderBy: {
            id: 'desc',
          },
          ...args,
        }),
      () =>
        prisma_client.user.count({
          where: {
            status: STATUS_ACTIVE,
            OR: [
              {
                name: {
                  contains: filter.query,
                  mode: 'insensitive',
                },
              },
              {
                username: {
                  contains: filter.query,
                  mode: 'insensitive',
                },
              },
              {
                wallet_address: {
                  contains: filter.query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        }),
      paginate,
      pOptions,
    );
  }

  async checkUniqueUser(wallet_address: string, filter: any) {
    try {
      if (!filter.username && !filter.email) {
        throw new BadRequestException(
          errorResponse(__('Invalid empty username and email!')),
        );
      }
      if (filter.username && !isAlphanumeric(filter.username)) {
        throw new BadRequestException(errorResponse(__('Invalid username!')));
      }
      const user = await prisma_client.user.findFirst({
        where: {
          username: filter.username ? filter.username : undefined,
          email: filter.email ? filter.email : undefined,
          wallet_address: {
            not: wallet_address,
            mode: 'insensitive',
          },
        },
      });
      if (user) {
        let error_msg = '';
        if (filter.username) {
          error_msg = __('Invalid username. The username is already taken!');
        } else if (filter.email) {
          error_msg = __('Invalid email. The email is already taken!');
        }
        return errorResponse(error_msg, null, 400);
      } else {
        let success_msg = '';
        if (filter.username) {
          success_msg = __('The username is valid.');
        } else if (filter.email) {
          success_msg = __('The email is valid.');
        }
        return successResponse(success_msg);
      }
    } catch (e) {
      processException(e);
    }
  }

  // Update profile
  async updateProfile(payload: UpdateProfileInput, user: User) {
    try {
      if (!user) {
        throw new BadRequestException(errorResponse(__('User not found!')));
      }

      if (payload.email && !isEmail(payload.email)) {
        throw new BadRequestException(errorResponse(__('Invalid Email!')));
      }

      const profile_img_file = await payload.profile_img_file;
      const banner_img_file = await payload.banner_img_file;

      if (payload.email) await this.checkUserUniqueEmail(payload, user);
      if (payload.phone) await this.checkUserUniquePhone(payload, user);
      if (payload.username) await this.checkUserUniqueUserName(payload, user);

      const socialData = {
        website_link: payload.website_link,
        instagram_link: payload.instagram_link,
      };

      delete payload['website_link'];
      delete payload['instagram_link'];

      const userData = await this.profileImageUpload(payload, user);

      const updatedUser = await prisma_client.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...userData,
        },
      });
      if (profile_img_file) await this.fileService.deleteFile(user.profile_img);
      if (banner_img_file) await this.fileService.deleteFile(user.banner_img);
      await this.updateSocialLink(user, socialData);
      if (payload.email && payload.email !== user.email) {
        const sentEmail = await this.sendVerificationMail(updatedUser);
        if (sentEmail)
          return successResponse(
            __(
              'User verification email send successfully. Please verify your email.',
            ),
          );
      }
      return successResponse(__('Profile updated successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  async resendVerificationEmail(user: User) {
    try {
      if (user.is_email_verified == STATUS_ACTIVE)
        return successResponse(__('Email already verified.'));

      const sentEmail = await this.sendVerificationMail(user);
      if (sentEmail)
        return successResponse(
          __(
            'User verification email resend successfully. Please verify your email.',
          ),
        );
    } catch (e) {
      processException(e);
    }
  }

  async sendVerificationMail(user: User): Promise<boolean> {
    const reset_code = getRandomNumber(6).toString();
    const data = {
      title: __('Please verify your email address'),
      description: __(
        'Click this button to verify your email address and finish setting up your account.',
      ),
      link: marketplace_url() + '/profile' + '/email-verify?code=' + reset_code,
    };
    await prisma_client.user.update({
      where: {
        id: user.id,
      },
      data: {
        reset_code: reset_code,
        is_email_verified: STATUS_INACTIVE,
        email_verified_at: null,
      },
    });
    this.notificationService.send(new MailVerificationNotification(data), user);
    return true;
  }

  // Update user social link
  async updateSocialLink(user, socialLinkData) {
    const social_link = {
      model_id: user.id,
      model_type: MODEL_TYPE_USER,
      website_link: socialLinkData.website_link,
      instagram_link: socialLinkData.instagram_link,
    };
    const checkSocial = await prisma_client.socialLinks.findFirst({
      where: {
        model_id: user.id,
        model_type: MODEL_TYPE_USER,
      },
    });
    if (checkSocial) {
      await prisma_client.socialLinks.update({
        where: {
          id: checkSocial.id,
        },
        data: social_link,
      });
    } else {
      await prisma_client.socialLinks.create({
        data: social_link,
      });
    }
  }

  // Check user email is unique or not
  async checkUserUniqueEmail(payload, user) {
    const checkUniqueEmail = await IgnoreUnique(
      payload.email,
      'User',
      'email',
      user.id,
    );
    if (checkUniqueEmail.success === false) {
      throw new BadRequestException(
        errorResponse(
          __('The email address already exists, Please try another'),
        ),
      );
    }
  }

  // check user phone is unique or not
  async checkUserUniquePhone(payload, user) {
    const checkUniquePhone = await IgnoreUnique(
      payload.phone,
      'User',
      'phone',
      user.id,
    );
    if (checkUniquePhone.success === false) {
      throw new BadRequestException(
        errorResponse(
          __('The phone number already exists, Please try another'),
        ),
      );
    }
  }

  async checkUserUniqueUserName(payload, user) {
    const checkUniqueUsername = await IgnoreUnique(
      payload.username,
      'User',
      'username',
      user.id,
    );
    if (checkUniqueUsername.success === false) {
      throw new BadRequestException(
        errorResponse(__('Invalid username. The username is already taken.')),
      );
    }
  }

  // Upload user image
  async profileImageUpload(payload, user) {
    const profile_img_file = await payload.profile_img_file;
    const banner_img_file = await payload.banner_img_file;

    if (profile_img_file) {
      const file = await this.fileService.upload(
        profile_img_file,
        `user-${user.id}`,
        [FILE_TYPE_IMAGE],
      );
      if (!file.url) throw new Error(errorResponse().message);
      payload.profile_img = file.url;
    }

    if (banner_img_file) {
      const file = await this.fileService.upload(
        banner_img_file,
        `user-${user.id}`,
        [FILE_TYPE_IMAGE],
      );
      if (!file.url) throw new Error(errorResponse().message);
      payload.banner_img = file.url;
    }

    delete payload['profile_img_file'];
    delete payload['banner_img_file'];

    return payload;
  }

  async userNotificationSettingSave(
    user: User,
    data: UserNotificationSettingDto,
  ): Promise<ResponseModel> {
    try {
      const getNotificationSettingsEvent =
        await prisma_client.notificationSetting.findFirst({
          where: {
            user_id: user.id,
          },
        });
      if (getNotificationSettingsEvent) {
        await prisma_client.notificationSetting.update({
          where: {
            id: getNotificationSettingsEvent.id,
          },
          data: {
            events: data.events ? data.events.join(',') : null,
          },
        });
        return successResponse(
          __('Notification settings updated successfully.'),
        );
      } else {
        await prisma_client.notificationSetting.create({
          data: {
            user_id: user.id,
            events: data.events ? data.events.join(',') : null,
          },
        });
        return successResponse(__('Notification settings saved successfully.'));
      }
    } catch (e) {
      processException(e);
    }
  }

  async getNotificationSetting(user: User): Promise<NotificationSettingModel> {
    try {
      return await prisma_client.notificationSetting.findFirst({
        where: {
          user_id: user.id,
        },
      });
    } catch (e) {
      processException(e);
    }
  }
}
