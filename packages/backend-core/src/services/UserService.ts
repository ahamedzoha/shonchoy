import { User } from "../database/entities";
import { IUserRepository } from "../repositories/interfaces";
import { BaseService } from "./BaseService";

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class UserService extends BaseService {
  constructor(private userRepository: IUserRepository) {
    super();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedUsers> {
    return this.userRepository.getUsers(page, limit);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return this.userRepository.update(id, updates);
  }
}
