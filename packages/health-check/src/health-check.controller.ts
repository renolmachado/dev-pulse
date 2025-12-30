import { Controller, Get } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {
  constructor() {}

  @Get()
  getHealthCheck(): string {
    return 'Health check';
  }
}
