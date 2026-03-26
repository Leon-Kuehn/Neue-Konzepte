import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SensorDataService } from '../sensor-data/sensor-data.service.js';

type WarehouseAction = 'store' | 'retrieve';

type SimulatorEvent = {
  eventIndex: number;
  action: WarehouseAction;
  slotId: string;
  occupied: boolean;
  quantity: number;
  occupiedSlots: number;
  totalSlots: number;
  storedCount: number;
  retrievedCount: number;
};

type SimulatorLogRow = {
  id: number;
  receivedAt: string;
  action: WarehouseAction;
  slotId: string;
  occupied: boolean;
  quantity: number;
  eventIndex: number;
};

const DEFAULT_INTERVAL_MS = 4_000;
const MIN_INTERVAL_MS = 1_000;
const MAX_INTERVAL_MS = 60_000;
const DEFAULT_LOG_LIMIT = 30;
const MAX_LOG_LIMIT = 200;
const TOTAL_SLOTS = 50;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildSlotIds(): string[] {
  const slotIds: string[] = [];
  for (let row = 1; row <= 5; row += 1) {
    for (let col = 1; col <= 10; col += 1) {
      slotIds.push(`R${row}C${col}`);
    }
  }
  return slotIds;
}

const SLOT_IDS = buildSlotIds();

function readPayloadObject(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  return payload as Record<string, unknown>;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

@Injectable()
export class WarehouseSimulatorService implements OnModuleDestroy {
  private running = false;
  private intervalMs = DEFAULT_INTERVAL_MS;
  private timer: NodeJS.Timeout | null = null;
  private slotQuantities = new Map<string, number>();
  private eventIndex = 0;
  private storedCount = 0;
  private retrievedCount = 0;
  private lastEventAt: Date | null = null;

  constructor(
    private readonly sensorDataService: SensorDataService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleDestroy() {
    this.stop();
  }

  start(intervalMs?: number) {
    const nextInterval =
      intervalMs === undefined
        ? this.intervalMs
        : clamp(intervalMs, MIN_INTERVAL_MS, MAX_INTERVAL_MS);

    this.intervalMs = nextInterval;
    this.stopTimer();
    this.running = true;
    this.timer = setInterval(() => {
      void this.tick();
    }, this.intervalMs);

    return this.getStatus();
  }

  stop() {
    this.stopTimer();
    this.running = false;
    return this.getStatus();
  }

  async tick() {
    const event = this.generateRandomEvent();

    await this.sensorDataService.ingest({
      componentId: 'hochregallager',
      topic: 'hochregallager/simulator/event',
      payload: {
        source: 'warehouse-simulator',
        ...event,
      },
    });

    await this.sensorDataService.ingest({
      componentId: `hochregallager-slot-${event.slotId.toLowerCase()}`,
      topic: `hochregallager/slot/${event.slotId}`,
      payload: {
        source: 'warehouse-simulator',
        action: event.action,
        occupied: event.occupied,
        quantity: event.quantity,
        slotId: event.slotId,
        eventIndex: event.eventIndex,
      },
    });

    this.lastEventAt = new Date();

    return {
      ...event,
      receivedAt: this.lastEventAt.toISOString(),
    };
  }

  getStatus() {
    const slots = SLOT_IDS.map((slotId) => {
      const quantity = this.slotQuantities.get(slotId) ?? 0;
      return {
        slotId,
        occupied: quantity > 0,
        quantity,
      };
    });

    return {
      running: this.running,
      intervalMs: this.intervalMs,
      totalEvents: this.eventIndex,
      storedCount: this.storedCount,
      retrievedCount: this.retrievedCount,
      occupiedSlots: this.slotQuantities.size,
      totalSlots: TOTAL_SLOTS,
      lastEventAt: this.lastEventAt?.toISOString() ?? null,
      slots,
    };
  }

  async getLogs(limit = DEFAULT_LOG_LIMIT): Promise<SimulatorLogRow[]> {
    const take = clamp(limit, 1, MAX_LOG_LIMIT);
    const rows = await this.prisma.sensorData.findMany({
      where: {
        topic: 'hochregallager/simulator/event',
      },
      orderBy: { receivedAt: 'desc' },
      take,
    });

    return rows
      .map((row) => {
        const payload = readPayloadObject(row.payload);
        if (!payload) {
          return null;
        }

        const action =
          payload.action === 'store' || payload.action === 'retrieve'
            ? payload.action
            : undefined;
        const slotId =
          typeof payload.slotId === 'string' ? payload.slotId : undefined;
        const occupied =
          typeof payload.occupied === 'boolean' ? payload.occupied : undefined;
        const quantity = toNumber(payload.quantity);
        const eventIndex = toNumber(payload.eventIndex);

        if (
          !action ||
          !slotId ||
          occupied === undefined ||
          quantity === undefined ||
          eventIndex === undefined
        ) {
          return null;
        }

        return {
          id: row.id,
          receivedAt: row.receivedAt.toISOString(),
          action,
          slotId,
          occupied,
          quantity,
          eventIndex,
        };
      })
      .filter((row): row is SimulatorLogRow => row !== null);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private generateRandomEvent(): SimulatorEvent {
    const occupiedSlots = SLOT_IDS.filter((slotId) => this.slotQuantities.has(slotId));
    const emptySlots = SLOT_IDS.filter((slotId) => !this.slotQuantities.has(slotId));

    const action: WarehouseAction =
      occupiedSlots.length === 0
        ? 'store'
        : emptySlots.length === 0
          ? 'retrieve'
          : Math.random() < 0.5
            ? 'retrieve'
            : 'store';

    const candidateSlots = action === 'store' ? emptySlots : occupiedSlots;
    const slotId =
      candidateSlots[Math.floor(Math.random() * candidateSlots.length)] ?? SLOT_IDS[0]!;

    let quantity = 0;
    if (action === 'store') {
      quantity = Math.floor(Math.random() * 12) + 1;
      this.slotQuantities.set(slotId, quantity);
      this.storedCount += 1;
    } else {
      quantity = this.slotQuantities.get(slotId) ?? 0;
      this.slotQuantities.delete(slotId);
      this.retrievedCount += 1;
    }

    this.eventIndex += 1;

    return {
      eventIndex: this.eventIndex,
      action,
      slotId,
      occupied: action === 'store',
      quantity,
      occupiedSlots: this.slotQuantities.size,
      totalSlots: TOTAL_SLOTS,
      storedCount: this.storedCount,
      retrievedCount: this.retrievedCount,
    };
  }
}
