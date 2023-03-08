import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolePermissionGuard extends AuthGuard('jwt') {
  permission: string;
  constructor(permission: string) {
    super();
    this.permission = permission;
  }
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  handleRequest(err, userInfo, info) {
    // You can throw an exception based on either "info" or "err" arguments
    const { user } = userInfo;
    if (err || !user) {
      throw err || new UnauthorizedException();
    } else {
      if (user.role === null) {
        return user;
      } else {
        const permissions = user.role?.permissions;
        const permissionArr = permissions?.split(',');
        if (permissionArr?.indexOf(this.permission) >= 0) {
          return user;
        }
        throw new UnauthorizedException();
      }
    }
  }
}
