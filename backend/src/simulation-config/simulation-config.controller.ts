import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SimulationConfigService } from './simulation-config.service.js';

@Controller('simulations')
export class SimulationConfigController {
  constructor(private readonly simulationConfigService: SimulationConfigService) {}

  @Get()
  findAll() {
    return this.simulationConfigService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.simulationConfigService.findById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      id?: unknown;
      name?: unknown;
      description?: unknown;
      repeat?: unknown;
      steps?: unknown;
    },
  ) {
    if (typeof body.id !== 'string' || body.id.trim().length === 0) {
      throw new BadRequestException('id must be a non-empty string');
    }

    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }

    if (body.description !== undefined && typeof body.description !== 'string') {
      throw new BadRequestException('description must be a string when provided');
    }

    if (body.repeat !== undefined && typeof body.repeat !== 'number') {
      throw new BadRequestException('repeat must be a number when provided');
    }

    return this.simulationConfigService.create({
      id: body.id,
      name: body.name,
      description: body.description,
      repeat: body.repeat,
      steps: body.steps ?? [],
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: unknown;
      description?: unknown;
      repeat?: unknown;
      steps?: unknown;
    },
  ) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }

    if (body.description !== undefined && typeof body.description !== 'string') {
      throw new BadRequestException('description must be a string when provided');
    }

    if (body.repeat !== undefined && typeof body.repeat !== 'number') {
      throw new BadRequestException('repeat must be a number when provided');
    }

    return this.simulationConfigService.update(id, {
      name: body.name,
      description: body.description,
      repeat: body.repeat,
      steps: body.steps ?? [],
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.simulationConfigService.remove(id);
  }
}
