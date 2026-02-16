import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const allowedOrigins =
    config
      .get<string>('FRONTEND_URLS')
      ?.split(',')
      .map((url) => url.trim()) || [];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV == 'production',
    }),
  );

  // Fix cookie SameSite for cross-domain auth
  app.use((req, res, next) => {
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = (name: string, value: unknown) => {
      if (name.toLowerCase() === 'set-cookie' && typeof value === 'string') {
        // Force SameSite=None and Secure for better-auth cookies
        let cookie = value;
        if (cookie.includes('better-auth') && !cookie.includes('SameSite=None')) {
          cookie = cookie.replace(/SameSite=Lax/i, 'SameSite=None');
          if (!cookie.includes('Secure')) {
            cookie += '; Secure';
          }
        }
        return originalSetHeader(name, cookie);
      }
      return originalSetHeader(name, value);
    };
    next();
  });

  const port =
    parseInt(config.get('NEST_PORT') as string, 10) ||
    (process.env.PORT as unknown as number);
  await app.listen(port, () => logger.log(`App started at port: ${port}`));
}
bootstrap()
  .then(() => console.log(`Server started`))
  .catch((err) => console.error(err));
