import { apiClient } from './client';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'chef' | 'waiter';
  createdAt: Date;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: 'admin' | 'chef' | 'waiter';
}

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),

  getOne: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) => apiClient.post<User>('/users', data),

  delete: (id: string) => apiClient.delete<void>(`/users/${id}`),
};

