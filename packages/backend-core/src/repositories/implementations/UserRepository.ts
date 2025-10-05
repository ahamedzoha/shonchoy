import { Repository } from "typeorm";

import { User } from "../../database/entities";
import { IUserRepository } from "../interfaces";

export class UserRepository implements IUserRepository {
  constructor(private repository: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByOAuthId(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    return this.repository.findOne({
      where: { oauth_provider: provider, oauth_id: providerId },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    await this.repository.update(id, updates);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getUsers(
    page: number,
    limit: number
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const offset = (page - 1) * limit;

    const [users, total] = await this.repository.findAndCount({
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }
}
