import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde dispositivos móviles
  app.enableCors({
    origin: true, // En desarrollo permite todos los orígenes
    credentials: true,
  });

  // Activar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Health Game API')
    .setDescription('Documentación de la API para supervivientes pediátricos')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Este es el nombre de la referencia
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces de red
  
  console.log(`Server running on:`);
  console.log(`   - Local:   http://localhost:${port}`);
  console.log(`   - Network: http://192.168.0.27:${port}`);
  console.log(`   - Swagger: http://192.168.0.27:${port}/api`);
}
bootstrap();