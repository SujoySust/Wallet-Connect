import { CreateCollectionDto } from './dto/collection.dto';
import { Collection } from '../../models/collection.model';
import { convertToSlug, errorResponse } from '../../helpers/functions';
import { FilesystemService } from '../../filesystem/filesystem.service';
import { CollectionValidation } from './collection.validation';
import {
  FILE_TYPE_IMAGE,
  MODEL_TYPE_COLLECTION,
} from '../../helpers/coreconstants';
import { Injectable } from '@nestjs/common';
import { UpdateCollectionDto } from './dto/collection.dto';

@Injectable()
export class CollectionData {
  constructor(
    private readonly fileService: FilesystemService,
    private readonly collectionValidation: CollectionValidation,
  ) {}

  // Prepare collection insert data..
  async prepareCollectionInsertData(payload: CreateCollectionDto) {
    const collectionData = {
      name: payload.name,
      slug: payload.slug
        ? convertToSlug(payload.slug)
        : convertToSlug(payload.name),
      description: payload.description,
      royalties: payload.royalties,
      contract_address: payload.contract_address
        ? payload.contract_address
        : null,
      payout_address: payload.payout_address,
      display_theme: payload.display_theme,
      is_sensitive: payload.is_sensitive,
    };

    const defaultImageData = {
      logo: '',
      feature_image: '',
      banner_image: '',
    };

    const imageData = await this.prepareCollectionImageData(
      payload,
      defaultImageData,
    );

    const allCollectionData = {
      ...collectionData,
      ...imageData,
    };

    return allCollectionData;
  }

  // Prepare collection Update data..
  async prepareCollectionUpdateData(
    payload: UpdateCollectionDto,
    collection: Collection,
  ) {
    await this.collectionValidation.checkCollectionIgnoreUniques(
      payload,
      collection,
    );
    const collectionData = {
      name: payload.name ? payload.name : collection.name,
      slug: payload.slug ? convertToSlug(payload.slug) : collection.slug,
      description: payload.description
        ? payload.description
        : collection.description,
      contract_address: payload.contract_address
        ? payload.contract_address
        : collection.contract_address,
      royalties: payload.royalties ?? undefined,
      payout_address: payload.payout_address,
      display_theme: payload.display_theme
        ? payload.display_theme
        : collection.display_theme,
      is_sensitive: payload.is_sensitive,
    };

    const defaultImageData = {
      logo: collection.logo,
      feature_image: collection.feature_image,
      banner_image: collection.banner_image,
    };

    const imageData = await this.prepareCollectionImageData(
      payload,
      defaultImageData,
    );

    const allCollectionData = {
      ...collectionData,
      ...imageData,
    };

    return allCollectionData;
  }

  // Prepare collection image data..
  async prepareCollectionImageData(payload, imageData) {
    const logo_file = await payload.logo_file;
    const feature_image_file = await payload.feature_image_file;
    const banner_image_file = await payload.banner_image_file;

    if (logo_file) {
      const logoFile = await this.fileService.upload(logo_file, `collection`, [
        FILE_TYPE_IMAGE,
      ]);
      if (!logoFile.url) throw new Error(errorResponse().message);
      imageData.logo = logoFile.url;
    }
    if (feature_image_file) {
      const featureImageFile = await this.fileService.upload(
        feature_image_file,
        `collection`,
        [FILE_TYPE_IMAGE],
      );
      if (!featureImageFile.url) throw new Error(errorResponse().message);
      imageData.feature_image = featureImageFile.url;
    }

    if (banner_image_file) {
      const bannerImageFile = await this.fileService.upload(
        banner_image_file,
        `collection`,
        [FILE_TYPE_IMAGE],
      );
      if (!bannerImageFile.url) throw new Error(errorResponse().message);
      imageData.banner_image = bannerImageFile.url;
    }

    return imageData;
  }

  // Prepare collection social link data..
  async prepareCollectionSocialLinkData(collectionId: number, payload) {
    return {
      model_type: MODEL_TYPE_COLLECTION,
      model_id: collectionId,
      website_link: payload.website_link,
      discord_link: payload.discord_link,
      instagram_link: payload.instagram_link,
      medium_link: payload.medium_link,
      telegram_link: payload.telegram_link,
    };
  }

  // Prepare collection payment token data..
  async preparePaymentTokenData(payment_token: string, collection_id: number) {
    const paymentToken = payment_token ? payment_token.split(',') : [];
    const paymentTokenData = [];
    if (paymentToken.length > 0) {
      paymentToken.map((payment_token_id: string) => {
        paymentTokenData.push({
          collection_id,
          payment_token_id: parseInt(payment_token_id),
        });
      });
    }
    return paymentTokenData;
  }
}
