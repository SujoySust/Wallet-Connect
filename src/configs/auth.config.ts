import { registerAs } from '@nestjs/config';
import { AuthConfig as AuthConfigInterface } from './config.interface';
import { User } from '../app/models/user.model';
import { Staff } from '../app/modules/staff/staff.model';
import { UserAuthService } from '../app/modules/auth/user.auth.service';
import { StaffAuthService } from '../app/modules/staff/auth/staff.auth.service';

export const AuthConfig = registerAs(
  'auth',
  (): AuthConfigInterface => ({
    default: 'user',
    providers: {
      user: {
        model: User,
        service: UserAuthService,
      },
      staff: {
        model: Staff,
        service: StaffAuthService,
      },
    },
  }),
);
