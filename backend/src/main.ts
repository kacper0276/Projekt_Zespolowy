import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Projekt zespołowy - Swagger')
    .setDescription('Swagger przygotowany dla testowania API')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory(), {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  app.use(cookieParser());

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
