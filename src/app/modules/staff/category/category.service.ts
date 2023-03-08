import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Category } from '../../../models/category.model';
import { PaginationArgs } from '../../../../libs/graphql/pagination/pagination.args';
import { Order } from '../../../models/input/order.input';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { pOptions } from '../../../../libs/graphql/pagination/number-cursor';
import { CategoryConnection } from '../../../models/pagination/category-connection.model';
import {
  errorResponse,
  IgnoreUnique,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { FileObject } from 'src/app/filesystem/file.object';
import { FilesystemService } from 'src/app/filesystem/filesystem.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create.dto';
import {
  FILE_TYPE_IMAGE,
  STATUS_INACTIVE,
} from 'src/app/helpers/coreconstants';

@Injectable()
export class CategoryService {
  constructor(private readonly fileService: FilesystemService) {}
  async getCategories(status?: number): Promise<Category[]> {
    return await prisma_client.category.findMany({
      where: {
        status: status || status === STATUS_INACTIVE ? status : undefined,
      },
    });
  }

  async getCategoryByID(id: number): Promise<Category> {
    return await prisma_client.category.findUnique({
      where: {
        id: id,
      },
    });
  }

  async getCategoryList(
    paginate: PaginationArgs,
    filter?: any,
    orderBy?: Order,
  ): Promise<CategoryConnection> {
    return findManyCursorConnection<
      Category,
      Pick<Prisma.CategoryWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.category.findMany({
          where: {
            title: filter.query
              ? {
                  contains: filter.query,
                  mode: 'insensitive',
                }
              : undefined,
            status: filter.status ? filter.status : undefined,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.category.count({
          where: {
            title: filter.query
              ? {
                  contains: filter.query,
                  mode: 'insensitive',
                }
              : undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async createCategory(payload: CreateCategoryDto): Promise<ResponseModel> {
    try {
      const imageUrl = await this.uploadCategoryImage(
        payload.imageFile,
        'categories',
      );
      payload.image = imageUrl;
      delete payload['imageFile'];
      const response = await prisma_client.category.create({
        data: {
          ...payload,
        },
      });
      return response
        ? successResponse('Category created successfully!')
        : errorResponse('Category create failed.');
    } catch (e) {
      processException(e);
    }
  }

  async updateCategory(
    id: number,
    payload: UpdateCategoryDto,
  ): Promise<ResponseModel> {
    try {
      const category = await prisma_client.category.findUnique({
        where: {
          id: id,
        },
      });
      if (!category) {
        throw new BadRequestException(errorResponse(__('Invalid Category.')));
      }

      const result = await IgnoreUnique(payload.title, 'Category', 'title', id);
      if (result.success === false) {
        throw new BadRequestException(
          errorResponse(__('Title already exists.')),
        );
      }

      const imageUrl = await this.uploadCategoryImage(
        payload.imageFile,
        'categories',
      );
      delete payload['imageFile'];
      if (imageUrl) {
        payload.image = imageUrl;
        await this.fileService.deleteFile(category.image);
      } else {
        payload.image = category.image;
      }
      const response = await prisma_client.category.update({
        where: {
          id: id,
        },
        data: {
          ...payload,
        },
      });
      return response
        ? successResponse('Category updated successfully!')
        : errorResponse('Category update failed.');
    } catch (e) {
      processException(e);
    }
  }

  async uploadCategoryImage(imageFile, path: string): Promise<string | null> {
    let uploadFile: FileObject;
    const file = await imageFile;
    if (file) {
      uploadFile = await this.fileService.upload(file, path, [FILE_TYPE_IMAGE]);
      if (!uploadFile.url) throw new Error(errorResponse().message);
      return uploadFile.url;
    }
    return null;
  }

  async deleteCategory(id): Promise<ResponseModel> {
    try {
      const response = await prisma_client.category.delete({
        where: {
          id: id,
        },
      });
      return response
        ? successResponse('Category deleted successfully!')
        : errorResponse('Category delete failed.');
    } catch (e) {
      processException(e);
    }
  }
}
