import { Controller, UseGuards } from '@nestjs/common';
import { LiabilitiesService } from './liabilities.service';
import { JwtAuthGuard } from '@workspace/nestjs-common';

@Controller('liabilities')
@UseGuards(JwtAuthGuard)
export class LiabilitiesController {
  constructor(private readonly liabilitiesService: LiabilitiesService) {}

  // Placeholder for future implementation
  // This controller will be fully implemented following the income controller pattern
}
