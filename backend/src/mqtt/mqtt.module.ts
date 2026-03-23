import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service.js';

@Module({
  providers: [MqttService],
})
export class MqttModule {}
