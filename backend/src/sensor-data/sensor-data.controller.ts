import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { SensorDataService } from './sensor-data.service.js';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

const parseLimitParam = (value: string | undefined, name = 'limit'): number => {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new BadRequestException(`${name} must be a positive integer`);
  }
  return Math.min(parsed, MAX_LIMIT);
};

const parseOffsetParam = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new BadRequestException('offset must be a non-negative integer');
  }
  return parsed;
};

const parseDateParam = (value: string, name: string): Date => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${name} must be a valid ISO timestamp`);
  }
  return parsed;
};

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
    return this.sensorDataService.findAll({
      componentId,
      topic,
      limit: parseLimitParam(limit),
      offset: parseOffsetParam(offset),
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
   * GET /api/sensor-data/range
   * Returns readings between from and to (inclusive), ordered ascending.
   */
  @Get('range')
  findByRange(@Query('from') from?: string, @Query('to') to?: string) {
    if (!from || !to) {
      throw new BadRequestException('from and to query params are required');
    }
    const parsedFrom = parseDateParam(from, 'from');
    const parsedTo = parseDateParam(to, 'to');
    if (parsedFrom > parsedTo) {
      throw new BadRequestException('from must be earlier than or equal to to');
    }
    return this.sensorDataService.findByRange(parsedFrom, parsedTo);
  }

  /**
   * GET /api/sensor-data/stats/:componentId
   * Returns entry count, first and last timestamps, and optional numeric stats.
   */
  @Get('stats/:componentId')
  findStats(@Param('componentId') componentId: string) {
    return this.sensorDataService.getStats(componentId);
  }

  /**
   * GET /api/sensor-data/activity/:componentId
   * Query: interval=minute|hour
   */
  @Get('activity/:componentId')
  findActivity(
    @Param('componentId') componentId: string,
    @Query('interval') interval?: string,
  ) {
    if (interval !== 'minute' && interval !== 'hour') {
      throw new BadRequestException('interval must be one of: minute, hour');
    }
    return this.sensorDataService.getActivity(componentId, interval);
  }

  /**
   * GET /api/sensor-data/:componentId
   * Returns readings for the given component.
   */
  @Get(':componentId')
  findByComponent(
    @Param('componentId') componentId: string,
    @Query('limit') limit?: string,
    @Query('since') since?: string,
  ) {
    const parsedSince = since ? parseDateParam(since, 'since') : undefined;
    return this.sensorDataService.findByComponentId(
      componentId,
      parseLimitParam(limit),
      parsedSince,
    );
  }
}
