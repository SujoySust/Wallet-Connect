/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SignupInput } from './dto/signup.input';
import { Token } from '../../../libs/auth/models/token.model';
import { ResetPasswordInput } from '../../../libs/auth/dto/reset-password.input';
import { AuthServiceInterface } from '../../../libs/auth/interfaces/auth.service.interface';
import { JwtHelper } from '../../../libs/auth/jwt.helper';
import { RegisterableAuthServiceInterface } from '../../../libs/auth/interfaces/registerable.interface';
import { PasswordResettableAuthServiceInterface } from '../../../libs/auth/interfaces/password.resettable.interface';
import { User } from '../../models/user.model';
import {
  checkAndGetAddress,
  checkUserStatus,
  errorResponse,
  getRandomNumber,
  processException,
  randomUsernameFromWalletAddress,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { WalletLoginMessage } from './dto/login.input';
import {
  LOGIN_MESSAGE,
  MODEL_TYPE_USER,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import { prisma_client } from 'src/app/helpers/functions';
import Web3 from 'web3';
const web3 = require('web3');

@Injectable()
export class UserAuthService
  implements
    AuthServiceInterface,
    RegisterableAuthServiceInterface,
    PasswordResettableAuthServiceInterface
{
  web3Handler: Web3;
  constructor(private readonly jwtHelper: JwtHelper) {
    this.web3Handler = new web3();
  }

  async register(payload: SignupInput): Promise<Token> {
    return this.jwtHelper.generateToken({ authIdentifier: 1 });
  }

  async login({ username, password }): Promise<Token> {
    return this.jwtHelper.generateToken({ authIdentifier: 1 });
  }

  async userVerifyMail(verification_code: string) {
    try {
      const user = await prisma_client.user.findFirst({
        where: {
          reset_code: verification_code,
        },
      });
      if (!user) {
        return errorResponse(__('Invalid verification code.'));
      }
      await prisma_client.user.update({
        where: {
          id: user.id,
        },
        data: {
          is_email_verified: STATUS_ACTIVE,
          email_verified_at: new Date(),
          reset_code: null,
        },
      });
      return successResponse(__('Email verified successfully.'));
    } catch (e) {
      processException(e);
    }
  }

  async getOrGenerateAccount(address: string): Promise<User> {
    try {
      if (!address)
        throw new BadRequestException(
          errorResponse(__("Address can't be empty.")),
        );

      address = checkAndGetAddress(this.web3Handler, address);
      if (!address)
        throw new BadRequestException(errorResponse(__('Invalid address')));

      let user = await prisma_client.user.findFirst({
        where: {
          wallet_address: {
            equals: address,
            mode: 'insensitive',
          },
        },
      });
      if (!user) {
        const username = randomUsernameFromWalletAddress(address);
        user = await prisma_client.user.create({
          data: {
            wallet_address: address,
            username: username,
          },
        });
      } else {
        checkUserStatus(user);
      }
      user['social_links'] = user
        ? await prisma_client.socialLinks.findFirst({
            where: {
              model_id: user.id,
              model_type: MODEL_TYPE_USER,
            },
          })
        : null;
      return user;
    } catch (e) {
      processException(e);
    }
  }

  async getAccount(addressOrUsername: string): Promise<User> {
    try {
      if (!addressOrUsername)
        throw new BadRequestException(
          errorResponse(__('Address or username must be provided.')),
        );
      let user = await prisma_client.user.findFirst({
        where: {
          OR: [
            {
              wallet_address: {
                equals: addressOrUsername,
                mode: 'insensitive',
              },
            },
            {
              username: addressOrUsername,
            },
          ],
        },
      });

      const address = checkAndGetAddress(this.web3Handler, addressOrUsername);
      if (!user && address) {
        const username = randomUsernameFromWalletAddress(address);
        user = await prisma_client.user.create({
          data: {
            wallet_address: address,
            username: username,
          },
        });
      } else if (!user) {
        throw new NotFoundException(errorResponse(__('No user found.')));
      } else {
        checkUserStatus(user);
      }
      user['social_links'] = user
        ? await prisma_client.socialLinks.findFirst({
            where: {
              model_id: user.id,
              model_type: MODEL_TYPE_USER,
            },
          })
        : null;
      return user;
    } catch (e) {
      processException(e);
    }
  }

  async generateLoginMessage(address: string): Promise<WalletLoginMessage> {
    try {
      if (!address)
        throw new BadRequestException(
          errorResponse(__("Address can't be empty.")),
        );
      address = checkAndGetAddress(this.web3Handler, address);
      if (!address)
        throw new BadRequestException(errorResponse(__('Invalid address.')));

      const nonce = getRandomNumber(6);
      const username = randomUsernameFromWalletAddress(address);
      const nonceData = await prisma_client.walletLoginNonce.create({
        data: {
          nonce: nonce,
          user: {
            connectOrCreate: {
              where: { wallet_address: address },
              create: { wallet_address: address, username: username },
            },
          },
        },
        include: {
          user: true,
        },
      });
      checkUserStatus(nonceData.user);
      const login_message = `${LOGIN_MESSAGE}\n Wallet Address: ${address}\n\n Nonce: ${nonce}`;
      return { nonce, login_message };
    } catch (e) {
      processException(e);
    }
  }

  async walletLogin({ address, signature, nonce }): Promise<Token> {
    try {
      const nonceExists = await prisma_client.walletLoginNonce.findFirst({
        where: {
          nonce: nonce,
          user: {
            wallet_address: {
              equals: address,
              mode: 'insensitive',
            },
          },
        },
        include: {
          user: true,
        },
      });
      if (!nonceExists)
        throw new BadRequestException(errorResponse(__('Invalid nonce')));

      checkUserStatus(nonceExists.user);

      const message = `${LOGIN_MESSAGE}\n Wallet Address: ${address}\n\n Nonce: ${nonce}`;
      const signer = this.web3Handler.eth.accounts.recover(message, signature);
      if (signer == address) {
        await prisma_client.walletLoginNonce.delete({
          where: {
            id: nonceExists.id,
          },
        });
        return this.jwtHelper.generateToken({
          authIdentifier: nonceExists.user_id,
        });
      } else {
        throw new BadRequestException(errorResponse(__('Invalid signature')));
      }
    } catch (e) {
      processException(e);
    }
  }

  getUserByIdentifier(authIdentifier): Promise<User> {
    return prisma_client.user.findUnique({ where: { id: authIdentifier } });
  }

  getUserFromToken(token: string): Promise<User> {
    const { authIdentifier } = this.jwtHelper.authIdentifierFromToken(token);
    return prisma_client.user.findUnique({ where: { id: authIdentifier } });
  }

  refreshToken(token: string): Token {
    return this.jwtHelper.refreshToken(token);
  }

  async sendForgetPasswordNotification(payload): Promise<boolean> {
    return false;
    /* try {
      const user = await prisma_client.user.findUnique({
        where: payload,
      });
      if (user) {
        const reset_code = getRandomNumber(6).toString();
        const data = {
          verification_code: reset_code,
        };
        await prisma_client.user.update({
          where: {
            id: user.id,
          },
          data: {
            resetCode: reset_code,
          },
        });
        // this.notificationService.send(
        //   new MailVerificationNotification(data),
        //   user,
        // );
        return true;
      } else {
        throw new NotFoundException('No User Found');
      }
    } catch (e) {
      throw new RuntimeException(e.message);
    } */
  }

  async resetPassword(payload: ResetPasswordInput): Promise<boolean> {
    return false;
    /* try {
      const user = await prisma_client.user.findFirst({
        where: {
          AND: {
            email: payload.email,
            resetCode: payload.code,
          },
        },
      });
      if (user) {
        const hashedPassword = await this.passwordService.hashPassword(
          payload.password,
        );
        await prisma_client.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedPassword,
            resetCode: null,
          },
        });
        return true;
      } else {
        throw new NotFoundException('Invalid code! Please try again');
      }
    } catch (e) {
      throw new RuntimeException(e.message);
    } */
  }
}
