import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SimulationConfigController } from './simulation-config.controller.js';
import { SimulationConfigService } from './simulation-config.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [SimulationConfigController],
  providers: [SimulationConfigService],
})
export class SimulationConfigModule {}
