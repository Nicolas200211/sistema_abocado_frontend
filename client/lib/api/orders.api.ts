import { apiClient } from './client';
import { mockDishes } from '../mockData';
import { mockTables } from './tables.api';

export interface OrderItem {
  id: string;
  dishId: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready';
  startedAt?: Date;
  completedAt?: Date;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  total: number;
}

export interface CreateOrderItemDto {
  dishId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderDto {
  tableId: string;
  items: CreateOrderItemDto[];
  partySize?: number;
}

export interface UpdateOrderDto {
  status?: 'active' | 'completed' | 'cancelled';
}

export interface UpdateOrderItemDto {
  status?: 'pending' | 'preparing' | 'ready';
}


let mockOrders: Order[] = [];

export const ordersApi = {
  getAll: (params?: { status?: string; tableId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.tableId) query.append('tableId', params.tableId);
    const queryString = query.toString();
    return apiClient.get<Order[]>(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  getOne: (id: string) => apiClient.get<Order>(`/orders/${id}`),

  
  
  create: async (data: CreateOrderDto): Promise<Order> => {
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    
    const total = data.items.reduce((sum, item) => {
      const dish = mockDishes.find(d => d.id === item.dishId);
      return sum + (dish ? dish.price * item.quantity : 0);
    }, 0);

    
    const order: Order = {
      id: `order-${Date.now()}`,
      tableId: data.tableId,
      items: data.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        dishId: item.dishId,
        quantity: item.quantity,
        notes: item.notes,
        status: 'pending' as const,
      })),
      status: 'active',
      createdAt: new Date(),
      total: total * 1.1, 
    };

    
    const table = mockTables.find(t => t.id === data.tableId);
    if (table) {
      table.status = 'occupied';
      table.currentOrderId = order.id;
      table.partySize = data.partySize;
    }

    mockOrders.push(order);
    
    return Promise.resolve(order);
  },

  update: (id: string, data: UpdateOrderDto) =>
    apiClient.patch<Order>(`/orders/${id}`, data),

  updateItem: (orderId: string, itemId: string, data: UpdateOrderItemDto) =>
    apiClient.patch<OrderItem>(`/orders/${orderId}/items/${itemId}`, data),

  delete: (id: string) => apiClient.delete<void>(`/orders/${id}`),
};
