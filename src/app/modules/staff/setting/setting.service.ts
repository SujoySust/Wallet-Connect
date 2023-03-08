import { Injectable } from '@nestjs/common';
import { Setting } from './setting.model';
import { logoSettingsInput } from './dto/logo-settings.input';
import {
  prisma_client,
  processException,
  successResponse,
  uploadImage,
} from 'src/app/helpers/functions';

import {
  SETTINGS_SLUG_BANNER_IMAGE,
  SETTINGS_GROUP_LOGO,
  SETTINGS_SLUG_INSTRUCTION_IMAGE,
  SETTINGS_SLUG_RESOURCE_SECTION_ONE_IMAGE,
  SETTINGS_SLUG_RESOURCE_SECTION_THREE_IMAGE,
  SETTINGS_SLUG_RESOURCE_SECTION_TWO_IMAGE,
  SETTINGS_VALUE_TYPE_MEDIA_URL,
  SETTINGS_VALUE_TYPE_TEXT,
  SETTINGS_SLUG_APP_LOGO_LARGE,
  SETTINGS_SLUG_APP_LOGO_SMALL,
  SETTINGS_SLUG_FAVICON_LOGO,
} from 'src/app/helpers/slugconstants';
@Injectable()
export class SettingService {
  private imageSlugList = [
    SETTINGS_SLUG_BANNER_IMAGE,
    SETTINGS_SLUG_INSTRUCTION_IMAGE,
    SETTINGS_SLUG_RESOURCE_SECTION_ONE_IMAGE,
    SETTINGS_SLUG_RESOURCE_SECTION_TWO_IMAGE,
    SETTINGS_SLUG_RESOURCE_SECTION_THREE_IMAGE,
    SETTINGS_SLUG_APP_LOGO_LARGE,
    SETTINGS_SLUG_APP_LOGO_SMALL,
    SETTINGS_SLUG_FAVICON_LOGO,
  ];
  async insertOrUpdateSettings(data: any) {
    const setting = await prisma_client.setting.findFirst({
      where: {
        option_group: data.option_group,
        option_key: data.option_key,
      },
    });
    if (setting) {
      await prisma_client.setting.update({
        where: {
          id: setting.id,
        },
        data: data,
      });
    } else {
      await prisma_client.setting.create({
        data: data,
      });
    }
  }

  async settingSave(payload: any, group: string, image_path?: string | null) {
    try {
      for (const property in payload) {
        if (this.imageSlugList.includes(property)) {
          const image = await payload[property];
          if (image) {
            const imageUrl = await uploadImage(
              image,
              image_path ?? 'application/settings',
            );
            if (imageUrl) {
              await this.insertOrUpdateSettings({
                value_type: SETTINGS_VALUE_TYPE_MEDIA_URL,
                option_group: group,
                option_key: property,
                option_value: imageUrl,
              });
            }
          }
        } else {
          await this.insertOrUpdateSettings({
            value_type: SETTINGS_VALUE_TYPE_TEXT,
            option_group: group,
            option_key: property,
            option_value: payload[property],
          });
        }
      }
      return successResponse('Settings saved successfully!');
    } catch (e) {
      processException(e);
    }
  }

  async logoSettingSave(payload: logoSettingsInput) {
    try {
      for (const property in payload) {
        const image = await payload[property];
        if (image) {
          const imageUrl = await uploadImage(image, 'application/settings');
          if (imageUrl) {
            await this.insertOrUpdateSettings({
              value_type: SETTINGS_VALUE_TYPE_MEDIA_URL,
              option_group: SETTINGS_GROUP_LOGO,
              option_key: property,
              option_value: imageUrl,
            });
          }
        }
      }
      return successResponse('Logo setting saved successfully!');
    } catch (e) {
      processException(e);
    }
  }

  async getSettingsData(option_group: []): Promise<Setting[]> {
    try {
      return await prisma_client.setting.findMany({
        where: {
          option_group:
            option_group.length > 0
              ? {
                  in: option_group,
                }
              : undefined,
        },
      });
    } catch (e) {
      processException(e);
    }
  }
}
