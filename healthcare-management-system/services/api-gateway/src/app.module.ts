import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'admin'),
        password: configService.get('DATABASE_PASSWORD', 'password'),
        database: configService.get('DATABASE_NAME', 'healthcare_dev'),
        schema: 'healthcare',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations instead
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
