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

export const dishesApi = {
  getAll: () => apiClient.get<Dish[]>('/dishes', { requiresAuth: false }),

  getByCategory: (category: string) =>
    apiClient.get<Dish[]>(`/dishes?category=${category}`, { requiresAuth: false }),

  getOne: (id: string) => apiClient.get<Dish>(`/dishes/${id}`, { requiresAuth: false }),
};
