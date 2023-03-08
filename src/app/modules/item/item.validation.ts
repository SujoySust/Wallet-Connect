import {
  SETTINGS_KEY_MINTING_INTERVAL_DURATION_IN_MIN,
  SETTINGS_KEY_PER_DAY_MINTING_LIMIT,
} from '../../helpers/slugconstants';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  __,
  covertMilSecToMin,
  errorResponse,
  getSettings,
} from '../../helpers/functions';
import { User } from '../../models/user.model';
import { PrismaService } from '../../../libs/prisma/prisma.service';
import { STATUS_ACTIVE } from 'src/app/helpers/coreconstants';
import { CreateItemDto } from './dto/item.create.dto';

@Injectable()
export class ItemValidation {
  private prisma: PrismaService;
  // constructor(private readonly prisma: PrismaService) {}

  async createItemValidation(
    payload: CreateItemDto,
    prismaService: PrismaService,
    user: User,
  ) {
    this.prisma = prismaService;
    await this.validateCollection(payload, user);
    await this.validateUnlockContent(payload);
    await this.validatePerDayMintingLimit(user);
    await this.validateMintingIntervalDuration(user);
    return payload;
  }

  async validateCollection(payload: CreateItemDto, user: User) {
    if (payload.collection_id) {
      const collection = await this.prisma.collection.findFirst({
        where: {
          id: payload.collection_id,
          user_id: user.id,
          status: STATUS_ACTIVE,
        },
      });
      if (!collection) {
        this.throwError(__('Invalid collection!'));
      }
    }
  }

  async validateUnlockContent(payload) {
    if (payload.is_unlockable_content) {
      if (!payload.unlockable_content) {
        this.throwError(__('Unlock able content is required!'));
      }
    }
  }

  async validatePerDayMintingLimit(user: User) {
    const today = new Date().toISOString().split('T')[0];
    const today_start = `${today}T00:00:00.000Z`;
    const today_end = `${today}T23:59:59.000Z`;
    const daily_minting_limit = await getSettings(
      this.prisma,
      SETTINGS_KEY_PER_DAY_MINTING_LIMIT,
    );
    const daily_item_counts = await this.prisma.item.count({
      where: {
        creator_id: user.id,
        created_at: {
          gte: today_start,
          lte: today_end,
        },
      },
    });
    if (daily_item_counts >= parseInt(daily_minting_limit)) {
      this.throwError(__('You daily minting limit already exceeds.'));
    }
  }

  async validateMintingIntervalDuration(user: User) {
    const last_minted_item = await this.prisma.item.findFirst({
      where: {
        creator_id: user.id,
      },
      orderBy: {
        id: 'desc',
      },
    });
    if (last_minted_item) {
      const interval = Math.abs(
        Date.now() - +new Date(last_minted_item.created_at),
      );
      const intervalInMin = covertMilSecToMin(interval);
      const minting_duration = await getSettings(
        this.prisma,
        SETTINGS_KEY_MINTING_INTERVAL_DURATION_IN_MIN,
      );

      if (intervalInMin < parseInt(minting_duration)) {
        const msg =
          __('You will be able to create after ') +
          (parseInt(minting_duration) - intervalInMin) +
          __(' minutes');

        this.throwError(msg);
      }
    }
  }

  throwError(error: string) {
    throw new BadRequestException(errorResponse(error));
  }
}
