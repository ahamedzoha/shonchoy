import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { JwtAuthGuard } from '@workspace/nestjs-common';
import { CurrentUser } from '@workspace/nestjs-common';
import type {
  CreateIncomeRequest,
  UpdateIncomeRequest,
  User,
} from '@workspace/shared-domain';

@Controller('income')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(
    @Body() createIncomeDto: CreateIncomeRequest,
    @CurrentUser() user: User,
  ) {
    return this.incomeService.create(createIncomeDto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.incomeService.findAll(user.id, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.incomeService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIncomeDto: UpdateIncomeRequest,
    @CurrentUser() user: User,
  ) {
    return this.incomeService.update(id, updateIncomeDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.incomeService.remove(id, user.id);
  }
}
