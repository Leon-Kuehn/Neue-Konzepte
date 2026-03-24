import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  RANGE_LIMIT,
  STATS_SAMPLE_LIMIT,
} from './sensor-data.constants.js';

type ActivityInterval = 'minute' | 'hour';

type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

const clampLimit = (limit: number, max = MAX_LIMIT): number =>
  Math.min(Math.max(limit, 1), max);

const isJsonValue = (value: unknown): value is JsonValue => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isJsonValue);
  }
  return false;
};

const deriveComponentIdFromTopic = (topic: string): string => {
  const segments = topic.split('/').filter((segment) => segment.length > 0);
  if (segments.length === 0) {
    return 'unknown';
  }
  // plant/<componentId>/status should map to the real component id.
  if (segments[0] === 'plant' && segments.length >= 2) {
    return segments[1];
  }
  return segments[0];
};

const normalizePayloadToJson = (
  payload: unknown,
  parseJsonString = false,
): Prisma.InputJsonValue | Prisma.JsonNullValueInput => {
  const rawPayload =
    parseJsonString && typeof payload === 'string'
      ? (() => {
          try {
            return JSON.parse(payload) as unknown;
          } catch {
            return payload;
          }
        })()
      : payload;

  if (rawPayload === null) {
    return Prisma.JsonNull;
  }
  if (isJsonValue(rawPayload)) {
    return rawPayload;
  }
  return String(payload);
};

const extractNumericPayload = (payload: unknown): number | undefined => {
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return payload;
  }
  if (typeof payload === 'string') {
    const parsed = Number(payload);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (payload && typeof payload === 'object' && 'value' in payload) {
    const value = (payload as { value: unknown }).value;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
  }
  return undefined;
};

const bucketTimestamp = (date: Date, interval: ActivityInterval): string => {
  const bucket = new Date(date);
  if (interval === 'hour') {
    bucket.setUTCMinutes(0, 0, 0);
  } else {
    bucket.setUTCSeconds(0, 0);
  }
  return bucket.toISOString();
};

@Injectable()
export class SensorDataService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ingest one reading from MQTT or simulator and persist it. */
  ingest(params: {
    topic: string;
    payload: unknown;
    componentId?: string;
    receivedAt?: Date;
    parseJsonString?: boolean;
  }) {
    const componentId = params.componentId ?? deriveComponentIdFromTopic(params.topic);
    const payload = normalizePayloadToJson(
      params.payload,
      params.parseJsonString ?? false,
    );

    return this.prisma.sensorData.create({
      data: {
        componentId,
        topic: params.topic,
        payload,
        receivedAt: params.receivedAt ?? new Date(),
      },
    });
  }

  /** Return paginated sensor readings with optional filters. */
  findAll(params: {
    componentId?: string;
    topic?: string;
    limit?: number;
    offset?: number;
  }) {
    const { componentId, topic, limit = DEFAULT_LIMIT, offset = 0 } = params;

    const where: { componentId?: string; topic?: string } = {};
    if (componentId) where.componentId = componentId;
    if (topic) where.topic = topic;

    return this.prisma.sensorData.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      take: clampLimit(limit),
      skip: Math.max(offset, 0),
    });
  }

  /** Return the most recent reading for every distinct componentId. */
  async findLatestPerComponent() {
    const grouped = await this.prisma.sensorData.groupBy({
      by: ['componentId'],
      _max: { receivedAt: true },
    });

    const rows = await Promise.all(
      grouped.map((entry) =>
        this.prisma.sensorData.findFirst({
          where: {
            componentId: entry.componentId,
            ...(entry._max.receivedAt
              ? { receivedAt: entry._max.receivedAt }
              : {}),
          },
          orderBy: [{ receivedAt: 'desc' }, { id: 'desc' }],
        }),
      ),
    );

    return rows
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => a.componentId.localeCompare(b.componentId));
  }

  /** Return readings for a single component with optional since filter. */
  findByComponentId(componentId: string, limit = DEFAULT_LIMIT, since?: Date) {
    return this.prisma.sensorData.findMany({
      where: {
        componentId,
        ...(since ? { receivedAt: { gt: since } } : {}),
      },
      orderBy: { receivedAt: 'desc' },
      take: clampLimit(limit),
    });
  }

  /** Return readings in an inclusive time range. */
  findByRange(from: Date, to: Date) {
    return this.prisma.sensorData.findMany({
      where: {
        receivedAt: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { receivedAt: 'asc' },
      take: RANGE_LIMIT,
    });
  }

  /** Return count/first/last timestamps and optional numeric payload stats. */
  async getStats(componentId: string) {
    const aggregate = await this.prisma.sensorData.aggregate({
      where: { componentId },
      _count: { _all: true },
      _min: { receivedAt: true },
      _max: { receivedAt: true },
    });

    const base = {
      count: aggregate._count._all,
      firstTimestamp: aggregate._min.receivedAt,
      lastTimestamp: aggregate._max.receivedAt,
    };

    if (aggregate._count._all === 0) {
      return base;
    }

    const rows = await this.prisma.sensorData.findMany({
      where: { componentId },
      orderBy: { receivedAt: 'desc' },
      select: { payload: true },
      take: STATS_SAMPLE_LIMIT,
    });

    const numericValues = rows
      .map((row) => extractNumericPayload(row.payload))
      .filter((value): value is number => value !== undefined);

    if (numericValues.length === 0) {
      return base;
    }

    const sum = numericValues.reduce((acc, value) => acc + value, 0);
    return {
      ...base,
      averageValue: sum / numericValues.length,
      minValue: Math.min(...numericValues),
      maxValue: Math.max(...numericValues),
    };
  }

  /** Return activity counts bucketed by minute or hour. */
  async getActivity(componentId: string, interval: ActivityInterval) {
    const rows = await this.prisma.sensorData.findMany({
      where: { componentId },
      orderBy: { receivedAt: 'asc' },
      select: { receivedAt: true },
      take: RANGE_LIMIT,
    });

    const buckets = new Map<string, number>();
    for (const row of rows) {
      const key = bucketTimestamp(row.receivedAt, interval);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return [...buckets.entries()].map(([time, count]) => ({ time, count }));
  }
}
