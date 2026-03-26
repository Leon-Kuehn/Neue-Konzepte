import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db: InstanceType<typeof PrismaClient>;

  constructor() {
    const adapter = new PrismaPg({
      connectionString:
        process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/iot_plant',
    });
    this.db = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.db.$connect();
  }

  async onModuleDestroy() {
    await this.db.$disconnect();
  }

  get sensorData() {
    return this.db.sensorData;
  }

  get simulationDefinition() {
    return this.db.simulationDefinition;
  }
}
