import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as mqtt from 'mqtt';
import { PrismaService } from '../prisma/prisma.service.js';

/** Topics the backend subscribes to. */
const SUBSCRIBED_TOPICS = ['entry-route/#', 'hochregallager/#', 'plant/#'];
type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

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

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const brokerUrl = process.env.MQTT_BROKER_URL;
    if (!brokerUrl) {
      this.logger.warn(
        'MQTT_BROKER_URL is not set. MQTT ingestion is disabled.',
      );
      return;
    }

    this.client = mqtt.connect(brokerUrl, {
      clientId: `backend-${Math.random().toString(36).substring(2, 10)}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log('MQTT connected');
      for (const topic of SUBSCRIBED_TOPICS) {
        this.client!.subscribe(topic, (err) => {
          if (err) {
            this.logger.error(
              `Failed to subscribe to ${topic}: ${err.message}`,
            );
          } else {
            this.logger.log(`Subscribed to topic pattern: ${topic}`);
          }
        });
      }
    });

    this.client.on('message', (receivedTopic, message) => {
      void this.handleMessage(receivedTopic, message.toString());
    });

    this.client.on('disconnect', () => {
      this.logger.log('MQTT disconnected');
    });

    this.client.on('error', (err) => {
      this.logger.error(`MQTT error: ${err.message}`);
    });

    this.client.on('reconnect', () => {
      this.logger.log('MQTT reconnecting');
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  private async handleMessage(topic: string, payload: string): Promise<void> {
    this.logger.log(`MQTT message received: ${topic}`);

    // Derive componentId from the first segment of the topic.
    // e.g. "entry-route/status" → "entry-route"
    const componentId = topic.split('/')[0];

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload) as unknown;
    } catch {
      parsedPayload = payload;
    }
    const payloadToStore: Prisma.InputJsonValue | Prisma.JsonNullValueInput =
      parsedPayload === null
        ? Prisma.JsonNull
        : isJsonValue(parsedPayload)
          ? parsedPayload
          : payload;

    try {
      await this.prisma.sensorData.create({
        data: {
          componentId,
          topic,
          receivedAt: new Date(),
          payload: payloadToStore,
        },
      });
      this.logger.log(`SensorData stored: ${topic}`);
    } catch (err) {
      this.logger.error(
        `Failed to persist MQTT message [${topic}]: ${(err as Error).message}`,
      );
    }
  }
}
