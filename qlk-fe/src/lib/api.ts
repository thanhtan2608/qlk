import { User, Product, Category, Role, StockMovement } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Biến lưu trạng thái backend có sẵn sàng không
let isBackendLive = true;

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    isBackendLive = res.ok;
    return res.ok;
  } catch {
    isBackendLive = false;
    return false;
  }
};

export const getBackendStatus = () => isBackendLive;

// =================== MOCK / OFFLINE FALLBACK STORE ===================
let mockUsers: User[] = [
  { id: 1, username: 'admin', roleId: 1, roleCode: 'ADMIN', roleName: 'Quản trị viên (Admin)', status: 1 },
  { id: 2, username: 'quanly', roleId: 2, roleCode: 'MANAGER', roleName: 'Quản lý kho (Manager)', status: 1 },
  { id: 3, username: 'nhanvien', roleId: 3, roleCode: 'STAFF', roleName: 'Nhân viên kho (Staff)', status: 1 },
];

let mockCategories: Category[] = [
  { id: 1, categoryName: 'Điện tử & Linh kiện', description: 'Thiết bị số, linh kiện máy tính' },
  { id: 2, categoryName: 'Thiết bị gia dụng', description: 'Đồ gia dụng, quạt điện, nồi chiên' },
  { id: 3, categoryName: 'Văn phòng phẩm', description: 'Giấy in, bút bi, đồ văn phòng' },
  { id: 4, categoryName: 'Đồ đóng gói', description: 'Băng dính, thùng carton, xốp nổ' },
];

let mockProducts: Product[] = [
  { id: 1, productCode: 'SP-001', name: 'Chuột không dây Logitech M330 Silent', categoryId: 1, categoryName: 'Điện tử & Linh kiện', quantity: 45, updatedAt: new Date().toISOString() },
  { id: 2, productCode: 'SP-002', name: 'Bàn phím cơ DareU EK87 Tenkeyless', categoryId: 1, categoryName: 'Điện tử & Linh kiện', quantity: 28, updatedAt: new Date().toISOString() },
  { id: 3, productCode: 'SP-003', name: 'Cáp sạc Type-C Anker PowerLine 1.8m', categoryId: 1, categoryName: 'Điện tử & Linh kiện', quantity: 120, updatedAt: new Date().toISOString() },
  { id: 4, productCode: 'SP-004', name: 'Nồi chiên không dầu Philips 4.5L', categoryId: 2, categoryName: 'Thiết bị gia dụng', quantity: 15, updatedAt: new Date().toISOString() },
  { id: 5, productCode: 'SP-005', name: 'Quạt đứng Panasonic F-409KBE', categoryId: 2, categoryName: 'Thiết bị gia dụng', quantity: 8, updatedAt: new Date().toISOString() },
  { id: 6, productCode: 'SP-006', name: 'Giấy in Double A A4 70gsm (Ram 500 tờ)', categoryId: 3, categoryName: 'Văn phòng phẩm', quantity: 250, updatedAt: new Date().toISOString() },
  { id: 7, productCode: 'SP-007', name: 'Bút bi Thiên Long 0.5mm xanh (Hộp 20 cây)', categoryId: 3, categoryName: 'Văn phòng phẩm', quantity: 300, updatedAt: new Date().toISOString() },
  { id: 8, productCode: 'SP-008', name: 'Thùng carton 3 lớp 30x20x15cm', categoryId: 4, categoryName: 'Đồ đóng gói', quantity: 500, updatedAt: new Date().toISOString() },
  { id: 9, productCode: 'SP-009', name: 'Cuộn màng xốp hơi bubble 50cm x 100m', categoryId: 4, categoryName: 'Đồ đóng gói', quantity: 40, updatedAt: new Date().toISOString() },
  { id: 10, productCode: 'SP-010', name: 'Băng keo trong OPP 4.8cm x 100 yard', categoryId: 4, categoryName: 'Đồ đóng gói', quantity: 180, updatedAt: new Date().toISOString() },
];

