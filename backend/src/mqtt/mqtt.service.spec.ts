import { Test, TestingModule } from '@nestjs/testing';
import { MqttService } from './mqtt.service';
import { PrismaService } from '../prisma/prisma.service';

// Prevent Jest from loading the actual PrismaService (which pulls in the
// Prisma-generated ESM client that uses import.meta and can't run in Jest).
// Using a factory avoids Jest ever touching the real prisma.service.ts file.
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

/** Minimal mock for the mqtt client returned by mqtt.connect(). */
class MockMqttClient {
  private handlers: Record<string, ((...args: unknown[]) => void)[]> = {};

  on(event: string, handler: (...args: unknown[]) => void) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
    return this;
  }

  subscribe(_topic: string, cb: (err: Error | null) => void) {
    cb(null);
    return this;
  }

  end() {
    return this;
  }

  /** Helper: trigger a registered event from tests. */
  emit(event: string, ...args: unknown[]) {
    for (const handler of this.handlers[event] ?? []) {
      handler(...args);
    }
  }
}

jest.mock('mqtt', () => ({
  connect: jest.fn(() => new MockMqttClient()),
}));

import * as mqttLib from 'mqtt';

type SensorDataCreateInput = {
  data: {
    componentId: string;
    topic: string;
    payload: unknown;
  };
};

describe('MqttService', () => {
  let service: MqttService;
  let mockClient: MockMqttClient;

  const mockSensorDataCreate = jest.fn().mockResolvedValue({ id: 1 });
  const mockPrismaService = {
    sensorData: {
      create: mockSensorDataCreate,
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.MQTT_BROKER_URL = 'mqtt://test-broker:1883';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MqttService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MqttService>(MqttService);

    // Initialise (calls onModuleInit) and capture the mock client
    service.onModuleInit();
    mockClient = (mqttLib.connect as jest.Mock).mock.results[0]
      .value as MockMqttClient;
  });

  const getLastCreatedData = (): SensorDataCreateInput['data'] => {
    const calls = mockSensorDataCreate.mock.calls as SensorDataCreateInput[][];
    const lastCall = calls.at(-1);
    expect(lastCall).toBeDefined();
    return lastCall![0].data;
  };

  afterEach(() => {
    service.onModuleDestroy();
    delete process.env.MQTT_BROKER_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('connects to the broker using MQTT_BROKER_URL', () => {
    process.env.MQTT_BROKER_URL = 'mqtt://test-broker:1883';
    service.onModuleInit();
    expect(mqttLib.connect).toHaveBeenCalledWith(
      'mqtt://test-broker:1883',
      expect.objectContaining({ reconnectPeriod: 5000 }),
    );
    delete process.env.MQTT_BROKER_URL;
  });

  it('subscribes to entry-route/#, hochregallager/#, and plant/# on connect', () => {
    const subscribeSpy = jest.spyOn(mockClient, 'subscribe');
    mockClient.emit('connect');

    const topics = subscribeSpy.mock.calls.map(([t]) => t);
    expect(topics).toContain('entry-route/#');
    expect(topics).toContain('hochregallager/#');
    expect(topics).toContain('plant/#');
  });

  it('derives componentId from the first topic segment', async () => {
    mockClient.emit('connect');

    // Simulate a message on entry-route/status
    mockClient.emit(
      'message',
      'entry-route/status',
      Buffer.from('{"sensor":"entry","value":1}'),
    );

    // Allow the async handleMessage to complete
    await new Promise((r) => setTimeout(r, 10));

    const createdData = getLastCreatedData();
    expect(createdData.componentId).toBe('entry-route');
    expect(createdData.topic).toBe('entry-route/status');
  });

  it('stores parsed JSON payload', async () => {
    mockClient.emit('connect');
    mockClient.emit(
      'message',
      'plant/conveyor-1/telemetry',
      Buffer.from('{"speed":3.2}'),
    );

    await new Promise((r) => setTimeout(r, 10));

    const createdData = getLastCreatedData();
    expect(createdData.componentId).toBe('plant');
    expect(createdData.payload).toEqual({ speed: 3.2 });
  });

  it('stores non-JSON payload as string', async () => {
    mockClient.emit('connect');
    mockClient.emit('message', 'hochregallager/door', Buffer.from('OPEN'));

    await new Promise((r) => setTimeout(r, 10));

    const createdData = getLastCreatedData();
    expect(createdData.componentId).toBe('hochregallager');
    expect(createdData.payload).toBe('OPEN');
  });

  it('does not attempt MQTT connection when MQTT_BROKER_URL is missing', () => {
    delete process.env.MQTT_BROKER_URL;
    service.onModuleInit();
    expect(mqttLib.connect).toHaveBeenCalledTimes(1);
  });

  it('logs MQTT disconnected on disconnect event', () => {
    const logSpy = jest.spyOn(service['logger'], 'log');
    mockClient.emit('disconnect');
    expect(logSpy).toHaveBeenCalledWith('MQTT disconnected');
  });
});
