'use client';

import React, { useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { api } from '@/lib/api';
import { parseAppError, FormattedError } from '@/lib/error-handler';
import {
  UserIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  LockIcon,
  UnlockIcon,
  SearchIcon,
  CloseIcon,
  AlertCircleIcon,
  CheckIcon,
  RefreshCwIcon,
} from './Icons';
import { ConfirmModal } from './ConfirmModal';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleId, setFormRoleId] = useState<number>(3); // Default: Nhân viên
  const [formStatus, setFormStatus] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback & Error Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [globalError, setGlobalError] = useState<FormattedError | null>(null);

  const showError = (err: any) => {
    const parsed = parseAppError(err);
    setGlobalError(parsed);
    setToast({
      message: parsed.message,
      type: 'error',
    });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const [userList, roleList] = await Promise.all([
        api.users.getAll(),
        api.roles.getAll(),
      ]);
      setUsers(userList);
      setRoles(roleList);
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormPassword('');
    setFormRoleId(roles.find(r => r.roleCode === 'STAFF')?.id || 3);
    setFormStatus(1);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormPassword('');
    setFormRoleId(u.roleId);
    setFormStatus(u.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      setFormError('Tên đăng nhập không được để trống');
      return;
    }

    if (!editingUser && !formPassword.trim()) {
      setFormError('Mật khẩu không được để trống khi tạo mới');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingUser) {
        const updated = await api.users.update(editingUser.id, {
          username: formUsername.trim(),
          password: formPassword.trim() || undefined,
          roleId: formRoleId,
          status: formStatus,
        });
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        showToast(`Đã cập nhật tài khoản [${updated.username}]`);
      } else {
        const created = await api.users.create({
          username: formUsername.trim(),
          password: formPassword.trim(),
          roleId: formRoleId,
        });
        setUsers(prev => [...prev, created]);
        showToast(`Đã thêm mới tài khoản [${created.username}]`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const parsed = parseAppError(err);
      setFormError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? 'mở khóa' : 'khóa';
    try {
      await api.users.toggleStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      showToast(`Đã ${actionText} tài khoản ${user.username}`);
    } catch (err: any) {
      showError(err);
    }
  };

  const handleExecuteDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.users.delete(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      showToast(`Đã xóa vĩnh viễn tài khoản [${userToDelete.username}]`);
      setUserToDelete(null);
    } catch (err: any) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    !searchQuery.trim() ||
    u.username.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    u.roleName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold max-w-md animate-bounce-short ${
          toast.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-rose-600 text-white shadow-rose-600/30'
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto opacity-80 hover:opacity-100">
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {globalError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-rose-800 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {globalError.isServerError ? 'Lỗi hệ thống máy chủ' : 'Thông báo lỗi'}
              </h4>
              <p className="text-xs sm:text-sm mt-0.5 font-medium">
                {globalError.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100"
          >
            <CloseIcon size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Tài Khoản Người Dùng
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-100 text-rose-700">
              Quyền Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Thêm, xóa vĩnh viễn, sửa thông tin và phân quyền vai trò người dùng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <PlusIcon size={16} />
            <span>Thêm tài khoản</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tài khoản theo tên đăng nhập hoặc vai trò..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Tên đăng nhập</th>
                <th className="py-3.5 px-4">Vai trò (Role)</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">{u.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                        {u.username.substring(0, 2)}
                      </div>
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                      u.roleCode === 'ADMIN' ? 'bg-rose-100 text-rose-700' :
                      u.roleCode === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.roleName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        u.status === 1 ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title="Bấm để Đổi trạng thái (Khóa/Mở khóa)"
                    >
                      {u.status === 1 ? <CheckIcon size={12} /> : <LockIcon size={12} />}
                      <span>{u.status === 1 ? 'Hoạt động' : 'Đã khóa'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Sửa thông tin tài khoản"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa vĩnh viễn tài khoản"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa tài khoản */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingUser ? `Chỉnh sửa tài khoản: ${editingUser.username}` : 'Thêm tài khoản người dùng mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircleIcon size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  placeholder="VD: quanly_kho1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder={editingUser ? 'Giữ nguyên mật khẩu hiện tại' : 'Nhập mật khẩu'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Vai trò (Role) *
                </label>
                <select
                  value={formRoleId}
                  onChange={e => setFormRoleId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.roleName} ({r.roleCode})
                    </option>
                  ))}
                </select>
              </div>

              {editingUser && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value={1}>1 - Đang hoạt động</option>
                    <option value={0}>0 - Đã bị khóa</option>
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : editingUser ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HỎI XÁC NHẬN: XÓA VĨNH VIỄN TÀI KHOẢN */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Xác nhận xóa vĩnh viễn tài khoản"
        message={`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản người dùng:\n• Tên đăng nhập: ${userToDelete?.username}\n• Vai trò: ${userToDelete?.roleName}\n\nTài khoản này sẽ không thể đăng nhập vào hệ thống nữa!`}
        confirmLabel="Xóa vĩnh viễn tài khoản"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
