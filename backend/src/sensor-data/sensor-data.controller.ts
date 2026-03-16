import { Controller, Get, Param, Query } from '@nestjs/common';
import { SensorDataService } from './sensor-data.service.js';

@Controller('sensor-data')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  /**
   * GET /api/sensor-data
   * Optional query params: componentId, topic, limit, offset
   */
  @Get()
  findAll(
    @Query('componentId') componentId?: string,
    @Query('topic') topic?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit !== undefined ? parseInt(limit, 10) : undefined;
    const parsedOffset =
      offset !== undefined ? parseInt(offset, 10) : undefined;

    return this.sensorDataService.findAll({
      componentId,
      topic,
      limit:
        parsedLimit !== undefined && !isNaN(parsedLimit)
          ? parsedLimit
          : undefined,
      offset:
        parsedOffset !== undefined && !isNaN(parsedOffset)
          ? parsedOffset
          : undefined,
    });
  }

  /**
   * GET /api/sensor-data/latest
   * Returns the most recent reading per componentId.
   */
  @Get('latest')
  findLatest() {
    return this.sensorDataService.findLatestPerComponent();
  }

  /**
   * GET /api/sensor-data/:componentId
   * Returns the last 50 readings for the given component.
   */
  @Get(':componentId')
  findByComponent(
    @Param('componentId') componentId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit !== undefined ? parseInt(limit, 10) : undefined;
    return this.sensorDataService.findByComponentId(
      componentId,
      parsedLimit !== undefined && !isNaN(parsedLimit) ? parsedLimit : undefined,
    );
  }
}
