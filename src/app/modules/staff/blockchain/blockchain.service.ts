import { BadRequestException, Injectable } from '@nestjs/common';
import { BlockchainModel, BlockchainStaffModel } from './blockchain.model';
import {
  FILE_TYPE_IMAGE,
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
import { CreateBlockChainDto, UpdateBlockChainDto } from './dto/create.dto';
import { FileObject } from 'src/app/filesystem/file.object';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { FilesystemService } from 'src/app/filesystem/filesystem.service';
import { BlockchainSlugMapping } from 'src/app/helpers/corearray';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Prisma } from '@prisma/client';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { BlockchainStaffConnection } from 'src/app/models/pagination/blockchain-connection.model';
import { Order } from 'src/app/models/input/order.input';

@Injectable()
export class BlockchainService {
  constructor(private readonly fileService: FilesystemService) {}

  async getBlockchainLists(status?: number): Promise<BlockchainModel[]> {
    return await prisma_client.blockchain.findMany({
      where: {
        status: status || status == STATUS_INACTIVE ? status : STATUS_ACTIVE,
      },
      include: {
        payment_tokens: {
          where: {
            status: STATUS_ACTIVE,
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getBlockchainDetails(
    chain_id: number,
    id: number,
  ): Promise<BlockchainModel> {
    return await prisma_client.blockchain.findFirst({
      where: {
        chain_id: chain_id ?? undefined,
        id: id ?? undefined,
      },
    });
  }

  async getStaffBlockchainListPaginate(
    paginate: PaginationArgs,
    filter?: any,
    orderBy?: Order,
  ): Promise<BlockchainStaffConnection> {
    return findManyCursorConnection<
      BlockchainStaffModel,
      Pick<Prisma.BlockchainWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.blockchain.findMany({
          where: {
            network_name:
              filter && filter.query
                ? {
                    contains: filter.query,
                    mode: 'insensitive',
                  }
                : undefined,
            status: filter.status ?? undefined,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.blockchain.count({
          where: {
            network_name: filter.query ?? undefined,
            status: filter.status ?? undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getBlockchainByID(id: number): Promise<BlockchainStaffModel> {
    return await prisma_client.blockchain.findUnique({
      where: {
        id: id,
      },
    });
  }

  async createBlockchain(payload: CreateBlockChainDto): Promise<ResponseModel> {
    try {
      const imageUrl = await this.uploadImage(payload.logo, 'blockchain');
      const chainId = payload.slug
        ? BlockchainSlugMapping[payload.slug].chainId
        : null;
      const response = await prisma_client.blockchain.create({
        data: {
          ...payload,
          logo: imageUrl,
          chain_id: chainId,
        },
      });
      return response
        ? successResponse('Blockchain updated successfully!')
        : errorResponse('Blockchain update failed.');
    } catch (e) {
      processException(e);
    }
  }

  async updateBlockchain(
    id,
    payload: UpdateBlockChainDto,
  ): Promise<ResponseModel> {
    try {
      const blockchain = await prisma_client.blockchain.findUnique({
        where: {
          id: id,
        },
      });
      if (!blockchain) {
        throw new BadRequestException(errorResponse(__('Invalid Blockchain.')));
      }

      const checkBlockchain = await this.getBlockchainByNetwork(
        id,
        payload.network_name,
      );

      if (checkBlockchain) {
        throw new BadRequestException(
          errorResponse(__('Network name already exists.')),
        );
      }

      const imageUrl = await this.uploadImage(payload.logo, 'blockchain');
      let logo = blockchain.logo;
      if (imageUrl) {
        logo = imageUrl;
        await this.fileService.deleteFile(blockchain.logo);
      }
      const chainId = payload.slug
        ? BlockchainSlugMapping[payload.slug].chainId
        : null;
      const response = await prisma_client.blockchain.update({
        where: {
          id: id,
        },
        data: {
          ...payload,
          logo,
          chain_id: chainId,
        },
      });
      return response
        ? successResponse('Blockchain updated successfully!')
        : errorResponse('Blockchain update failed.');
    } catch (e) {
      processException(e);
    }
  }

  async updateBlockchainStatus(
    id: number,
    status: number,
  ): Promise<ResponseModel> {
    try {
      const blockchain = await prisma_client.blockchain.findUnique({
        where: {
          id: id,
        },
      });
      if (!blockchain) {
        throw new BadRequestException(errorResponse(__('Invalid Blockchain.')));
      }

      const response = await prisma_client.blockchain.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });
      return response
        ? successResponse('Blockchain status updated successfully!')
        : errorResponse('Blockchain status update failed.');
    } catch (e) {
      processException(e);
    }
  }

  async getBlockchainByNetwork(
    id: number,
    network_name: string,
  ): Promise<BlockchainModel> {
    return await prisma_client.blockchain.findFirst({
      where: {
        NOT: {
          id: id,
        },
        network_name: network_name,
      },
    });
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

  async deleteBlockchain(id): Promise<ResponseModel> {
    try {
      const response = await prisma_client.blockchain.delete({
        where: {
          id: id,
        },
      });
      return response
        ? successResponse('Blockchain deleted successfully!')
        : errorResponse('Blockchain delete failed.');
    } catch (e) {
      processException(e);
    }
  }
}
