import { Controller, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '@workspace/nestjs-common';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Placeholder for future implementation
  // This controller will be fully implemented following the income controller pattern
}
