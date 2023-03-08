import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { prisma_client } from 'src/app/helpers/functions';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor() {
    super();
  }

  serializeUser(user: any, done: (error: Error, user: any) => void) {
    done(null, { id: user.id });
  }

  async deserializeUser(payload: any, done: (error: Error, user: any) => void) {
    const user = await prisma_client.staff.findUnique({
      where: { id: payload.id },
    });
    done(null, user);
  }
}
