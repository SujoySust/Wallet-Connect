import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { errorResponse, isUser, __ } from '../helpers/functions';

@Injectable()
export class RoleUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    if (isUser(req.user)) {
      return true;
    } else {
      throw new UnauthorizedException(
        errorResponse(__('You can not access to this area')),
      );
    }
  }
}
