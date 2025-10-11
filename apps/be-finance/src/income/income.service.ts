import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeEntity } from './entities/income.entity';
import type {
  CreateIncomeRequest,
  UpdateIncomeRequest,
  IncomeResponse,
  IncomeListResponse,
} from '@workspace/shared-domain';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly incomeRepository: Repository<IncomeEntity>,
  ) {}

  async create(
    createIncomeDto: CreateIncomeRequest,
    userId: string,
  ): Promise<IncomeResponse> {
    const income = this.incomeRepository.create({
      ...createIncomeDto,
      userId,
      date: createIncomeDto.date || new Date().toISOString(),
    });

    const savedIncome = await this.incomeRepository.save(income);
    return this.mapToResponse(savedIncome);
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<IncomeListResponse> {
    const [incomes, total] = await this.incomeRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      incomes: incomes.map((income) => this.mapToResponse(income)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string, userId: string): Promise<IncomeResponse> {
    const income = await this.incomeRepository.findOne({
      where: { id, userId },
    });

    if (!income) {
      throw new NotFoundException(`Income with ID ${id} not found`);
    }

    return this.mapToResponse(income);
  }

  async update(
    id: string,
    updateIncomeDto: UpdateIncomeRequest,
    userId: string,
  ): Promise<IncomeResponse> {
    const income = await this.incomeRepository.findOne({
      where: { id, userId },
    });

    if (!income) {
      throw new NotFoundException(`Income with ID ${id} not found`);
    }

    Object.assign(income, updateIncomeDto);
    const updatedIncome = await this.incomeRepository.save(income);
    return this.mapToResponse(updatedIncome);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.incomeRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Income with ID ${id} not found`);
    }
  }

  private mapToResponse(income: IncomeEntity): IncomeResponse {
    return {
      id: income.id,
      userId: income.userId,
      amount: Number(income.amount),
      source: income.source,
      frequency: income.frequency,
      description: income.description || undefined,
      date: income.date,
      createdAt: income.createdAt,
      updatedAt: income.updatedAt,
    };
  }
}
