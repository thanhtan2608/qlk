export type RoleCode = 'ADMIN' | 'MANAGER' | 'STAFF' | string;

export interface Role {
  id: number;
  roleCode: RoleCode;
  roleName: string;
}

export interface User {
  id: number;
  username: string;
  roleId: number;
  roleCode: RoleCode;
  roleName: string;
  status: number; // 1: Active, 0: Locked
}

export interface Category {
  id: number;
  categoryName: string;
  description?: string;
}

export interface Product {
  id: number;
  productCode: string;
  name: string;
  categoryId: number;
  categoryName?: string;
  quantity: number;
  updatedAt?: string;
}

export interface StockMovement {
  id: number;
  productCode: string;
  name: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  userId: number;
  userName?: string;
  type: 'IMPORT' | 'EXPORT';
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number; // epoch ms
}
