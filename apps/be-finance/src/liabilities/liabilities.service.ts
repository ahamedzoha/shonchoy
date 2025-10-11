import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiabilityEntity } from './entities/liability.entity';

@Injectable()
export class LiabilitiesService {
  constructor(
    @InjectRepository(LiabilityEntity)
    private readonly liabilityRepository: Repository<LiabilityEntity>,
  ) {}

  // Placeholder for future implementation
  // This service will be fully implemented following the income service pattern
}
