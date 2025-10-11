import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('budgets')
export class BudgetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'date' })
  period!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  surplus!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: string;
}
