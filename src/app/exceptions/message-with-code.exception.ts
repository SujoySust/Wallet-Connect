import { HttpException, HttpStatus } from '@nestjs/common';

export class MessageWithCodeException extends HttpException {
  constructor(message: string, status: number) {
    super(message, status);
  }
}
