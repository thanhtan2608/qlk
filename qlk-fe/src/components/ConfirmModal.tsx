'use client';

import React from 'react';
import { AlertCircleIcon, CloseIcon, TrashIcon } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận xóa vĩnh viễn',
  cancelLabel = 'Hủy bỏ',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={isLoading ? undefined : onCancel} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-5 pb-3 flex items-start gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            confirmVariant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <AlertCircleIcon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Vui lòng xác nhận hành động
            </p>
          </div>
          <button
            onClick={isLoading ? undefined : onCancel}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Message Body */}
        <div className="px-5 py-3 text-sm text-slate-600 leading-relaxed bg-slate-50/70 border-y border-slate-100">
          <p className="whitespace-pre-line">{message}</p>
          {confirmVariant === 'danger' && (
            <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center gap-1">
              <span>⚠️ Cảnh báo: Dữ liệu bị xóa vĩnh viễn sẽ không thể phục hồi!</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-white flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </span>
            ) : (
              <>
                <TrashIcon size={16} />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
