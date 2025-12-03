import { apiClient } from './client';

export interface OrderItem {
  id: string;
  dishId: number;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
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
  dishId: number;
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
  status?: 'pending' | 'preparing' | 'ready' | 'delivered';
}

const parseOrderDates = (order: any): Order => {
  return {
    ...order,
    total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
    createdAt: new Date(order.createdAt),
    completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
    items: order.items.map((item: any) => ({
      ...item,
      dishId: typeof item.dishId === 'string' ? parseInt(item.dishId, 10) : item.dishId,
      startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
      completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
    })),
  };
};

export const ordersApi = {
  getAll: async (params?: { status?: string; tableId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.tableId) query.append('tableId', params.tableId);
    const queryString = query.toString();
    const orders = await apiClient.get<Order[]>(`/orders${queryString ? `?${queryString}` : ''}`);
    return orders.map(parseOrderDates);
  },

  getOne: async (id: string) => {
    const order = await apiClient.get<Order>(`/orders/${id}`);
    return parseOrderDates(order);
  },

  create: (data: CreateOrderDto) => apiClient.post<Order>('/orders', data),

  update: (id: string, data: UpdateOrderDto) =>
    apiClient.patch<Order>(`/orders/${id}`, data),

  updateItem: (orderId: string, itemId: string, data: UpdateOrderItemDto) =>
    apiClient.patch<OrderItem>(`/orders/${orderId}/items/${itemId}`, data),

  delete: (id: string) => apiClient.delete<void>(`/orders/${id}`),
};
