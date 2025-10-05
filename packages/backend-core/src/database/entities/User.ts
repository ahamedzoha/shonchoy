import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Session } from "./Session";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 255, type: "varchar" })
  email!: string;

  @Column({ nullable: true, length: 255, type: "varchar" })
  password_hash!: string | null;

  @Column({ name: "first_name", length: 100, type: "varchar" })
  firstName!: string;

  @Column({ name: "last_name", length: 100, type: "varchar" })
  lastName!: string;

  // OAuth fields
  @Column({ nullable: true, length: 50, type: "varchar" })
  oauth_provider?: string; // 'google', 'github', etc.

  @Column({ nullable: true, length: 255, type: "varchar" })
  oauth_id?: string; // Provider's user ID

  @Column({ name: "email_verified", default: false, type: "boolean" })
  emailVerified!: boolean;

  @Column({ name: "is_active", default: true, type: "boolean" })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions!: Session[];
}
