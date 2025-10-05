// API-facing user DTOs
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  oauthProvider?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password?: string; // Optional for OAuth users
  firstName: string;
  lastName: string;
  oauthProvider?: string;
  oauthId?: string;
  emailVerified?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}
