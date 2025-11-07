import { StaffMember } from '@/types/restaurant';

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `staff-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const mockStaff: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'María Gonzales',
    email: 'maria.gonzales@example.com',
    phone: '+51 999 123 456',
    role: 'chef',
    hireDate: new Date('2022-05-10'),
  },
  {
    id: 'staff-2',
    name: 'Carlos Pérez',
    email: 'carlos.perez@example.com',
    phone: '+51 988 456 789',
    role: 'waiter',
    hireDate: new Date('2023-02-18'),
  },
  {
    id: 'staff-3',
    name: 'Ana Torres',
    email: 'ana.torres@example.com',
    phone: '+51 977 654 321',
    role: 'bartender',
    hireDate: new Date('2021-11-05'),
  },
];

export const staffApi = {
  getAll: async (): Promise<StaffMember[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return Promise.resolve(mockStaff);
  },

  create: async (data: Omit<StaffMember, 'id' | 'hireDate'> & { hireDate?: Date }): Promise<StaffMember> => {
    const newStaff: StaffMember = {
      ...data,
      id: generateId(),
      hireDate: data.hireDate ?? new Date(),
    };
    mockStaff.push(newStaff);
    return Promise.resolve(newStaff);
  },

  update: async (id: string, data: Partial<Omit<StaffMember, 'id'>>): Promise<StaffMember> => {
    const index = mockStaff.findIndex((staff) => staff.id === id);
    if (index === -1) {
      throw new Error('Staff member not found');
    }
    const updatedStaff: StaffMember = {
      ...mockStaff[index],
      ...data,
    };
    mockStaff[index] = updatedStaff;
    return Promise.resolve(updatedStaff);
  },

  delete: async (id: string): Promise<void> => {
    const index = mockStaff.findIndex((staff) => staff.id === id);
    if (index === -1) {
      throw new Error('Staff member not found');
    }
    mockStaff.splice(index, 1);
    return Promise.resolve();
  },
};

