import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { graphqlUploadExpress } from 'graphql-upload';
import { AppConfig, CorsConfig, NestConfig } from './configs/config.interface';
import { setApp } from './app/helpers/functions';
import { PrismaService } from './libs/prisma/prisma.service';
import { logger } from './libs/log/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as session from 'express-session';
import * as passport from 'passport';
import f = require('session-file-store');
import { Console } from 'console';
import { DEFAULT_MAX_FILES_AT_A_TIME } from './app/helpers/coreconstants';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './app/interceptors/sentry.interceptor';

async function bootstrap() {
  logger();
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    logger: console,
  });
  setApp(app);

  app.set('trust proxy', true);

  app.use(
    graphqlUploadExpress({
      /* maxFieldSize: MAX_FILE_SIZE_IN_BYTE,
      maxFileSize: MAX_FILE_SIZE_IN_BYTE, */
      maxFiles: DEFAULT_MAX_FILES_AT_A_TIME,
    }),
  );

  // Validation
  app.useGlobalPipes(new ValidationPipe());
  //

  //views
  app.setBaseViewsDir(join(__dirname, '../..', 'resources/views/'));
  app.setViewEngine('hbs');
  //

  //passport & session
  // app.set('trust proxy', 1); // trust first proxy
  const FileStore = f(session);

  app.use(
    session({
      store: new FileStore({ path: './storage/sessions' }),
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
      //cookie: { secure: true },
      cookie: {
        maxAge: 60 * 60 * 24 * 1000, //1 day
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  //

  // Prisma Client Exception Filter for unhandled exceptions
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  const configService = app.get(ConfigService);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const nestConfig = configService.get<NestConfig>('nest');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const corsConfig = configService.get<CorsConfig>('cors');

  const appConfig = configService.get<AppConfig>('app');

  // Cors
  if (corsConfig.enabled) {
    let origins: any = '*';
    if (
      process.env.APP_ENV == 'production' &&
      process.env.ALLOWED_ORIGINS != ''
    )
      origins = process.env.ALLOWED_ORIGINS.split(',');
    app.enableCors({
      origin: origins,
    });
  }
  //

  Sentry.init({
    dsn: appConfig.sentryDsn,
    // integrations: [new BrowserTracing()],
    // tracesSampleRate: 1.0,
  });

  app.useGlobalInterceptors(new SentryInterceptor(appConfig.env));

  const port = process.env.APP_PORT || nestConfig.port || 3000;
  await app.listen(port);
  console.log(`Server started at http://localhost:${port}`);
  if (process.env.APP_DEBUG !== 'true') {
    new Console(process.stdout).log(
      `Server started at http://localhost:${port}`,
    );
  }
}

bootstrap();
