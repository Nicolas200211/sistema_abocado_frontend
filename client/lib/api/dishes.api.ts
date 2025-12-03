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

const transformDish = (dish: any): Dish => ({
  ...dish,
  price: typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price,
  id: String(dish.id),
  prepTime: typeof dish.prepTime === 'string' ? parseInt(dish.prepTime) : dish.prepTime,
});

export const dishesApi = {
  getAll: async () => {
    const dishes = await apiClient.get<any[]>('/dishes', { requiresAuth: false });
    return dishes.map(transformDish);
  },

  getByCategory: async (category: string) => {
    const dishes = await apiClient.get<any[]>(`/dishes?category=${category}`, { requiresAuth: false });
    return dishes.map(transformDish);
  },

  getOne: async (id: string) => {
    const dish = await apiClient.get<any>(`/dishes/${id}`, { requiresAuth: false });
    return transformDish(dish);
  },
};
