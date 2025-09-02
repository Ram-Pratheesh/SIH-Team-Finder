import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for both local and Vercel frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',             // local dev frontend
      'https://teamfront-xi.vercel.app',   // deployed frontend on Vercel
    ],
    credentials: true, // keep this if you’re using cookies / auth headers
  });

  // ✅ Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw error on unknown props
      transform: true, // auto-transform payloads (e.g., string -> number)
    }),
  );

  await app.listen(3000);
}
bootstrap();
