import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import {
  errorResponse,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { UserOrder } from 'src/app/models/input/user-order.input';
import { UserConnection } from 'src/app/models/pagination/user-connection.model';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { StaffUserFilter } from './dto/filter.dto';

@Injectable()
export class StaffUserService {
  async getStaffUserListsPaginate(
    paginate: PaginationArgs,
    filter?: StaffUserFilter,
    orderBy?: UserOrder,
  ): Promise<UserConnection> {
    return await findManyCursorConnection<
      User,
      Pick<Prisma.UserWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.user.findMany({
          where: {
            status: filter.status !== null ? filter.status : undefined,
            OR: filter.query
              ? [
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
                  {
                    email: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.user.count({
          where: {
            status: filter.status !== null ? filter.status : undefined,
            OR: filter.query
              ? [
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
                  {
                    email: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getStaffUserById(id: number): Promise<User> {
    return await prisma_client.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  async updateUserStatus(id: number, status: number): Promise<ResponseModel> {
    try {
      const user = await prisma_client.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw new BadRequestException(errorResponse(__('Invalid User.')));
      }

      const response = await prisma_client.user.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });
      return response
        ? successResponse('User status updated successfully!')
        : errorResponse('User status update failed.');
    } catch (e) {
      processException(e);
    }
  }
}
