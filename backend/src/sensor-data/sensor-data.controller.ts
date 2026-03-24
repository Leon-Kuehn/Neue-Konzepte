import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Param,
  Query,
} from '@nestjs/common';
import { DEFAULT_LIMIT, MAX_LIMIT } from './sensor-data.constants.js';
import { SensorDataService } from './sensor-data.service.js';

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
   * POST /api/sensor-data/ingest
   * Direct ingest path for simulator or other non-MQTT producers.
   */
  @Post('ingest')
  ingest(
    @Body()
    body: {
      topic?: unknown;
      payload?: unknown;
      componentId?: unknown;
      receivedAt?: unknown;
    },
  ) {
    if (typeof body.topic !== 'string' || body.topic.trim().length === 0) {
      throw new BadRequestException('topic must be a non-empty string');
    }

    if (body.componentId !== undefined && typeof body.componentId !== 'string') {
      throw new BadRequestException('componentId must be a string when provided');
    }

    let parsedReceivedAt: Date | undefined;
    if (body.receivedAt !== undefined) {
      if (typeof body.receivedAt !== 'string') {
        throw new BadRequestException('receivedAt must be an ISO timestamp string');
      }
      parsedReceivedAt = parseDateParam(body.receivedAt, 'receivedAt');
    }

    return this.sensorDataService.ingest({
      topic: body.topic,
      payload: body.payload,
      componentId: body.componentId,
      receivedAt: parsedReceivedAt,
    });
  }

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
