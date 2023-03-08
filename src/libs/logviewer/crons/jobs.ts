import { Cron, CronExpression } from '@nestjs/schedule';
import * as shelljs from 'shelljs';

export class Crons {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearSessions() {
    try {
      shelljs.exec('cd storage/sessions && rm ./*.json > /dev/null 2>&1');
    } catch (e) {
      console.error(e.stack);
    }
  }
}
