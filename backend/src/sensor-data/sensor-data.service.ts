import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type ActivityInterval = 'minute' | 'hour';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;
const RANGE_LIMIT = 5000;
const STATS_SAMPLE_LIMIT = 5000;

const clampLimit = (limit: number, max = MAX_LIMIT): number =>
  Math.min(Math.max(limit, 1), max);

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
  bucket.setUTCSeconds(0, 0);
  if (interval === 'hour') {
    bucket.setUTCMinutes(0, 0, 0);
  }
  return bucket.toISOString();
};

@Injectable()
export class SensorDataService {
  constructor(private readonly prisma: PrismaService) {}

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
