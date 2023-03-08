import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { __, errorResponse } from '../../../app/helpers/functions';
import { compare } from 'bcryptjs';
import { prisma_client } from 'src/app/helpers/functions';

@Injectable()
export class AuthService {
  async validateUser(username: string, password: string) {
    const user = await prisma_client.staff.findFirst({
      where: { email: username },
    });
    if (!user)
      throw new NotFoundException(errorResponse(__('User not found.')));
    if (!(await compare(password, user.password)))
      throw new BadRequestException(errorResponse(__('Wrong credentials.')));
    return user;
  }
}
