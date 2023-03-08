import { Console } from 'console';
import * as fs from 'fs';
import { basename } from 'path';

export const newConsole = new Console(process.stdout);

let logChannel: string;
let logStdout: NodeJS.WriteStream & { fd: 1 };

export const LOG_CHANNEL_SINGLE = 'single';
export const LOG_CHANNEL_DAILY = 'daily';

export const LOG_LEVEL_DEBUG = 'debug';
export const LOG_LEVEL_ERROR = 'error';
export const LOG_LEVEL_WARN = 'warn';

export const LOG_FILE_STREAM = 'file';
export const LOG_STDOUT_STREAM = 'stdout';
export const LOG_BOTH_STREAM = 'file_stdout';

export class MyLogger {
  constructor(private logFile?: string) {}

  write(msg: string, level?: string) {
    console.log(msg, level, this.logFile || 'debug.log', undefined, 4);
  }
}

export async function logger() {
  try {
    logChannel = LOG_CHANNEL_SINGLE;
    if (process.env.LOG_CHANNEL === LOG_CHANNEL_DAILY)
      logChannel = LOG_CHANNEL_DAILY;

    logStdout = process.stdout;

    //usage console.log('hello log', LOG_LEVEL_DEBUG, 'debug.log', LOG_STREAM_FILE)
    console.log = log;

    console.error = error;

    console.warn = warn;
  } catch (error) {
    logCatch(error.toString());
  }
}

// eslint-disable-next-line prettier/prettier

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function warn(message: string, ...optionalParams: any[]) {
  try {
    log(
      optionalParams[0] || message || '',
      LOG_LEVEL_WARN,
      undefined,
      undefined,
      2,
    );
  } catch (error) {
    newConsole.error(optionalParams[0]);
    logCatch(error.stack);
  }
}
// eslint-disable-next-line prettier/prettier

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function error(message: string, ...optionalParams: any[]) {
  try {
    // newConsole.log(optionalParams);
    // newConsole.log(message);
    log(
      optionalParams[0] || message || '',
      LOG_LEVEL_ERROR,
      undefined,
      undefined,
      2,
    );
  } catch (error) {
    newConsole.error(optionalParams[0]);
    logCatch(error.stack);
  }
}

// eslint-disable-next-line prettier/prettier

async function log(
  message: string,
  level = LOG_LEVEL_DEBUG,
  logFile = 'debug.log',
  writeStream = process.env.APP_DEBUG === 'true'
    ? LOG_BOTH_STREAM
    : LOG_FILE_STREAM,
  ...optionalParams: any[]
) {
  try {
    //finding file name and line
    const i = optionalParams[0] || 3;
    const fileNline = basename(
      new Error().stack.split('\n')[i] /* .split('(')[1] */,
    ).split(':');
    const fileInfo = `${fileNline[0]}:${fileNline[1]}`;
    //

    if (typeof message !== 'string') {
      if (process.env.APP_DEBUG == 'true' && process.env.APP_ENV == 'local')
        newConsole.log(message);
      else
        newConsole.error(
          `${fileInfo}-> you are trying to write an object in log. Please remove.`,
        );
      return;
    }

    if (logChannel === LOG_CHANNEL_DAILY && logFile === 'debug.log') {
      logFile = `${new Date().toISOString().split('T')[0]}_${logFile}`;
    }

    // fs.writeFileSync('./storage/logs/debug.log', `\n`, {
    //   flag: 'a',
    // });

    const logFilePath = `./storage/logs/${logFile}`;

    if (writeStream == LOG_STDOUT_STREAM) {
      logStdout.write(message);
      logStdout.write('\n');
      return;
    }
    if (skipMessages(message)) return;
    if (skipLevels(level)) return;

    const logObj = {
      id: +new Date() /*current timestamp number*/,
      time: new Date(),
      level: level,
      fileInfo: fileInfo,
      message: message,
    };

    if (writeStream === LOG_STDOUT_STREAM) {
      logStdout.write(message + '\n');
    } else if (writeStream === LOG_FILE_STREAM) {
      fs.writeFileSync(logFilePath, JSON.stringify(logObj) + ',\n', {
        flag: 'a',
      });
    } else {
      fs.writeFileSync(logFilePath, JSON.stringify(logObj) + ',\n', {
        flag: 'a',
      });
      logStdout.write(message + '\n');
    }
  } catch (error) {
    newConsole.error(message);
    logCatch(error.stack);
  }
}

function logCatch(message: any) {
  try {
    let logFile = 'debug.log';
    if (logChannel === LOG_CHANNEL_DAILY) {
      logFile = `${new Date().toISOString().split('T')[0]}_${logFile}`;
    }
    const logFilePath = `./storage/logs/${logFile}`;
    const log = {
      id: +new Date() /*current timestamp number*/,
      time: new Date(),
      level: LOG_LEVEL_ERROR,
      fileInfo: `${basename(__filename)}:logCatch`,
      message: message,
    };
    fs.writeFileSync(logFilePath, JSON.stringify(log) + ',\n', { flag: 'a' });
  } catch (e) {
    newConsole.error(e.stack);
  }
}

function skipMessages(message: string): boolean {
  if (
    message.search(
      /\[session-file-store] will retry, error on last attempt: Error: ENOENT: no such file or directory, open/,
    ) >= 0
  ) {
    return true;
  } else if (
    message.search(/\[session-file-store] Deleting expired sessions/) >= 0
  ) {
    return true;
  } else if (message.search(/Did you forget to use `express-session`/) >= 0) {
    return true;
  }
  return false;
}

function skipLevels(level: string): boolean {
  if (
    level == 'NestFactory' ||
    level == 'InstanceLoader' ||
    level == 'RoutesResolver' ||
    level == 'RouterExplorer'
  ) {
    return true;
  }
  return false;
}
