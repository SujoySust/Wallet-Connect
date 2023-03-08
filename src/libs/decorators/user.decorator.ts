import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().req.user,
);

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = GqlExecutionContext.create(ctx).getContext().req;
    return req.ip;
  },
);
