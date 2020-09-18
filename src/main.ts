import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'reflect-metadata'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder()
        .setTitle('42stairs API')
        .setDescription('42stairs API description')
        .setVersion('1.0')
        .addTag('42stairs')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
  );
  await app.listen(3000);
}
bootstrap();
