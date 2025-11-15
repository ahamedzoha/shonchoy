import { Controller, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '@workspace/nestjs-common';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // Placeholder for future implementation
  // This controller will be fully implemented following the income controller pattern
}
