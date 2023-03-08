/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class LogviewerService {
  getLogs(file?: string) {
    const initFile = file;
    file = './storage/logs/' + file;
    let logs: object[];
    if (!fs.existsSync(file)) return logs;
    const logFile = file || 'debug.log';
    try {
      let logData = fs.readFileSync(logFile).toString();
      if (initFile == 'deploy.log') {
        try {
          JSON.parse(logData);
          logData = `[${logData}]`;
          logs = JSON.parse(logData);
        } catch (e) {
          logs = [];
          logs.push({ message: logData });
        }
      } else if (logData !== '') {
        logData = logData.slice(0, logData.length - 2);
        logData = `[${logData}]`;
        logs = JSON.parse(logData);
      }
    } catch (error) {
      fs.writeFileSync(logFile, '');
      console.error(error.stack);
    }
    return logs;
  }

  cleanFile(file: string) {
    file = './storage/logs/' + file;
    if (fs.existsSync(file)) fs.writeFileSync(file, '');
    return;
  }

  deleteFile(file: string) {
    file = './storage/logs/' + file;
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return;
  }
}
