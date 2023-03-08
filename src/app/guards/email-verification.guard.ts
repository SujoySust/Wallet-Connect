import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { MessageWithCodeException } from '../exceptions/message-with-code.exception';

@Injectable()
export class EmailVerificationGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    } else {
      if (user.user.isEmailVerified === true) {
        return user;
      } else {
        throw new MessageWithCodeException(
          'Email not verified! Please verify your email.',
          401,
        );
      }
    }
  }
}
