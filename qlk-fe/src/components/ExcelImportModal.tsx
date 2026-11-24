'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { CloseIcon, FileSpreadsheetIcon, UploadIcon, AlertCircleIcon, CheckIcon } from './Icons';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage({ text: 'Vui lòng chọn file Excel (.xlsx)', type: 'error' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    try {
      await api.products.importExcel(file);
      setStatusMessage({ text: 'Nhập sản phẩm từ file Excel thành công!', type: 'success' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Lỗi khi nhập file Excel', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheetIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Nhập sản phẩm từ file Excel</h3>
              <p className="text-xs text-slate-500">Dành cho tài khoản Quản lý kho</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center py-4">
              <UploadIcon size={32} className="text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {file ? file.name : 'Bấm vào đây để chọn file Excel (.xlsx)'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Định dạng file hỗ trợ: .xlsx, .xls'}
              </p>
            </div>
          </div>

          {/* Hướng dẫn định dạng cột */}
          <div className="text-xs text-slate-500 bg-blue-50/60 p-3 rounded-xl border border-blue-100 space-y-1">
            <p className="font-semibold text-blue-900">Cấu trúc các cột chuẩn trong file Excel:</p>
            <p>• Cột 1: Mã sản phẩm (VD: SP-001)</p>
            <p>• Cột 2: Tên sản phẩm (VD: Chuột Logitech)</p>
            <p>• Cột 3: ID danh mục (VD: 1)</p>
            <p>• Cột 4: Số lượng tồn kho ban đầu (VD: 50)</p>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? <CheckIcon size={18} /> : <AlertCircleIcon size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <UploadIcon size={16} />
            <span>{isUploading ? 'Đang tải lên...' : 'Tải lên & Nhập kho'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
