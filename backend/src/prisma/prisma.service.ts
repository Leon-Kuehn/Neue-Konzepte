import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: InstanceType<typeof Pool>;
  readonly db: InstanceType<typeof PrismaClient>;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/iot_plant',
    });
    const adapter = new PrismaPg(this.pool);
    this.db = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.db.$connect();
  }

  async onModuleDestroy() {
    await this.db.$disconnect();
    await this.pool.end();
  }

  get sensorData() {
    return this.db.sensorData;
  }
}
