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

  @Column({ length: 255, type: "varchar" })
  password_hash!: string;

  @Column({ name: "first_name", length: 100, type: "varchar" })
  firstName!: string;

  @Column({ name: "last_name", length: 100, type: "varchar" })
  lastName!: string;

  @Column({ name: "is_active", default: true, type: "boolean" })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions!: Session[];
}
