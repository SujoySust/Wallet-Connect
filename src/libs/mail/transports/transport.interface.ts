import { SmtpConfig } from '../../../configs/config.interface';
import { Options as MailOptions } from 'nodemailer/lib/mailer';

export interface TransportInterface {
  send(message: MailOptions, config: SmtpConfig);
}
