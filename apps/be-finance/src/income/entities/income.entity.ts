import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Income } from '@workspace/shared-domain';

@Entity('incomes')
export class IncomeEntity implements Income {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 255 })
  source!: string;

  @Column({
    type: 'enum',
    enum: ['weekly', 'monthly', 'yearly', 'one-time'],
    default: 'monthly',
  })
  frequency!: 'weekly' | 'monthly' | 'yearly' | 'one-time';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamptz' })
  date!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: string;
}
