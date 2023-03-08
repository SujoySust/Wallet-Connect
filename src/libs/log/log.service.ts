import * as winston from 'winston';
import * as chalk from 'chalk';
import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class LogService {
  private readonly logger: Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          dirname: 'logs',
          filename: 'app.dev.log',
        }),
      ],
    });
  }

  getLogger() {
    return this.logger;
  }

  log(message: string): void {
    const currentDate = new Date();
    this.logger.info(message, {
      timestamp: currentDate.toISOString(),
    });
    LogService.formatedLog('info', message);
  }

  error(message: string, trace?: any): void {
    const currentDate = new Date();
    // i think the trace should be JSON Stringified
    this.logger.error(`${message} -> (${trace || 'trace not provided !'})`, {
      timestamp: currentDate.toISOString(),
    });
    LogService.formatedLog('error', message, trace);
  }

  warn(message: string): void {
    const currentDate = new Date();
    this.logger.warn(message, {
      timestamp: currentDate.toISOString(),
    });
    LogService.formatedLog('warn', message);
  }

  // this method just for printing a cool log in your terminal , using chalk
  private static formatedLog(level: string, message: string, error?): void {
    let result = '';
    const color = chalk;
    const currentDate = new Date(Date.now());
    const time = `${currentDate.toLocaleTimeString()}`;

    switch (level) {
      case 'info':
        result = `[${color.blue(
          'INFO',
        )}] - ${currentDate.toLocaleDateString()} - ${color.dim.yellow.bold.underline(
          time,
        )} - [${color.green('Custom-Log')}] - ${message}`;
        break;
      case 'error':
        result = `[${color.red(
          'ERR',
        )}] - ${currentDate.toLocaleDateString()} -  ${color.dim.yellow.bold.underline(
          time,
        )} - [${color.red('Custom-Log')}]- ${message}`;
        break;
      case 'warn':
        result = `[${color.yellow(
          'WARN',
        )}] - ${currentDate.toLocaleDateString()} - ${color.dim.yellow.bold.underline(
          time,
        )} - [${color.yellow('Custom-Log')}] - ${message}`;
        break;
      default:
        break;
    }
    console.log(result);
  }
}
