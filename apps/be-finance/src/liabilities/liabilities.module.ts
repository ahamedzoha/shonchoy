import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiabilitiesService } from './liabilities.service';
import { LiabilitiesController } from './liabilities.controller';
import { LiabilityEntity } from './entities/liability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiabilityEntity])],
  controllers: [LiabilitiesController],
  providers: [LiabilitiesService],
  exports: [LiabilitiesService],
})
export class LiabilitiesModule {}
