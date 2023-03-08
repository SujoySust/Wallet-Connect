import { BadRequestException, Injectable } from '@nestjs/common';
import { StaffCreateInput, StaffUpdateInput } from './dto/staff.input';
import { Staff } from './staff.model';
import { PasswordService } from 'src/libs/auth/password.service';
import { UpdatePasswordInput } from '../user/dto/user.dto';
import { compare } from 'bcryptjs';
import { PaginationArgs } from '../../../libs/graphql/pagination/pagination.args';
import { StaffFilter } from './dto/filter.dto';
import { StaffOrder } from '../../models/input/staff-order.input';
import { StaffConnection } from '../../models/pagination/staff-connection.model';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { pOptions } from '../../../libs/graphql/pagination/number-cursor';
import {
  errorResponse,
  IgnoreUnique,
  isAdmin,
  isUser,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { FileObject } from 'src/app/filesystem/file.object';
import { FilesystemService } from 'src/app/filesystem/filesystem.service';
import { prisma_client } from 'src/app/helpers/functions';
import { Prisma } from '@prisma/client';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { FILE_TYPE_IMAGE } from 'src/app/helpers/coreconstants';

@Injectable()
export class StaffService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly fileService: FilesystemService,
  ) {}

  async updateStaffProfile(payload: StaffUpdateInput, staff) {
    try {
      const checkUnique = await IgnoreUnique(
        payload.phone,
        'Staff',
        'phone',
        staff.id,
      );
      if (checkUnique.success === false) {
        throw new BadRequestException(
          errorResponse(
            __('The phone number already exists, Please try another'),
          ),
        );
      }
      if (
        Object.prototype.hasOwnProperty.call(payload, 'email') &&
        isUser(staff)
      ) {
        throw new BadRequestException(
          errorResponse(__("Email can't be changed.")),
        );
      } else if (
        Object.prototype.hasOwnProperty.call(payload, 'email') &&
        isAdmin(staff)
      ) {
        const checkUniqueEmail = await IgnoreUnique(
          payload.email,
          'Staff',
          'email',
          staff.id,
        );
        if (checkUniqueEmail.success === false) {
          throw new BadRequestException(
            errorResponse(
              __('The email address already exists, Please try another'),
            ),
          );
        }
      }

      let avatarFile: FileObject;
      const file = await payload.avatarFile;
      if (file) {
        avatarFile = await this.fileService.upload(file, `staff-${staff.id}`, [
          FILE_TYPE_IMAGE,
        ]);
        if (!avatarFile.url) throw new Error(errorResponse().message);
        payload.avatar = avatarFile.url;
      }
      delete payload['avatarFile'];
      await prisma_client.staff.update({
        where: {
          id: staff.id,
        },
        data: payload,
      });
      if (file) await this.fileService.deleteFile(staff.avatar);
      return successResponse(__('Profile updated successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  async updateStaffPassword(payload: UpdatePasswordInput, staff) {
    const staffDetails = await prisma_client.staff.findUnique({
      where: {
        id: staff.id,
      },
    });
    try {
      const validatePassword = await compare(
        payload.oldPassword,
        staffDetails.password,
      );
      if (validatePassword) {
        const hashedPassword = await this.passwordService.hashPassword(
          payload.password,
        );
        const response = await prisma_client.staff.update({
          where: {
            id: staffDetails.id,
          },
          data: {
            password: hashedPassword,
          },
        });
        return response
          ? successResponse(__('Password updated successfully!'))
          : errorResponse(__('Password update failed.'));
      } else {
        return errorResponse(__('Incorrect old password!'));
      }
    } catch (e) {
      processException(e);
    }
  }

  async getStaffLists(
    paginate: PaginationArgs,
    filter?: StaffFilter,
    orderBy?: StaffOrder,
  ): Promise<StaffConnection> {
    return findManyCursorConnection<
      Staff,
      Pick<Prisma.StaffWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.staff.findMany({
          where: {
            roleId: {
              not: null,
            },
            OR: filter.query
              ? [
                  {
                    name: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
                    username: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
                    email: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
                  },
                ]
              : undefined,
          },
          include: {
            role: true,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.staff.count({
          where: {
            roleId: {
              not: null,
            },
            OR: filter.query
              ? [
                  {
                    name: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
                    username: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
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

  async getStaffByID(id: number): Promise<Staff> {
    return await prisma_client.staff.findUnique({
      where: {
        id: id,
      },
      include: {
        role: true,
      },
    });
  }

  async createStaff(payload: StaffCreateInput): Promise<ResponseModel> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );

    try {
      const staff = await prisma_client.staff.create({
        data: {
          ...payload,
          phone: payload.phone || null,
          password: hashedPassword,
        },
      });
      return staff
        ? successResponse(__('Staff created sucessfully.'))
        : errorResponse(__('Staff create failed.'));
    } catch (e) {
      processException(e);
    }
  }

  async updateStaff(id, payload: StaffUpdateInput): Promise<ResponseModel> {
    try {
      const staff = await prisma_client.staff.update({
        where: {
          id: id,
        },
        data: {
          ...payload,
          phone: payload.phone || null,
        },
      });
      return staff
        ? successResponse('Staff updated successfully!')
        : errorResponse('Staff update failed.');
    } catch (e) {
      processException(e);
    }
  }

  async deleteStaff(satff, id): Promise<ResponseModel> {
    try {
      if (satff.id == id) {
        throw new BadRequestException(
          errorResponse("You can't delete yourself"),
        );
      }
      const staff = await prisma_client.staff.delete({
        where: {
          id: id,
        },
      });
      return staff
        ? successResponse('Staff updated successfully!')
        : errorResponse('Staff update failed.');
    } catch (e) {
      processException(e);
    }
  }
}
