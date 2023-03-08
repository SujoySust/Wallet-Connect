import {
  ArgumentsHost,
  CanActivate,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    return req.isAuthenticated();
  }
}

@Catch(ForbiddenException)
export class AuthGuardFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).redirect(`/auth/login?redirect=${req.route.path}`);
  }
}

export class UnAuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    return !req.isAuthenticated();
  }
}

@Catch(ForbiddenException)
export class NoAuthGuardFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).redirect('/logs');
  }
}
