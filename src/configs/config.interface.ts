import { FileTransportOptions } from 'winston/lib/winston/transports';
import { AuthenticatableInterface } from '../libs/auth/authenticatable.interface';
import { AuthServiceInterface } from '../libs/auth/interfaces/auth.service.interface';
import { Type } from '@nestjs/common';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface UiSection {
  title: string;
  description?: string;
}

export interface SectionSettings {
  category: UiSection;
  banner: UiSection;
}

export interface ContactSettings {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface AppConfig {
  timeZone: string;
  sentryDsn: string;
  env: string;
  name: string;
  port: string;
}

interface AuthProvider {
  model: AuthenticatableInterface;
  service: Type<AuthServiceInterface>;
}

export interface AuthConfig {
  default: string;
  providers: {
    [key: string]: AuthProvider;
  };
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  introspection: boolean;
  schemaDestination: string;
  sortSchema: boolean;
  formatError: (error: GraphQLError) => GraphQLFormattedError;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
}

export interface MailConfig {
  defaultMailer: string;
  mailers: {
    smtp: SmtpConfig;
    log: FileTransportOptions;
  };
  from: {
    address: string;
    name: string;
  };
}

export interface CacheConfigInterface {
  host: string;
  port: number | string;
  ttl: number;
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
  accessSecret: string;
  refreshSecret: string;
}
