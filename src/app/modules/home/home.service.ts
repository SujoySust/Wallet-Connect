/* eslint-disable @typescript-eslint/no-var-requires */
import { BadRequestException, Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import {
  GLOBAL_SEARCH_QUERY_LIMIT,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import {
  errorResponse,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';

import { ResponseModel } from 'src/app/models/dto/response.model';
import { SearchModel } from 'src/app/models/dto/search.model';

@Injectable()
export class HomeService {
  async globalSearch(query: string, limit?: number): Promise<SearchModel> {
    try {
      const collection = await prisma_client.collection.findMany({
        where: {
          status: STATUS_ACTIVE,
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        include: {
          blockchain: true,
          items: {
            where: {
              status: STATUS_ACTIVE,
            },
          },
        },
        orderBy: [{ id: 'desc' }],
        take: limit ?? GLOBAL_SEARCH_QUERY_LIMIT,
      });
      const item = await prisma_client.item.findMany({
        where: {
          status: STATUS_ACTIVE,
          collection: {
            status: STATUS_ACTIVE,
          },
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        include: {
          collection: true,
        },
        orderBy: [{ id: 'desc' }, { minted_at: 'desc' }],
        take: limit ?? GLOBAL_SEARCH_QUERY_LIMIT,
      });
      const user = await prisma_client.user.findMany({
        where: {
          status: STATUS_ACTIVE,
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              wallet_address: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [{ id: 'desc' }],
        take: limit ?? GLOBAL_SEARCH_QUERY_LIMIT,
      });
      return {
        collection: collection,
        item: item,
        account: user,
      };
    } catch (e) {
      processException(e);
    }
  }
  async saveNewsLetterSubscription(email: string): Promise<ResponseModel> {
    try {
      if (!isEmail(email))
        throw new BadRequestException(errorResponse(__('Invalid Email.')));
      const isSubscribed = await prisma_client.newsletterSubscription.findFirst(
        {
          where: {
            email: email,
          },
        },
      );
      if (!isSubscribed) {
        await prisma_client.newsletterSubscription.create({
          data: {
            email: email,
          },
        });
      }
      return successResponse(__('News letter subscribed successfully.'));
    } catch (e) {
      processException(e);
    }
  }
}
