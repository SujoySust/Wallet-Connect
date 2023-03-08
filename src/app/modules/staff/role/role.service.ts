import { Injectable } from '@nestjs/common';
import { roleInput } from './dto/role.input';
import { RoleOrder } from '../../../models/input/role-order.input';
import {
  errorResponse,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';

@Injectable()
export class RoleService {
  async getRole(id?) {
    return await prisma_client.role.findUnique({
      where: {
        id: id,
      },
    });
  }

  async getRoles(query?: string, orderBy?: RoleOrder) {
    return await prisma_client.role.findMany({
      where: {
        name: query
          ? {
              contains: query,
              mode: 'insensitive',
            }
          : undefined,
      },
      orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
    });
  }

  async createRole(payload: roleInput): Promise<ResponseModel> {
    try {
      const role = await prisma_client.role.create({
        data: {
          ...payload,
        },
      });
      return role
        ? successResponse(__('Role created successfully.'))
        : errorResponse(__('Role create failed.'));
    } catch (e) {
      processException(e);
    }
  }

  async updateRole(id, payload: roleInput): Promise<ResponseModel> {
    try {
      const role = await prisma_client.role.update({
        where: {
          id: id,
        },
        data: {
          ...payload,
        },
      });
      return role
        ? successResponse(__('Role updated successfully!'))
        : errorResponse(__('Role update failed.'));
    } catch (e) {
      processException(e);
    }
  }

  async deleteRole(id): Promise<ResponseModel> {
    try {
      const role = await prisma_client.role.delete({
        where: {
          id: id,
        },
      });
      return role
        ? successResponse(__('Role deleted successfully!'))
        : errorResponse(__('Role delete failed.'));
    } catch (e) {
      processException(e);
    }
  }
}
