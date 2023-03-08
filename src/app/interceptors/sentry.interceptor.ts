import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';
const errorsToTrackInSentry = [InternalServerErrorException, TypeError];
const enableSentry = (err) => {
  // const sendToSentry = errorsToTrackInSentry.some((errorType) => {
  //   console.log(typeof errorType);
  //   console.log(err instanceof errorType);
  //   return err instanceof errorType;
  // });
  // if (sendToSentry) Sentry.captureException(err);
  if (
    (err.hasOwnProperty('response') &&
      !err.response.hasOwnProperty('success') &&
      !err.response.hasOwnProperty('data')) ||
    !err.hasOwnProperty('response')
  ) {
    Sentry.captureException(err);
  }
  return throwError(() => err);
};
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private env) {
    this.env = env;
  }
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(catchError(enableSentry));
    // return next.handle().pipe(catchError((err) => throwError(() => err)));
  }
}
