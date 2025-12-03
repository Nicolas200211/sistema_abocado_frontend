import { apiClient } from './client';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  partySize?: number;
  createdAt: Date;
}

export interface CreateTableDto {
  number: number;
  capacity: number;
  status?: 'available' | 'occupied' | 'reserved';
}

export interface UpdateTableDto {
  number?: number;
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  partySize?: number;
}

export const tablesApi = {
  getAll: () => apiClient.get<Table[]>('/tables'),

  getOne: (id: string) => apiClient.get<Table>(`/tables/${id}`),

  create: (data: CreateTableDto) => apiClient.post<Table>('/tables', data),

  update: (id: string, data: UpdateTableDto) =>
    apiClient.patch<Table>(`/tables/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/tables/${id}`),

  clear: (id: string) => apiClient.post<Table>(`/tables/${id}/clear`),
};