let mockMovements: StockMovement[] = [
  { id: 1, productCode: 'SP-001', name: 'Chuột không dây Logitech M330 Silent', quantity: 50, date: '2026-11-24', time: '08:30:00', userId: 2, userName: 'quanly', type: 'IMPORT' },
  { id: 2, productCode: 'SP-003', name: 'Cáp sạc Type-C Anker PowerLine 1.8m', quantity: 100, date: '2026-11-24', time: '09:15:00', userId: 3, userName: 'nhanvien', type: 'IMPORT' },
  { id: 3, productCode: 'SP-006', name: 'Giấy in Double A A4 70gsm (Ram 500 tờ)', quantity: 200, date: '2026-11-24', time: '10:00:00', userId: 3, userName: 'nhanvien', type: 'IMPORT' },
  { id: 4, productCode: 'SP-001', name: 'Chuột không dây Logitech M330 Silent', quantity: 5, date: '2026-11-24', time: '13:45:00', userId: 3, userName: 'nhanvien', type: 'EXPORT' },
  { id: 5, productCode: 'SP-006', name: 'Giấy in Double A A4 70gsm (Ram 500 tờ)', quantity: 50, date: '2026-11-24', time: '14:20:00', userId: 3, userName: 'nhanvien', type: 'EXPORT' },
];

const mockRoles: Role[] = [
  { id: 1, roleCode: 'ADMIN', roleName: 'Quản trị viên (Admin)' },
  { id: 2, roleCode: 'MANAGER', roleName: 'Quản lý kho (Manager)' },
  { id: 3, roleCode: 'STAFF', roleName: 'Nhân viên kho (Staff)' },
];

// Helper xử lý phản hồi HTTP và chuẩn hóa lỗi
const handleResponse = async (res: Response) => {
  if (res.status >= 500) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || 'Yêu cầu admin sửa chữa');
  }
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || `Lỗi yêu cầu (Mã lỗi: ${res.status})`);
  }
  if (res.status === 204) return null;
  return await res.json().catch(() => null);
};

