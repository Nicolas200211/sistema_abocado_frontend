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

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `dish-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const mockDishes: Dish[] = [
  {
    id: '1',
    name: 'Burger Clásico',
    description: 'Jugosa hamburguesa con queso, lechuga y tomate',
    price: 8.99,
    category: 'principal',
    prepTime: 12,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Pollo Frito Crujiente',
    description: 'Pechuga de pollo crujiente servida con papas',
    price: 9.99,
    category: 'principal',
    prepTime: 15,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Sándwich de Pollo',
    description: 'Pan tostado con pollo a la parrilla, aguacate y mayonesa',
    price: 7.99,
    category: 'principal',
    prepTime: 10,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Papas Fritas',
    description: 'Papas fritas crujientes con sal',
    price: 3.49,
    category: 'lado',
    prepTime: 8,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Aros de Cebolla',
    description: 'Aros de cebolla rebozados y fritos',
    price: 4.49,
    category: 'lado',
    prepTime: 10,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '6',
    name: 'Ensalada Fresca',
    description: 'Ensalada con lechuga, tomate, pepino y aderezo de la casa',
    price: 6.99,
    category: 'lado',
    prepTime: 5,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '7',
    name: 'Refresco',
    description: 'Refresco frío (Cola, Limón, Naranja)',
    price: 2.49,
    category: 'bebida',
    prepTime: 2,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '8',
    name: 'Jugo Natural',
    description: 'Jugo recién exprimido (Naranja, Piña, Sandía)',
    price: 3.99,
    category: 'bebida',
    prepTime: 3,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '9',
    name: 'Helado',
    description: 'Helado cremoso (Vainilla, Chocolate, Fresa)',
    price: 3.99,
    category: 'postre',
    prepTime: 2,
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
  {
    id: '10',
    name: 'Tiramisú',
    description: 'Tiramisú tradicional italiano',
    price: 5.99,
    category: 'postre',
    prepTime: 1,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
    available: true,
    createdAt: new Date(),
  },
];

export const dishesApi = {


  getAll: async (): Promise<Dish[]> => {

    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(mockDishes);
  },

  getByCategory: (category: string) =>
    apiClient.get<Dish[]>(`/dishes?category=${category}`, { requiresAuth: false }),

  getOne: (id: string) => apiClient.get<Dish>(`/dishes/${id}`, { requiresAuth: false }),

  create: async (data: Omit<Dish, 'id' | 'createdAt'>): Promise<Dish> => {
    const newDish: Dish = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    mockDishes.push(newDish);
    return Promise.resolve(newDish);
  },

  update: async (id: string, data: Partial<Omit<Dish, 'id'>>): Promise<Dish> => {
    const index = mockDishes.findIndex((dish) => dish.id === id);
    if (index === -1) {
      throw new Error('Dish not found');
    }
    const updatedDish: Dish = {
      ...mockDishes[index],
      ...data,
    };
    mockDishes[index] = updatedDish;
    return Promise.resolve(updatedDish);
  },

  delete: async (id: string): Promise<void> => {
    const index = mockDishes.findIndex((dish) => dish.id === id);
    if (index === -1) {
      throw new Error('Dish not found');
    }
    mockDishes.splice(index, 1);
    return Promise.resolve();
  },
};
