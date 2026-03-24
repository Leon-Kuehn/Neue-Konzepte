import { Module } from '@nestjs/common';
import { SensorDataModule } from '../sensor-data/sensor-data.module.js';
import { MqttService } from './mqtt.service.js';

@Module({
  imports: [SensorDataModule],
  providers: [MqttService],
})
export class MqttModule {}
