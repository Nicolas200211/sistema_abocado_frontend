import { apiClient } from './client';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'principal' | 'lado' | 'bebida' | 'postre';
  prepTime: number;
  image: string;
  available: boolean;
  createdAt: Date;
}

export interface CreateDishDto {
  name: string;
  description: string;
  price: number;
  category: 'principal' | 'lado' | 'bebida' | 'postre';
  prepTime: number;
  image: string;
  available?: boolean;
}

export interface UpdateDishDto {
  name?: string;
  description?: string;
  price?: number;
  category?: 'principal' | 'lado' | 'bebida' | 'postre';
  prepTime?: number;
  image?: string;
  available?: boolean;
}

export const dishesApi = {
  getAll: () => apiClient.get<Dish[]>('/dishes', { requiresAuth: false }),

  getByCategory: (category: string) =>
    apiClient.get<Dish[]>(`/dishes?category=${category}`, { requiresAuth: false }),

  getOne: (id: string) => apiClient.get<Dish>(`/dishes/${id}`, { requiresAuth: false }),

  create: (data: CreateDishDto) => apiClient.post<Dish>('/dishes', data),

  update: (id: string, data: UpdateDishDto) =>
    apiClient.patch<Dish>(`/dishes/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/dishes/${id}`),
};
