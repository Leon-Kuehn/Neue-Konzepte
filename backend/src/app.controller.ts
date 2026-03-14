import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string } {
    return {
      status: 'ok',
    };
  }

  @Get('api/health')
  getApiHealth(): { status: string } {
    return {
      status: 'ok',
    };
  }

  @Get('api/sensor-data')
  getSensorData(): [] {
    return [];
  }
}
