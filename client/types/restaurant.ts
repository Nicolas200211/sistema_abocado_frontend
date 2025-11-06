export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "principal" | "lado" | "bebida" | "postre";
  prepTime: number;
  image: string;
}

export interface OrderItem {
  id: string;
  dishId: string;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready";
  startedAt?: Date;
  completedAt?: Date;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  completedAt?: Date;
  total: number;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  currentOrder?: Order;
  partySize?: number;
}

export type UserRole = "chef" | "waiter" | "manager";
