import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WarehouseSimulatorService } from './warehouse-simulator.service.js';

function parseOptionalPositiveInteger(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new BadRequestException(`${field} must be a positive integer`);
  }

  return value;
}

@Controller('warehouse-simulator')
export class WarehouseSimulatorController {
  constructor(private readonly warehouseSimulatorService: WarehouseSimulatorService) {}

  @Get('status')
  getStatus() {
    return this.warehouseSimulatorService.getStatus();
  }

  @Get('logs')
  getLogs(@Query('limit') limit?: string) {
    if (limit === undefined) {
      return this.warehouseSimulatorService.getLogs();
    }

    const parsed = Number.parseInt(limit, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('limit must be a positive integer');
    }

    return this.warehouseSimulatorService.getLogs(parsed);
  }

  @Post('start')
  start(
    @Body()
    body: {
      intervalMs?: unknown;
    } = {},
  ) {
    const intervalMs = parseOptionalPositiveInteger(body.intervalMs, 'intervalMs');
    return this.warehouseSimulatorService.start(intervalMs);
  }

  @Post('stop')
  stop() {
    return this.warehouseSimulatorService.stop();
  }

  @Post('tick')
  tick() {
    return this.warehouseSimulatorService.tick();
  }
}
