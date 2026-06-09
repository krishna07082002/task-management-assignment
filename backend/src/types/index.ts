import { Request } from 'express';
import { Types } from 'mongoose';

export type TaskStatus = 'pending' | 'completed';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ITask {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface TaskQuery extends PaginationQuery {
  status?: TaskStatus;
  search?: string;
}
