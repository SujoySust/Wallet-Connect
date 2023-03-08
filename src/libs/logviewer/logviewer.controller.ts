import {
  Controller,
  Get,
  Render,
  Query,
  Res,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { LogviewerService } from './logviewer.service';
import * as glob from 'glob';
import { basename } from 'path';
import * as hbs from 'hbs';
import { __ } from '../../app/helpers/functions';
import {
  AuthenticatedGuard,
  AuthGuardFilter,
} from './auth/authenticated.guard';
import { SkipThrottle } from '@nestjs/throttler';

hbs.registerHelper('__', function (key: string) {
  return __(key);
});
hbs.registerHelper('trans', function (key: string) {
  return __(key);
});
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});
// hbs.registerPartial('pp', 'partial value');

@UseGuards(AuthenticatedGuard)
@UseFilters(AuthGuardFilter)
@SkipThrottle()
@Controller('logs')
export class LogviewerController {
  constructor(private readonly logviewerService: LogviewerService) {}

  @Get()
  @Render('logviewer')
  getLogs(@Query('file') file: string) {
    const logFiles = glob.sync('./storage/logs/*.log');
    logFiles.forEach((value, index, logFiles) => {
      logFiles[index] = basename(value);
    });
    logFiles.sort();
    logFiles.reverse();
    if (!file) {
      return { logs: [], fileList: logFiles, file: '' };
    }
    return {
      logs: this.logviewerService.getLogs(file),
      fileList: logFiles,
      file: file,
    };
  }

  @Get('clean-file')
  cleanFile(@Query('file') file: string, @Res() res) {
    if (!file) return res.redirect('/logs');
    this.logviewerService.cleanFile(file);
    return res.redirect('/logs?file=' + file);
  }

  @Get('delete-file')
  deleteFile(@Query('file') file: string, @Res() res) {
    if (!file) return res.redirect('/logs');
    this.logviewerService.deleteFile(file);
    return res.redirect('/logs');
  }
}
