'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { CloseIcon, PlusIcon, MinusIcon, ArrowDownLeftIcon, ArrowUpRightIcon, AlertCircleIcon } from './Icons';

interface QuickMovementModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product, type: 'IMPORT' | 'EXPORT', quantity: number) => void;
  currentUserId: number;
}

export const QuickMovementModal: React.FC<QuickMovementModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when opened for a product
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleQuickAdd = (amount: number) => {
    setQuantity(prev => Math.max(1, (prev || 0) + amount));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val <= 0) {
      setQuantity(1);
    } else {
      setQuantity(val);
    }
    setError(null);
  };

  // Nút NHẬP MÀU XANH LÁ
  const handleImport = async () => {
    if (quantity <= 0) {
      setError('Số lượng nhập phải lớn hơn 0');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.stock.importStock(product.productCode, quantity, currentUserId);
      const updated: Product = { ...product, quantity: res.newQuantity };
      onSuccess(updated, 'IMPORT', quantity);
      onClose(); // Tự động lưu và quay lại danh sách đang tìm kiếm
    } catch (err: any) {
      setError(err.message || 'Lỗi khi nhập kho');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nút XUẤT MÀU ĐỎ
  const handleExport = async () => {
    if (quantity <= 0) {
      setError('Số lượng xuất phải lớn hơn 0');
      return;
    }
    if (quantity > product.quantity) {
      setError(`Số lượng xuất (${quantity}) vượt quá tồn kho hiện tại (${product.quantity})!`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.stock.exportStock(product.productCode, quantity, currentUserId);
      const updated: Product = { ...product, quantity: res.newQuantity };
      onSuccess(updated, 'EXPORT', quantity);
      onClose(); // Tự động lưu và quay lại danh sách đang tìm kiếm
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xuất kho');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card (Bottom Sheet on mobile, Centered Modal on laptop) */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">
                {product.productCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {product.categoryName || 'Sản phẩm'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 line-clamp-2">
              {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Đóng (Hủy)"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Tồn kho hiện tại */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Tồn kho hiện tại:</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-extrabold ${product.quantity <= 5 ? 'text-rose-600' : product.quantity <= 15 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {product.quantity}
              </span>
              <span className="text-xs text-slate-500 font-medium">sản phẩm</span>
            </div>
          </div>

          {/* Ô nhập số lượng thao tác */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Số lượng cần Nhập hoặc Xuất:
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold transition-all"
                title="Giảm 1"
              >
                <MinusIcon size={20} />
              </button>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleInputChange}
                className="flex-1 h-12 text-center text-2xl font-bold text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden transition-colors"
              />

              <button
                type="button"
                onClick={() => setQuantity(prev => prev + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold transition-all"
                title="Tăng 1"
              >
                <PlusIcon size={20} />
              </button>
            </div>

            {/* Quick add pill buttons */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {[5, 10, 50, 100].map(qty => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => handleQuickAdd(qty)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg active:scale-95 transition-all"
                >
                  +{qty}
                </button>
              ))}
            </div>
          </div>

          {/* Dự kiến tồn kho sau khi thao tác */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-800 flex flex-col items-center">
              <span>Nếu Nhập kho:</span>
              <strong className="text-base font-bold text-emerald-700">
                {product.quantity + quantity}
              </strong>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100 text-rose-800 flex flex-col items-center">
              <span>Nếu Xuất kho:</span>
              <strong className={`text-base font-bold ${product.quantity - quantity < 0 ? 'text-rose-600' : 'text-rose-700'}`}>
                {product.quantity - quantity < 0 ? 'Không đủ hàng' : product.quantity - quantity}
              </strong>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
              <AlertCircleIcon size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions: Yêu cầu chính xác 3 nút màu sắc */}
        <div className="p-5 pt-3 bg-slate-50/80 border-t border-slate-100 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            {/* 1. NÚT NHẬP MÀU XANH LÁ */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleImport}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <ArrowDownLeftIcon size={20} />
              <span>NHẬP KHO</span>
            </button>

            {/* 2. NÚT XUẤT MÀU ĐỎ */}
            <button
              type="button"
              disabled={isSubmitting || quantity > product.quantity}
              onClick={handleExport}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowUpRightIcon size={20} />
              <span>XUẤT KHO</span>
            </button>
          </div>

          {/* 3. NÚT HỦY MÀU XÁM */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 active:scale-98 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>HỦY (Quay lại danh sách)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
