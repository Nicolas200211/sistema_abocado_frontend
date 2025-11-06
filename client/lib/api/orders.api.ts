import { apiClient } from './client';

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

export const ordersApi = {
  getAll: (params?: { status?: string; tableId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.tableId) query.append('tableId', params.tableId);
    const queryString = query.toString();
    return apiClient.get<Order[]>(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  getOne: (id: string) => apiClient.get<Order>(`/orders/${id}`),

  create: (data: CreateOrderDto) => apiClient.post<Order>('/orders', data),

  update: (id: string, data: UpdateOrderDto) =>
    apiClient.patch<Order>(`/orders/${id}`, data),

  updateItem: (orderId: string, itemId: string, data: UpdateOrderItemDto) =>
    apiClient.patch<OrderItem>(`/orders/${orderId}/items/${itemId}`, data),

  delete: (id: string) => apiClient.delete<void>(`/orders/${id}`),
};
