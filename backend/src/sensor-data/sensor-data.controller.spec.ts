import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SensorDataController } from './sensor-data.controller';
import { SensorDataService } from './sensor-data.service';

describe('SensorDataController', () => {
  let controller: SensorDataController;

  const mockService = {
    ingest: jest.fn(),
    findAll: jest.fn(),
    findLatestPerComponent: jest.fn(),
    findByRange: jest.fn(),
    getStats: jest.fn(),
    getActivity: jest.fn(),
    findByComponentId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorDataController],
      providers: [{ provide: SensorDataService, useValue: mockService }],
    }).compile();

    controller = module.get<SensorDataController>(SensorDataController);
  });

  it('forwards latest query to service', () => {
    void controller.findLatest();
    expect(mockService.findLatestPerComponent).toHaveBeenCalled();
  });

  it('forwards direct ingest payload to service', () => {
    void controller.ingest({
      topic: 'plant/conveyor-1/status',
      payload: { status: 'on', value: 42 },
      receivedAt: '2026-03-24T10:00:00.000Z',
    });

    expect(mockService.ingest).toHaveBeenCalledWith({
      topic: 'plant/conveyor-1/status',
      payload: { status: 'on', value: 42 },
      componentId: undefined,
      receivedAt: new Date('2026-03-24T10:00:00.000Z'),
    });
  });

  it('rejects ingest when topic is missing', () => {
    expect(() => controller.ingest({ payload: { value: 1 } })).toThrow(
      BadRequestException,
    );
  });

  it('validates and forwards range query', () => {
    void controller.findByRange('2026-03-21T10:00:00Z', '2026-03-21T11:00:00Z');
    expect(mockService.findByRange).toHaveBeenCalledWith(
      new Date('2026-03-21T10:00:00Z'),
      new Date('2026-03-21T11:00:00Z'),
    );
  });

  it('rejects invalid activity interval', () => {
    expect(() => controller.findActivity('comp-1', 'day')).toThrow(
      BadRequestException,
    );
  });

  it('forwards stats query to service', () => {
    void controller.findStats('comp-1');
    expect(mockService.getStats).toHaveBeenCalledWith('comp-1');
  });

  it('parses since and limit for component endpoint', () => {
    void controller.findByComponent('comp-1', '10', '2026-03-21T10:00:00Z');
    expect(mockService.findByComponentId).toHaveBeenCalledWith(
      'comp-1',
      10,
      new Date('2026-03-21T10:00:00Z'),
    );
  });
});
