'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { api } from '@/lib/api';
import { CloseIcon, AlertCircleIcon, BoxIcon } from './Icons';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product, isNew: boolean) => void;
  productToEdit?: Product | null;
  categories: Category[];
  initialSearchTerm?: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
  categories,
  initialSearchTerm = '',
}) => {
  const [productCode, setProductCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [initialQuantity, setInitialQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(productToEdit);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setProductCode(productToEdit.productCode);
        setName(productToEdit.name);
        setCategoryId(productToEdit.categoryId || categories[0]?.id || 1);
        setInitialQuantity(productToEdit.quantity);
      } else {
        // Tạo mã SP ngẫu nhiên nếu thêm mới
        const randomCode = `SP-${Math.floor(100 + Math.random() * 900)}`;
        setProductCode(randomCode);
        setName(initialSearchTerm || '');
        setCategoryId(categories[0]?.id || 1);
        setInitialQuantity(10);
      }
      setError(null);
    }
  }, [isOpen, productToEdit, categories, initialSearchTerm]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode.trim()) {
      setError('Mã sản phẩm không được để trống');
      return;
    }
    if (!name.trim()) {
      setError('Tên sản phẩm không được để trống');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && productToEdit) {
        const updated = await api.products.update(productToEdit.id, {
          productCode: productCode.trim(),
          name: name.trim(),
          categoryId,
        });
        onSuccess(updated, false);
      } else {
        const created = await api.products.create({
          productCode: productCode.trim(),
          name: name.trim(),
          categoryId,
          initialQuantity,
        });
        onSuccess(created, true);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BoxIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Cập nhật thông tin sản phẩm' : 'Thêm sản phẩm mới vào kho'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing ? `Đang chỉnh sửa mã ${productToEdit?.productCode}` : 'Dành cho quyền Quản lý'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircleIcon size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mã sản phẩm *
            </label>
            <input
              type="text"
              required
              value={productCode}
              onChange={e => setProductCode(e.target.value)}
              placeholder="VD: SP-001"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Chuột không dây Logitech"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Danh mục
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Số lượng ban đầu trong kho
              </label>
              <input
                type="number"
                min="0"
                value={initialQuantity}
                onChange={e => setInitialQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
