import { BadRequestException, Injectable } from '@nestjs/common';
import {
  NativeNwrapTokenModel,
  PaymentTokenModel,
} from 'src/app/models/paymentToken.model';
import {
  FILE_TYPE_IMAGE,
  PAYMENT_TOKEN_TYPE_NATIVE_COIN,
  PAYMENT_TOKEN_TYPE_TOKEN,
  STATUS_ACTIVE,
  STATUS_INACTIVE,
} from '../../../helpers/coreconstants';
import {
  errorResponse,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { PaymentTokenConnection } from 'src/app/models/pagination/payment-token-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { PaymentTokenFilter } from './dto/filter.dto';
import { Prisma } from '@prisma/client';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { PaymentTokenOrder } from 'src/app/models/input/payment-token-order.input';
import { CreatePaymentTokenDto, UpdatePaymentTokenDto } from './dto/create.dto';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { FileObject } from 'src/app/filesystem/file.object';
import { FilesystemService } from 'src/app/filesystem/filesystem.service';
import { Order } from 'src/app/models/input/order.input';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TokenService {
  constructor(
    private readonly fileService: FilesystemService,
    private readonly httpService: HttpService,
  ) {}

  async getTokenLists(
    blockchain_id: number,
    chain_id: number,
  ): Promise<PaymentTokenModel[]> {
    return await prisma_client.paymentToken.findMany({
      where: {
        status: STATUS_ACTIVE,
        blockchain:
          blockchain_id || chain_id
            ? {
                id: blockchain_id ?? undefined,
                chain_id: chain_id ?? undefined,
              }
            : undefined,
      },
      include: {
        blockchain: true,
      },
      orderBy: [
        {
          type: 'asc',
        },
        {
          is_wrapable: 'desc',
        },
        {
          id: 'asc',
        },
      ],
    });
  }

  async getNativeNwrapToken(
    blockchain_id: number,
    chain_id: number,
  ): Promise<NativeNwrapTokenModel> {
    const native_token = await prisma_client.paymentToken.findFirst({
      where: {
        type: PAYMENT_TOKEN_TYPE_NATIVE_COIN,
        blockchain:
          blockchain_id || chain_id
            ? {
                id: blockchain_id ?? undefined,
                chain_id: chain_id ?? undefined,
              }
            : undefined,
      },
      include: {
        blockchain: true,
      },
    });

    const wrap_token = await prisma_client.paymentToken.findFirst({
      where: {
        type: PAYMENT_TOKEN_TYPE_TOKEN,
        is_wrapable: STATUS_ACTIVE,
        blockchain:
          blockchain_id || chain_id
            ? {
                id: blockchain_id ?? undefined,
                chain_id: chain_id ?? undefined,
              }
            : undefined,
      },
      include: {
        blockchain: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    return { native_token, wrap_token };
  }

  async getItemsTokens(item_id: number): Promise<PaymentTokenModel[]> {
    return await prisma_client.paymentToken.findMany({
      where: {
        status: STATUS_ACTIVE,
        payment_token_mappings: {
          some: {
            collection: {
              items: {
                some: {
                  id: item_id,
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          type: 'asc',
        },
        {
          is_wrapable: 'desc',
        },
        {
          id: 'asc',
        },
      ],
    });
  }

  async getTokenListsPaginate(
    paginate: PaginationArgs,
    filter?: PaymentTokenFilter,
    orderBy?: PaymentTokenOrder,
  ): Promise<PaymentTokenConnection> {
    return findManyCursorConnection<
      PaymentTokenModel,
      Pick<Prisma.PaymentTokenWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.paymentToken.findMany({
          where: this.paymentTokenFilter(filter),
          include: {
            blockchain: true,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.paymentToken.count({
          where: this.paymentTokenFilter(filter),
        }),
      paginate,
      pOptions,
    );
  }

  paymentTokenFilter(
    filterData: PaymentTokenFilter,
  ): Prisma.PaymentTokenWhereInput {
    return {
      name: filterData.query
        ? {
            contains: filterData.query,
            mode: 'insensitive',
          }
        : undefined,
      status: STATUS_ACTIVE,
      blockchain:
        filterData.chain_id || filterData.blockchain_id
          ? {
              id: filterData.blockchain_id ?? undefined,
              chain_id: filterData.chain_id ?? undefined,
            }
          : undefined,
      payment_token_mappings: {
        some: filterData.collection_id
          ? {
              collection_id: filterData.collection_id,
            }
          : undefined,
      },
    };
  }

  async getStaffPaymentTokenListPaginate(
    paginate: PaginationArgs,
    filter?: PaymentTokenFilter,
    orderBy?: Order,
  ): Promise<PaymentTokenConnection> {
    return findManyCursorConnection<
      PaymentTokenModel,
      Pick<Prisma.PaymentTokenWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.paymentToken.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: filter.query || '',
                  mode: 'insensitive',
                },
              },
              {
                token_symbol: {
                  contains: filter.query || '',
                  mode: 'insensitive',
                },
              },
              {
                blockchain: {
                  network_name: {
                    contains: filter.query || '',
                    mode: 'insensitive',
                  },
                },
              },
            ],
            status: filter.status || undefined,
          },
          include: {
            blockchain: true,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.paymentToken.count({
          where: {
            name: filter.query ?? undefined,
            status: filter.status ?? undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getPaymentTokenByID(id: number): Promise<PaymentTokenModel> {
    return await prisma_client.paymentToken.findUnique({
      where: {
        id: id,
      },
    });
  }

  async createPaymentToken(
    payload: CreatePaymentTokenDto,
  ): Promise<ResponseModel> {
    try {
      const imageUrl = await this.uploadImage(payload.logo, 'payment_token');
      const checkPaymentToken = await prisma_client.paymentToken.findFirst({
        where: {
          blockchain_id: payload.blockchain_id,
          contract_address: payload.contract_address,
        },
      });
      if (checkPaymentToken) {
        throw new BadRequestException(
          errorResponse(
            __('Payment token already exists using this contract address.'),
          ),
        );
      }
      const response = await prisma_client.paymentToken.create({
        data: {
          ...payload,
          token_symbol: payload.token_symbol.toUpperCase(),
          usd_rate:
            payload.sync_rate_status !== STATUS_ACTIVE
              ? payload.usd_rate || 0
              : undefined,
          logo: imageUrl,
        },
      });
      this.syncUsdRates();
      return response
        ? successResponse('Payment token created successfully!')
        : errorResponse('Payment token create failed.');
    } catch (e) {
      processException(e);
    }
  }

  async updatePaymentToken(
    id: number,
    payload: UpdatePaymentTokenDto,
  ): Promise<ResponseModel> {
    try {
      const payment_token = await prisma_client.paymentToken.findUnique({
        where: {
          id: id,
        },
      });
      if (!payment_token) {
        throw new BadRequestException(
          errorResponse(__('Invalid payment token.')),
        );
      }
      const checkTokenAddresExists = await prisma_client.paymentToken.findFirst(
        {
          where: {
            id: {
              not: id,
            },
            blockchain_id: payload.blockchain_id,
            contract_address: payload.contract_address,
          },
          select: {
            id: true,
          },
        },
      );
      if (checkTokenAddresExists) {
        throw new BadRequestException(
          errorResponse(
            __('Payment token already exists using this contract address.'),
          ),
        );
      }
      const imageUrl = await this.uploadImage(payload.logo, 'payment_token');
      let logo = payment_token.logo;
      if (imageUrl) {
        logo = imageUrl;
        await this.fileService.deleteFile(payment_token.logo);
      }
      const response = await prisma_client.paymentToken.update({
        where: {
          id: id,
        },
        data: {
          ...payload,
          token_symbol: payload.token_symbol.toUpperCase(),
          logo,
          usd_rate:
            payload.sync_rate_status !== STATUS_ACTIVE
              ? payload.usd_rate || 0
              : undefined,
        },
      });
      this.syncUsdRates();
      return response
        ? successResponse('Payment token updated successfully!')
        : errorResponse('Payment token update failed.');
    } catch (e) {
      processException(e);
    }
  }

  async updatePaymentTokenStatus(
    id: number,
    status: number,
  ): Promise<ResponseModel> {
    try {
      const payment_token = await prisma_client.paymentToken.findUnique({
        where: {
          id: id,
        },
      });
      if (!payment_token) {
        throw new BadRequestException(
          errorResponse(__('Invalid payment token.')),
        );
      }
      const response = await prisma_client.paymentToken.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });
      return response
        ? successResponse('Payment token status updated successfully!')
        : errorResponse('Payment token status update failed.');
    } catch (e) {
      processException(e);
    }
  }

  async uploadImage(imageFile, path: string): Promise<string | null> {
    let uploadFile: FileObject;
    const file = await imageFile;
    if (file) {
      uploadFile = await this.fileService.upload(file, path, [FILE_TYPE_IMAGE]);
      if (!uploadFile.url) throw new Error(errorResponse().message);
      return uploadFile.url;
    }
    return null;
  }

  async deletePaymentToken(id): Promise<ResponseModel> {
    try {
      const response = await prisma_client.paymentToken.delete({
        where: {
          id: id,
        },
      });
      return response
        ? successResponse('Payment token deleted successfully!')
        : errorResponse('Payment token delete failed.');
    } catch (e) {
      processException(e);
    }
  }

  async syncUsdRates() {
    try {
      const tokens = await prisma_client.paymentToken.findMany({
        where: {
          // status: STATUS_ACTIVE,
          sync_rate_status: STATUS_ACTIVE,
          OR: [
            {
              type: PAYMENT_TOKEN_TYPE_NATIVE_COIN,
            },
            {
              is_wrapable: STATUS_INACTIVE,
            },
          ],
        },
        distinct: ['token_symbol'],
        select: {
          token_symbol: true,
        },
      });
      if (tokens.length <= 0) return;
      let tsyms = '';
      tokens.map((token) => (tsyms += `${token.token_symbol},`));
      const url = `https://min-api.cryptocompare.com/data/price?api_key=${process.env.CRYPTO_CONVERSION_API_KEY}&fsym=USD&tsyms=${tsyms}`;
      const response = await lastValueFrom(this.httpService.get(url));
      for (const key in response.data) {
        if (Object.prototype.hasOwnProperty.call(response.data, key)) {
          const element = response.data[key];
          const usd_rate = (1 / element).toFixed(2);
          await prisma_client.paymentToken.updateMany({
            where: {
              token_symbol: {
                in: [key, `W${key}`],
              },
            },
            data: {
              usd_rate: usd_rate,
            },
          });
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }
}
