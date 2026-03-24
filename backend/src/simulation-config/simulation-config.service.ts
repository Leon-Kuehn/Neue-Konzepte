import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { DEFAULT_SIMULATION_SEEDS } from './default-simulations.js';

type SimulationPayload = {
  id: string;
  name: string;
  description?: string;
  repeat?: number;
  steps: unknown;
};

@Injectable()
export class SimulationConfigService {
  private tableEnsured = false;
  private defaultsSeeded = false;

  constructor(private readonly prisma: PrismaService) {}

  private async ensureTableExists(): Promise<void> {
    if (this.tableEnsured) {
      await this.seedDefaults();
      return;
    }

    await this.prisma.db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS simulation_definitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        repeat INTEGER,
        steps JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    this.tableEnsured = true;
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    if (this.defaultsSeeded) {
      return;
    }

    for (const seed of DEFAULT_SIMULATION_SEEDS) {
      const existing = await this.prisma.simulationDefinition.findUnique({
        where: { id: seed.id },
        select: { id: true },
      });

      if (existing) {
        continue;
      }

      await this.prisma.simulationDefinition.create({
        data: {
          id: seed.id,
          name: seed.name,
          description: seed.description,
          repeat: seed.repeat,
          steps: this.normalizeSteps(seed.steps),
        },
      });
    }

    this.defaultsSeeded = true;
  }

  private normalizeSteps(steps: unknown): Prisma.InputJsonValue {
    if (steps === undefined || steps === null) {
      return [];
    }

    if (typeof steps === 'object') {
      return steps as Prisma.InputJsonValue;
    }

    return [];
  }

  async findAll() {
    await this.ensureTableExists();

    return this.prisma.simulationDefinition.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string) {
    await this.ensureTableExists();

    return this.prisma.simulationDefinition.findUnique({ where: { id } });
  }

  async create(payload: SimulationPayload) {
    await this.ensureTableExists();

    return this.prisma.simulationDefinition.create({
      data: {
        id: payload.id,
        name: payload.name,
        description: payload.description,
        repeat: payload.repeat,
        steps: this.normalizeSteps(payload.steps),
      },
    });
  }

  async update(id: string, payload: Omit<SimulationPayload, 'id'>) {
    await this.ensureTableExists();

    return this.prisma.simulationDefinition.upsert({
      where: { id },
      update: {
        name: payload.name,
        description: payload.description,
        repeat: payload.repeat,
        steps: this.normalizeSteps(payload.steps),
      },
      create: {
        id,
        name: payload.name,
        description: payload.description,
        repeat: payload.repeat,
        steps: this.normalizeSteps(payload.steps),
      },
    });
  }

  async remove(id: string) {
    await this.ensureTableExists();

    try {
      await this.prisma.simulationDefinition.delete({ where: { id } });
      return { deleted: true };
    } catch {
      return { deleted: false };
    }
  }
}
