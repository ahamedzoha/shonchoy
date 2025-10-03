import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./User";

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ unique: true, length: 500, type: "varchar" })
  refresh_token!: string;

  @Column({ type: "timestamptz" })
  expires_at!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @Column({ default: false, type: "boolean" })
  is_revoked!: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
