import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('liabilities')
export class LiabilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: ['loan', 'credit_card', 'mortgage', 'other'],
    default: 'loan',
  })
  type!: 'loan' | 'credit_card' | 'mortgage' | 'other';

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate?: number;

  @Column({ type: 'int', nullable: true })
  termMonths?: number;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: string;
}
