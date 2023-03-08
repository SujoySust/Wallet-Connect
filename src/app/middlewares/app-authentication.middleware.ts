import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { __ } from '../helpers/functions';
import { Request, Response, NextFunction } from 'express';
import * as ip from 'ip';

@Injectable()
export class AppAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (checkConditions(req)) next();
    else
      throw new UnauthorizedException({
        success: false,
        message: __('Request from unauthorize source'),
        data: null,
      });
  }
}

function checkConditions(req: Request): boolean {
  const reqIp = req.ip.replace('::ffff:', '');
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  let allowedIps = [];
  if (process.env.ALLOWED_IPS) {
    allowedIps = process.env.ALLOWED_IPS.split(',');
  }
  allowedIps.push('::1');
  allowedIps.push('127.0.0.1');
  allowedIps.push(ip.address());

  return (
    process.env.APP_ENV != 'production' ||
    (req.header('api-key') ?? '') === process.env.API_APP_KEY ||
    allowedOrigins.includes(req.headers['origin']) ||
    allowedIps.includes(reqIp)
  );
}

//functional middleware
/* import { UnauthorizedException } from '@nestjs/common';
import { NextFunction } from 'express';
import { __ } from 'src/helpers';

export function appAuth(req: Request, next: NextFunction) {
  if (
    process.env.APP_DEBUG === 'true' ||
    req.headers['app_key'] === process.env.API_APP_KEY
  )
    next();
  else
    throw new UnauthorizedException({
      success: false,
      message: __('Request from unauthorize source'),
      data: null,
    });
} */
