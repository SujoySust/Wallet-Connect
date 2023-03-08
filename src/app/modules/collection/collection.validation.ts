import {
  MAX_ROYALTY_PERCENTAGE,
  STATUS_ACTIVE,
} from '../../helpers/coreconstants';
import { BadRequestException, Injectable } from '@nestjs/common';
import { __, errorResponse, IgnoreUnique } from '../../helpers/functions';
import { Collection } from '../../models/collection.model';
import { UpdateCollectionDto } from './dto/collection.dto';
import Web3 from 'web3';
import { PrismaService } from 'nestjs-prisma';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3P = require('web3');

@Injectable()
export class CollectionValidation {
  private prisma: PrismaService;

  async createOrUpdateCollectionValidation(payload, prismaService) {
    this.prisma = prismaService;
    await this.validateCategory(payload);
    await this.validateRoyalties(payload);
    await this.validateToken(payload);
    return payload;
  }

  async validateCategory(payload) {
    if (payload.category_id) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: payload.category_id,
          status: STATUS_ACTIVE,
        },
      });
      if (!category) {
        this.throwError(__('Invalid category!'));
      }
    }
  }

  async validateBlockchain(payload): Promise<string> {
    const blockchain = await this.prisma.blockchain.findFirst({
      where: {
        id: payload.blockchain_id,
        status: STATUS_ACTIVE,
      },
    });
    if (!blockchain) {
      this.throwError(__('Invalid Blockchain network!'));
    }
    return blockchain.nft_contract;
  }

  async validateToken(payload) {
    if (!payload.payment_tokens) {
      this.throwError(__('Payment tokens required'));
    }

    const token_array = payload.payment_tokens.split(',').map((value) => {
      return parseInt(value);
    });
    const payment_tokens = await this.prisma.paymentToken.findMany({
      where: {
        blockchain_id: payload.blockchain_id,
        id: { in: token_array },
        status: STATUS_ACTIVE,
      },
    });
    if (!(token_array.length === payment_tokens.length)) {
      this.throwError(__('Invalid Payment tokens!'));
    }
  }

  // Collection unique ignore check.
  async checkCollectionIgnoreUniques(
    payload: UpdateCollectionDto,
    collection: Collection,
  ) {
    const checkUniqueName = await IgnoreUnique(
      payload.name,
      'Collection',
      'name',
      collection.id,
    );
    if (checkUniqueName.success === false) {
      this.throwError(__('Name already exists.'));
    }

    if (payload.slug) {
      const checkUniqueSlug = await IgnoreUnique(
        payload.slug,
        'Collection',
        'slug',
        collection.id,
      );
      if (checkUniqueSlug.success === false) {
        this.throwError(__('Url already exists.'));
      }
    }
  }

  async validateRoyalties(payload) {
    if (payload.royalties) {
      if (payload.royalties > MAX_ROYALTY_PERCENTAGE) {
        this.throwError(
          __('Creator earnings cannot be greater than ') +
            MAX_ROYALTY_PERCENTAGE +
            '%',
        );
      }
      const web3: Web3 = new Web3P();
      if (!payload.payout_address) {
        this.throwError(__('Payout address is required'));
      } else if (!web3.utils.isAddress(payload.payout_address)) {
        this.throwError(__('Payout address is not valid!'));
      }
    }
  }

  throwError(error: string) {
    throw new BadRequestException(errorResponse(error));
  }
}
