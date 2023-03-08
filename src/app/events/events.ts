import { newConsole } from 'src/libs/log/logger.service';
import { web3Events } from './web3.events';

export async function events() {
  try {
    if (process.env.LISTEN_WEB3_EVENTS != 'false') web3Events();
  } catch (e) {
    newConsole.log(e);
  }
}