const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // --- AUTHENTICATION ---
  auth: {
    async login(username: string, password: string): Promise<{ token: string; user: User; expiresIn: number }> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await handleResponse(res);
        isBackendLive = true;
        return {
          token: data.token,
          user: {
            id: data.id,
            username: data.username,
            roleId: data.roleId,
            roleCode: data.roleCode,
            roleName: data.roleName,
            status: data.status,
          },
          expiresIn: data.expiresIn || 86400,
        };
      } catch (e: any) {
        if (e.message && e.message !== 'Failed to fetch') {
          throw e;
        }
        // Fallback Mock Login
        isBackendLive = false;
        const normalized = username.trim().toLowerCase();
        let targetUser = mockUsers.find(u => u.username.toLowerCase() === normalized);
        if (!targetUser) {
          if (normalized === 'admin') targetUser = mockUsers[0];
          else if (normalized === 'quanly') targetUser = mockUsers[1];
          else if (normalized === 'nhanvien') targetUser = mockUsers[2];
        }

        if (!targetUser) {
          throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
        }
        if (targetUser.status === 0) {
          throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ Admin!');
        }

        return {
          token: `mock_jwt_token_${targetUser.id}_${Date.now()}`,
          user: targetUser,
          expiresIn: 86400,
        };
      }
    },

    async getMe(token: string): Promise<User | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders(token) });
        return await handleResponse(res);
      } catch {
        return null;
      }
    },
  },

  // --- ROLES ---
  roles: {
    async getAll(): Promise<Role[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/roles`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
      return mockRoles;
    },
  },

  // --- USERS (Admin) ---
  users: {
    async getAll(): Promise<User[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (res.ok) {
          const data = await res.json();
          const roles = await api.roles.getAll();
          return data.map((u: any) => {
            const role = roles.find(r => r.id === u.roleId);
            return {
              ...u,
              roleCode: role?.roleCode || 'STAFF',
              roleName: role?.roleName || 'Nhân viên',
            };
          });
        }
      } catch {
        // Fallback
      }
      return [...mockUsers];
    },

    async create(data: { username: string; password: string; roleId: number }): Promise<User> {
      try {
        const res = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const u = await handleResponse(res);
        const roles = await api.roles.getAll();
        const role = roles.find(r => r.id === u.roleId);
        return { ...u, roleCode: role?.roleCode || 'STAFF', roleName: role?.roleName || 'Nhân viên' };
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const role = mockRoles.find(r => r.id === data.roleId) || mockRoles[2];
      const newUser: User = {
        id: Date.now(),
        username: data.username,
        roleId: data.roleId,
        roleCode: role.roleCode,
        roleName: role.roleName,
        status: 1,
      };
      mockUsers.push(newUser);
      return newUser;
    },

    async update(id: number, data: { username?: string; password?: string; roleId?: number; status?: number }): Promise<User> {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const u = await handleResponse(res);
        const roles = await api.roles.getAll();
        const role = roles.find(r => r.id === u.roleId);
        return { ...u, roleCode: role?.roleCode || 'STAFF', roleName: role?.roleName || 'Nhân viên' };
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const idx = mockUsers.findIndex(u => u.id === id);
      if (idx !== -1) {
        const role = mockRoles.find(r => r.id === data.roleId) || mockRoles.find(r => r.id === mockUsers[idx].roleId)!;
        mockUsers[idx] = {
          ...mockUsers[idx],
          username: data.username || mockUsers[idx].username,
          roleId: data.roleId !== undefined ? data.roleId : mockUsers[idx].roleId,
          roleCode: role.roleCode,
          roleName: role.roleName,
          status: data.status !== undefined ? data.status : mockUsers[idx].status,
        };
        return mockUsers[idx];
      }
      throw new Error('Không tìm thấy tài khoản để cập nhật');
    },

    async toggleStatus(id: number, newStatus: number): Promise<void> {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        await handleResponse(res);
        return;
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const user = mockUsers.find(u => u.id === id);
      if (user) user.status = newStatus;
    },

    async delete(id: number): Promise<void> {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        await handleResponse(res);
        return;
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      mockUsers = mockUsers.filter(u => u.id !== id);
    },
  },

  // --- CATEGORIES ---
  categories: {
    async getAll(): Promise<Category[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
      return [...mockCategories];
    },

    async create(data: { categoryName: string; description?: string }): Promise<Category> {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await handleResponse(res);
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const existing = mockCategories.find(
        c => c.categoryName.toLowerCase() === data.categoryName.trim().toLowerCase()
      );
      if (existing) throw new Error(`Danh mục '${data.categoryName}' đã tồn tại!`);
      const newCat: Category = {
        id: Date.now(),
        categoryName: data.categoryName.trim(),
        description: data.description?.trim() || '',
      };
      mockCategories.push(newCat);
      return newCat;
    },

    async update(id: number, data: { categoryName: string; description?: string }): Promise<Category> {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await handleResponse(res);
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const idx = mockCategories.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Không tìm thấy danh mục');
      const dup = mockCategories.find(
        c => c.id !== id && c.categoryName.toLowerCase() === data.categoryName.trim().toLowerCase()
      );
      if (dup) throw new Error(`Danh mục '${data.categoryName}' đã tồn tại!`);
      mockCategories[idx] = {
        ...mockCategories[idx],
        categoryName: data.categoryName.trim(),
        description: data.description?.trim() ?? mockCategories[idx].description,
      };
      return mockCategories[idx];
    },

    async delete(id: number): Promise<void> {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
        await handleResponse(res);
        return;
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      mockCategories = mockCategories.filter(c => c.id !== id);
    },

    async deleteAll(): Promise<void> {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/all`, { method: 'DELETE' });
        await handleResponse(res);
        return;
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      mockCategories = [];
    },
  },

  // --- PRODUCTS (Quản lý & Nhân viên) ---
  products: {
    async getAll(keyword?: string): Promise<Product[]> {
      try {
        const url = keyword ? `${API_BASE_URL}/products?keyword=${encodeURIComponent(keyword)}` : `${API_BASE_URL}/products`;
        const res = await fetch(url);
        if (res.ok) {
          const list = await res.json();
          const categories = await api.categories.getAll();
          return list.map((p: any) => ({
            ...p,
            categoryName: categories.find(c => c.id === p.categoryId)?.categoryName || 'Khác',
          }));
        }
      } catch {
        // Fallback
      }
      let results = [...mockProducts];
      if (keyword && keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        results = results.filter(p => p.name.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q));
      }
      return results;
    },

    async getById(id: number): Promise<Product> {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        return await handleResponse(res);
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const p = mockProducts.find(item => item.id === id);
      if (!p) throw new Error('Không tìm thấy sản phẩm');
      return p;
    },

    async create(data: { productCode: string; name: string; categoryId: number; initialQuantity: number }): Promise<Product> {
      try {
        const res = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const p = await handleResponse(res);
        const categories = await api.categories.getAll();
        return {
          ...p,
          categoryName: categories.find(c => c.id === p.categoryId)?.categoryName || 'Khác',
        };
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const existing = mockProducts.find(p => p.productCode.toLowerCase() === data.productCode.trim().toLowerCase());
      if (existing) throw new Error(`Mã sản phẩm '${data.productCode}' đã tồn tại!`);

      const cat = mockCategories.find(c => c.id === data.categoryId);
      const newProduct: Product = {
        id: Date.now(),
        productCode: data.productCode.trim(),
        name: data.name.trim(),
        categoryId: data.categoryId,
        categoryName: cat?.categoryName || 'Khác',
        quantity: Number(data.initialQuantity) || 0,
        updatedAt: new Date().toISOString(),
      };
      mockProducts.unshift(newProduct);
      return newProduct;
    },

    async update(id: number, data: { productCode: string; name: string; categoryId: number }): Promise<Product> {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const p = await handleResponse(res);
        const categories = await api.categories.getAll();
        return {
          ...p,
          categoryName: categories.find(c => c.id === p.categoryId)?.categoryName || 'Khác',
        };
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        const cat = mockCategories.find(c => c.id === data.categoryId);
        mockProducts[idx] = {
          ...mockProducts[idx],
          productCode: data.productCode.trim(),
          name: data.name.trim(),
          categoryId: data.categoryId,
          categoryName: cat?.categoryName || 'Khác',
          updatedAt: new Date().toISOString(),
        };
        return mockProducts[idx];
      }
      throw new Error('Không tìm thấy sản phẩm để cập nhật');
    },

    // XÓA VĨNH VIỄN 1 SẢN PHẨM
    async delete(id: number): Promise<void> {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
        await handleResponse(res);
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const target = mockProducts.find(p => p.id === id);
      if (target) {
        // Xóa cả các bản ghi lịch sử nhập xuất của mã sản phẩm này
        mockMovements = mockMovements.filter(m => m.productCode.toLowerCase() !== target.productCode.toLowerCase());
      }
      mockProducts = mockProducts.filter(p => p.id !== id);
    },

    // XÓA VĨNH VIỄN TẤT CẢ SẢN PHẨM (DÀNH CHO QUẢN LÝ)
    async deleteAll(): Promise<void> {
      try {
        const res = await fetch(`${API_BASE_URL}/products/all`, { method: 'DELETE' });
        await handleResponse(res);
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      mockProducts = [];
      mockMovements = [];
    },

    async importExcel(file: File): Promise<Product[]> {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/products/excel/import`, {
          method: 'POST',
          body: formData,
        });
        return await handleResponse(res);
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      return [...mockProducts];
    },

    getExportExcelUrl(): string {
      return `${API_BASE_URL}/products/excel/export`;
    },

    getExportCsvUrl(): string {
      return `${API_BASE_URL}/products/csv/export`;
    },
  },

  // --- STOCK MOVEMENT (Nhập, Xuất kho & Quản lý lịch sử) ---
  stock: {
    async importStock(productCode: string, quantity: number, userId: number): Promise<{ newQuantity: number }> {
      try {
        const res = await fetch(`${API_BASE_URL}/imports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productCode, quantity, userId }),
        });
        await handleResponse(res);
        const pRes = await fetch(`${API_BASE_URL}/products/code/${encodeURIComponent(productCode)}`);
        if (pRes.ok) {
          const p = await pRes.json();
          return { newQuantity: p.quantity };
        }
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const prod = mockProducts.find(p => p.productCode.toLowerCase() === productCode.trim().toLowerCase());
      if (!prod) throw new Error(`Không tìm thấy mã sản phẩm ${productCode} trong kho`);
      prod.quantity += quantity;
      prod.updatedAt = new Date().toISOString();

      mockMovements.unshift({
        id: Date.now(),
        productCode: prod.productCode,
        name: prod.name,
        quantity,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        userId,
        userName: mockUsers.find(u => u.id === userId)?.username || 'Hệ thống',
        type: 'IMPORT',
      });

      return { newQuantity: prod.quantity };
    },

    async exportStock(productCode: string, quantity: number, userId: number): Promise<{ newQuantity: number }> {
      try {
        const res = await fetch(`${API_BASE_URL}/exports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productCode, quantity, userId }),
        });
        await handleResponse(res);
        const pRes = await fetch(`${API_BASE_URL}/products/code/${encodeURIComponent(productCode)}`);
        if (pRes.ok) {
          const p = await pRes.json();
          return { newQuantity: p.quantity };
        }
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      const prod = mockProducts.find(p => p.productCode.toLowerCase() === productCode.trim().toLowerCase());
      if (!prod) throw new Error(`Không tìm thấy mã sản phẩm ${productCode} trong kho`);
      if (prod.quantity < quantity) {
        throw new Error(`Số lượng tồn kho không đủ (Hiện còn: ${prod.quantity}, Yêu cầu xuất: ${quantity})`);
      }
      prod.quantity -= quantity;
      prod.updatedAt = new Date().toISOString();

      mockMovements.unshift({
        id: Date.now(),
        productCode: prod.productCode,
        name: prod.name,
        quantity,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        userId,
        userName: mockUsers.find(u => u.id === userId)?.username || 'Hệ thống',
        type: 'EXPORT',
      });

      return { newQuantity: prod.quantity };
    },

    async getHistory(productCode?: string, startDate?: string, endDate?: string): Promise<StockMovement[]> {
      try {
        const importParams = new URLSearchParams();
        const exportParams = new URLSearchParams();
        if (productCode) {
          importParams.append('productCode', productCode);
          exportParams.append('productCode', productCode);
        }
        if (startDate) {
          importParams.append('startDate', startDate);
          exportParams.append('startDate', startDate);
        }
        if (endDate) {
          importParams.append('endDate', endDate);
          exportParams.append('endDate', endDate);
        }

        const [importRes, exportRes] = await Promise.all([
          fetch(`${API_BASE_URL}/imports?${importParams.toString()}`).then(r => r.ok ? r.json() : []),
          fetch(`${API_BASE_URL}/exports?${exportParams.toString()}`).then(r => r.ok ? r.json() : []),
        ]);

        const imports: StockMovement[] = importRes.map((r: any) => ({
          id: r.id,
          productCode: r.productCode,
          name: r.name,
          quantity: r.quantity,
          date: r.importDate,
          time: r.importTime,
          userId: r.userId,
          type: 'IMPORT',
        }));

        const exports: StockMovement[] = exportRes.map((r: any) => ({
          id: r.id,
          productCode: r.productCode,
          name: r.name,
          quantity: r.quantity,
          date: r.exportDate,
          time: r.exportTime,
          userId: r.userId,
          type: 'EXPORT',
        }));

        const combined = [...imports, ...exports].sort((a, b) => {
          const dtA = `${a.date} ${a.time}`;
          const dtB = `${b.date} ${b.time}`;
          return dtB.localeCompare(dtA);
        });

        if (combined.length > 0) return combined;
      } catch {
        // Fallback
      }

      let filtered = [...mockMovements];
      if (productCode && productCode.trim()) {
        const code = productCode.trim().toLowerCase();
        filtered = filtered.filter(m => m.productCode.toLowerCase().includes(code) || m.name.toLowerCase().includes(code));
      }
      if (startDate) {
        filtered = filtered.filter(m => m.date >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter(m => m.date <= endDate);
      }
      return filtered;
    },

    // XÓA VĨNH VIỄN 1 BẢN GHI LỊCH SỬ NHẬP HOẶC XUẤT
    async deleteHistoryItem(id: number, type: 'IMPORT' | 'EXPORT'): Promise<void> {
      try {
        const endpoint = type === 'IMPORT' ? `${API_BASE_URL}/imports/${id}` : `${API_BASE_URL}/exports/${id}`;
        const res = await fetch(endpoint, { method: 'DELETE' });
        await handleResponse(res);
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      mockMovements = mockMovements.filter(m => !(m.id === id && m.type === type));
    },

    // XÓA VĨNH VIỄN TOÀN BỘ LỊCH SỬ (HOẶC THEO MÃ SẢN PHẨM)
    async clearHistory(productCode?: string): Promise<void> {
      try {
        if (productCode) {
          await Promise.all([
            fetch(`${API_BASE_URL}/imports/product/${encodeURIComponent(productCode)}`, { method: 'DELETE' }),
            fetch(`${API_BASE_URL}/exports/product/${encodeURIComponent(productCode)}`, { method: 'DELETE' }),
          ]);
        } else {
          await Promise.all([
            fetch(`${API_BASE_URL}/imports/clear`, { method: 'DELETE' }),
            fetch(`${API_BASE_URL}/exports/clear`, { method: 'DELETE' }),
          ]);
        }
      } catch (err: any) {
        if (err.message && err.message !== 'Failed to fetch') throw err;
      }
      if (productCode) {
        mockMovements = mockMovements.filter(m => m.productCode.toLowerCase() !== productCode.toLowerCase());
      } else {
        mockMovements = [];
      }
    },
  },
};
