import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
    const { componentId, topic, limit = 100, offset = 0 } = params;

    const where: { componentId?: string; topic?: string } = {};
    if (componentId) where.componentId = componentId;
    if (topic) where.topic = topic;

    return this.prisma.sensorData.findMany({
      where,
      orderBy: { receivedAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /** Return the latest reading for every distinct componentId. */
  findLatestPerComponent() {
    return this.prisma.sensorData.findMany({
      distinct: ['componentId'],
      orderBy: { receivedAt: 'desc' },
    });
  }

  /** Return all readings for a single component. */
  findByComponentId(componentId: string, limit = 50) {
    return this.prisma.sensorData.findMany({
      where: { componentId },
      orderBy: { receivedAt: 'desc' },
      take: limit,
    });
  }
}
