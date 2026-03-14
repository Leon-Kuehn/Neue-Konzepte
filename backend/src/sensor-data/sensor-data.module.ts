import { Module } from '@nestjs/common';
import { SensorDataController } from './sensor-data.controller.js';
import { SensorDataService } from './sensor-data.service.js';

@Module({
  controllers: [SensorDataController],
  providers: [SensorDataService],
})
export class SensorDataModule {}
