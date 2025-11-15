import { Controller, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '@workspace/nestjs-common';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  // Placeholder for future implementation
  // This controller will provide endpoints for budget calculations and surplus tracking
}
