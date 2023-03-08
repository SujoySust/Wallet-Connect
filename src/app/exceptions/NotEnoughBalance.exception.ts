import { HttpException, HttpStatus } from '@nestjs/common';

export class NotEnoughBalanceException extends HttpException {
  constructor(objectOrError?: string | any, description = 'NotEnoughBalance') {
    super(
      HttpException.createBody(
        objectOrError ?? 'Not enough balance',
        description,
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
