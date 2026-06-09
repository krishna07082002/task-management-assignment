export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
  createdAt: string;
}

export interface TaskStats {
  total: number;             
  completed: number;        
  pending: number;        
  completionPercentage: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}