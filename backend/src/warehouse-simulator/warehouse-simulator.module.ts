import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SensorDataModule } from '../sensor-data/sensor-data.module.js';
import { WarehouseSimulatorController } from './warehouse-simulator.controller.js';
import { WarehouseSimulatorService } from './warehouse-simulator.service.js';

@Module({
  imports: [PrismaModule, SensorDataModule],
  controllers: [WarehouseSimulatorController],
  providers: [WarehouseSimulatorService],
  exports: [WarehouseSimulatorService],
})
export class WarehouseSimulatorModule {}
