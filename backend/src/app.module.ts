import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MqttModule } from './mqtt/mqtt.module.js';
import { SensorDataModule } from './sensor-data/sensor-data.module.js';

@Module({
  imports: [PrismaModule, MqttModule, SensorDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
