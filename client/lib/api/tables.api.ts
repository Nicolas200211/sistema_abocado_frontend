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


export const mockTables: Table[] = [
  {
    id: 't1',
    number: 1,
    capacity: 2,
    status: 'occupied',
    partySize: 2,
    currentOrderId: 'o1',
    createdAt: new Date(),
  },
  {
    id: 't2',
    number: 2,
    capacity: 4,
    status: 'available',
    createdAt: new Date(),
  },
  {
    id: 't3',
    number: 3,
    capacity: 4,
    status: 'occupied',
    partySize: 3,
    currentOrderId: 'o2',
    createdAt: new Date(),
  },
  {
    id: 't4',
    number: 4,
    capacity: 2,
    status: 'reserved',
    createdAt: new Date(),
  },
  {
    id: 't5',
    number: 5,
    capacity: 6,
    status: 'available',
    createdAt: new Date(),
  },
  {
    id: 't6',
    number: 6,
    capacity: 4,
    status: 'occupied',
    partySize: 4,
    currentOrderId: 'o3',
    createdAt: new Date(),
  },
];

export const tablesApi = {
  
  
  getAll: async (): Promise<Table[]> => {
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(mockTables);
  },

  getOne: (id: string) => apiClient.get<Table>(`/tables/${id}`),

  create: (data: CreateTableDto) => apiClient.post<Table>('/tables', data),

  update: (id: string, data: UpdateTableDto) =>
    apiClient.patch<Table>(`/tables/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/tables/${id}`),

  
  
  clear: async (id: string): Promise<Table> => {
    
    await new Promise(resolve => setTimeout(resolve, 300));
    const table = mockTables.find(t => t.id === id);
    if (table) {
      table.status = 'available';
      table.currentOrderId = undefined;
      table.partySize = undefined;
      return Promise.resolve(table);
    }
    throw new Error('Mesa no encontrada');
  },
};
