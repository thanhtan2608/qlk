'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import { api } from '@/lib/api';
import { parseAppError, FormattedError } from '@/lib/error-handler';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  CloseIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  CategoryIcon,
} from './Icons';
import { ConfirmModal } from './ConfirmModal';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Thêm / Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Modal
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Toast / Error
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [globalError, setGlobalError] = useState<FormattedError | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const showError = (err: any) => {
    const parsed = parseAppError(err);
    setGlobalError(parsed);
    showToast(parsed.message, 'error');
  };

  const loadData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const list = await api.categories.getAll();
      setCategories(list);
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ===== MODAL THÊM / SỬA ===== */
  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDesc('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.categoryName);
    setFormDesc(cat.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Tên danh mục không được để trống');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingCategory) {
        const updated = await api.categories.update(editingCategory.id, {
          categoryName: formName.trim(),
          description: formDesc.trim(),
        });
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
        showToast(`Đã cập nhật danh mục [${updated.categoryName}]`);
      } else {
        const created = await api.categories.create({
          categoryName: formName.trim(),
          description: formDesc.trim(),
        });
        setCategories(prev => [...prev, created]);
        showToast(`Đã thêm danh mục [${created.categoryName}]`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const parsed = parseAppError(err);
      setFormError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===== XÓA 1 DANH MỤC ===== */
  const handleDeleteOne = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await api.categories.delete(categoryToDelete.id);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      showToast(`Đã xóa danh mục [${categoryToDelete.categoryName}]`);
      setCategoryToDelete(null);
    } catch (err: any) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  /* ===== XÓA TẤT CẢ DANH MỤC ===== */
  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await api.categories.deleteAll();
      setCategories([]);
      showToast('Đã xóa vĩnh viễn tất cả danh mục');
      setShowDeleteAll(false);
    } catch (err: any) {
      showError(err);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filtered = categories.filter(c =>
    !searchQuery.trim() ||
    c.categoryName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
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

      {/* Global Error */}
      {globalError && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-rose-800 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">{globalError.isServerError ? 'Lỗi hệ thống' : 'Thông báo lỗi'}</h4>
              <p className="text-xs mt-0.5 font-medium">{globalError.message}</p>
            </div>
          </div>
          <button onClick={() => setGlobalError(null)} className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100">
            <CloseIcon size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Danh Mục Sản Phẩm
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-700">
              Quyền Quản Lý
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Thêm, sửa, xóa danh mục sản phẩm trong kho hàng
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <PlusIcon size={16} />
            <span>Thêm danh mục</span>
          </button>

          <button
            onClick={() => setShowDeleteAll(true)}
            disabled={categories.length === 0}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <TrashIcon size={16} />
            <span>Xóa tất cả</span>
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

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-purple-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="text-2xl font-black text-purple-600">{categories.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Tổng danh mục</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="text-2xl font-black text-slate-700">{filtered.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Kết quả tìm kiếm</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-sm font-semibold">Đang tải danh mục...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <CategoryIcon size={40} className="opacity-30" />
            <p className="text-sm font-semibold">
              {searchQuery ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
            </p>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="mt-1 px-4 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-95 transition-all cursor-pointer"
              >
                + Thêm danh mục đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Tên danh mục</th>
                  <th className="py-3.5 px-4">Mô tả</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">{cat.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs text-white"
                          style={{ background: `hsl(${(idx * 67) % 360}, 65%, 55%)` }}
                        >
                          {cat.categoryName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{cat.categoryName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs max-w-xs truncate">
                      {cat.description || <span className="italic text-slate-300">Chưa có mô tả</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa danh mục"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa vĩnh viễn danh mục"
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
        )}
      </div>

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? `Sửa danh mục: ${editingCategory.categoryName}` : 'Thêm danh mục mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircleIcon size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="VD: Điện tử & Linh kiện"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="VD: Thiết bị điện tử, linh kiện máy tính, phụ kiện..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white focus:border-purple-500 focus:outline-hidden"
                />
              </div>

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
                  className="px-5 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Xóa 1 */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc muốn XÓA VĨNH VIỄN danh mục:\n• Tên: ${categoryToDelete?.categoryName}\n• Mô tả: ${categoryToDelete?.description || 'Không có'}\n\nCác sản phẩm thuộc danh mục này sẽ không còn được phân loại!`}
        confirmLabel="Xóa vĩnh viễn"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteOne}
        onCancel={() => setCategoryToDelete(null)}
      />

      {/* Confirm Xóa Tất Cả */}
      <ConfirmModal
        isOpen={showDeleteAll}
        title="Xóa vĩnh viễn TẤT CẢ danh mục"
        message={`Bạn có chắc muốn XÓA VĨNH VIỄN toàn bộ ${categories.length} danh mục?\n\nTất cả sản phẩm sẽ mất phân loại danh mục!\nHành động này KHÔNG THỂ hoàn tác!`}
        confirmLabel={`Xóa tất cả ${categories.length} danh mục`}
        confirmVariant="danger"
        isLoading={isDeletingAll}
        onConfirm={handleDeleteAll}
        onCancel={() => setShowDeleteAll(false)}
      />
    </div>
  );
};
