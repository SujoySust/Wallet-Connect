import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphqlConfig } from './configs/config.interface';
import { PrismaModule } from 'nestjs-prisma';
import { DateScalar } from './libs/graphql/scalars/date.scalar';
import { FilesystemModule } from './app/filesystem/filesystem.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, resolve } from 'path';
import { BullModule } from '@nestjs/bull';
import { QueueOptions } from 'bull';
import { NotificationModule } from './libs/notification/notification.module';
import { MailModule } from './libs/mail/mail.module';

import { NestConfig } from './configs/nest.config';
import { CorsConfig } from './configs/cors.config';
import { GraphQLConfig } from './configs/graphql.config';
import { JWTConfig } from './configs/security.config';
import { QueueConfig } from './configs/queue.config';
import { FilesystemConfig } from './configs/filesystem.config';
import { MailConfig } from './configs/mail.config';
import { AppConfig } from './configs/app.config';
import { ServicesConfig } from './configs/services.config';

import { CacheModule } from './libs/cache/cache.module';
import { LogModule } from './libs/log/log.module';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { CacheConfig } from './configs/cache.config';
import { AuthConfig } from './configs/auth.config';
import { AppModule } from './app/app.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './libs/prisma/prisma.service';
import { LocalizationModule } from '@squareboat/nestjs-localization/dist/src';
import { localization } from './app/middlewares/localization.middleware';
import { AppAuthMiddleware } from './app/middlewares/app-authentication.middleware';
import { LogviewerModule } from './libs/logviewer/logviewer.module';
import { LogAuthModule } from './libs/logviewer/auth/auth.module';
import { DecimalScalar } from './libs/graphql/scalars/decimal.scalar';
import { CornJobs } from './app/cron-jobs/cron-jobs.service';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Global()
@Module({
  imports: [
    // Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        NestConfig,
        CorsConfig,
        AppConfig,
        GraphQLConfig,
        AuthConfig,
        JWTConfig,
        QueueConfig,
        FilesystemConfig,
        MailConfig,
        CacheConfig,
        ServicesConfig,
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve('public'),
      exclude: ['/graphql*'],
    }),
    LocalizationModule.register({
      path: join(__dirname, '../..', 'resources/lang/'),
      fallbackLang: 'en',
    }),
    GraphQLModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const graphqlConfig = configService.get<GraphqlConfig>('graphql');
        return {
          installSubscriptionHandlers: true,
          introspection: graphqlConfig.introspection,
          buildSchemaOptions: {
            numberScalarMode: 'integer',
          },
          sortSchema: graphqlConfig.sortSchema,
          autoSchemaFile:
            graphqlConfig.schemaDestination || './src/schema.graphql',
          debug: graphqlConfig.debug,
          playground: graphqlConfig.playgroundEnabled,
          formatError: graphqlConfig.formatError,
          context: ({ req, res }) => ({ req, res }),
        };
      },
      inject: [ConfigService],
    }),
    FilesystemModule,
    CacheModule,
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return configService.get<QueueOptions>('queue');
      },
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot({
      ttl: 60,
      limit: Number(process.env.REQUEST_LIMIT_PER_MINUTE || 0) || 60,
      storage: new ThrottlerStorageRedisService({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USERNAME || '',
        password: process.env.REDIS_PASSWORD || '',
        db: Number(process.env.REDIS_DATABASE) || 0,
      }),
    }),
    ScheduleModule.forRoot(),
    LogModule,
    MailModule,
    NotificationModule,
    LogAuthModule,
    LogviewerModule,
    HttpModule,

    // Application Modules
    AppModule,
  ],
  controllers: [],
  providers: [DateScalar, PrismaService, CornJobs, DecimalScalar],
  exports: [PrismaService, HttpModule],
})
export class MainModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(localization).forRoutes('/');
    consumer.apply(AppAuthMiddleware).forRoutes('graphql');
  }
}
