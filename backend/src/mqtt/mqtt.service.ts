import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as mqtt from 'mqtt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const brokerUrl =
      process.env.MQTT_BROKER_URL ?? 'mqtt://mosquitto:1883';
    const topic = process.env.MQTT_TOPIC ?? 'plant/#';

    this.client = mqtt.connect(brokerUrl, {
      clientId: `backend-${Math.random().toString(36).substring(2, 10)}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker at ${brokerUrl}`);
      this.client!.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${topic}: ${err.message}`);
        } else {
          this.logger.log(`Subscribed to topic pattern: ${topic}`);
        }
      });
    });

    this.client.on('message', (receivedTopic, message) => {
      void this.handleMessage(receivedTopic, message.toString());
    });

    this.client.on('error', (err) => {
      this.logger.error(`MQTT error: ${err.message}`);
    });

    this.client.on('reconnect', () => {
      this.logger.warn('Reconnecting to MQTT broker…');
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  private async handleMessage(topic: string, payload: string): Promise<void> {
    // Derive componentId from topic: plant/<componentId>/<kind>
    const parts = topic.split('/');
    const componentId = parts.length >= 2 ? parts[1] : topic;

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload) as unknown;
    } catch {
      parsedPayload = { raw: payload };
    }

    try {
      await this.prisma.sensorData.create({
        data: {
          componentId,
          topic,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload: parsedPayload as any,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to persist MQTT message [${topic}]: ${(err as Error).message}`,
      );
    }
  }
}
