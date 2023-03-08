import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthServiceInterface } from '../../../../libs/auth/interfaces/auth.service.interface';
import { JwtHelper } from '../../../../libs/auth/jwt.helper';
import { PasswordService } from '../../../../libs/auth/password.service';
import { Token } from '../../../../libs/auth/models/token.model';
import { Staff } from '../staff.model';
import { ResetPasswordInput } from '../../../../libs/auth/dto/reset-password.input';
import { NotificationService } from '../../../../libs/notification/notification.service';
import {
  errorResponse,
  getRandomNumber,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { StaffForgotPasswordNotification } from 'src/app/notifications/staffMailverification.notification';

@Injectable()
export class StaffAuthService implements AuthServiceInterface {
  constructor(
    private readonly jwtHelper: JwtHelper,
    private readonly passwordService: PasswordService,
    private readonly notificationService: NotificationService,
  ) {}

  async login({ username, password }): Promise<Token> {
    const staff = await prisma_client.staff.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email: username,
          },
        ],
      },
    });

    if (!staff) {
      throw new BadRequestException(errorResponse(__('No staff found!')));
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      staff.password,
    );

    if (!passwordValid) {
      throw new BadRequestException(errorResponse(__('Invalid password!')));
    }

    return this.jwtHelper.generateToken({ authIdentifier: staff.id }, 'staff');
  }

  async sendStaffForgetPasswordNotification(payload): Promise<ResponseModel> {
    try {
      const staff = await prisma_client.staff.findUnique({
        where: payload,
      });
      if (!staff) {
        throw new BadRequestException(errorResponse(__('No staff found!')));
      }
      const reset_code = getRandomNumber(6).toString();
      const data = {
        verification_code: reset_code,
      };
      await prisma_client.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          resetCode: reset_code,
        },
      });
      this.notificationService.send(
        new StaffForgotPasswordNotification(data),
        staff,
      );
      return successResponse('Forget password mail sent successfully!');
    } catch (e) {
      processException(e);
    }
  }

  async resetStaffPassword(
    payload: ResetPasswordInput,
  ): Promise<ResponseModel> {
    try {
      const staff = await prisma_client.staff.findFirst({
        where: {
          AND: {
            email: payload.email,
            resetCode: payload.code,
          },
        },
      });
      if (!staff) {
        throw new BadRequestException(errorResponse(__('No staff found!')));
      }
      const hashedPassword = await this.passwordService.hashPassword(
        payload.password,
      );
      await prisma_client.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          password: hashedPassword,
          resetCode: null,
        },
      });
      return successResponse('Password changed successfully!');
    } catch (e) {
      processException(e);
    }
  }

  getUserByIdentifier(authIdentifier): Promise<Staff> {
    return prisma_client.staff.findUnique({
      where: { id: authIdentifier },
      include: { role: true },
    });
  }

  getUserFromToken(token: string): Promise<Staff> {
    const { authIdentifier } = this.jwtHelper.authIdentifierFromToken(token);
    return prisma_client.staff.findUnique({ where: { id: authIdentifier } });
  }

  refreshToken(token: string): Token {
    return this.jwtHelper.refreshToken(token);
  }
}
