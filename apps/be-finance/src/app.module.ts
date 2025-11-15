import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeModule } from './income/income.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AssetsModule } from './assets/assets.module';
import { LiabilitiesModule } from './liabilities/liabilities.module';
import { BudgetModule } from './budget/budget.module';
import { AuthModule } from './auth/auth.module';
import { IncomeEntity } from './income/entities/income.entity';
import { ExpenseEntity } from './expenses/entities/expense.entity';
import { AssetEntity } from './assets/entities/asset.entity';
import { LiabilityEntity } from './liabilities/entities/liability.entity';
import { BudgetEntity } from './budget/entities/budget.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: configService.get<number>('DB_PORT_FINANCE') ?? 5436,
        username: configService.get<string>('DB_USER') ?? 'postgres',
        password: configService.get<string>('DB_PASSWORD') ?? 'password',
        database: 'shonchoy_finance',
        entities: [
          IncomeEntity,
          ExpenseEntity,
          AssetEntity,
          LiabilityEntity,
          BudgetEntity,
        ],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    IncomeModule,
    ExpensesModule,
    AssetsModule,
    LiabilitiesModule,
    BudgetModule,
    AuthModule,
  ],
})
export class AppModule {}
