'use client';

import React, { useState, useEffect } from 'react';
import { StockMovement } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { parseAppError, FormattedError } from '@/lib/error-handler';
import {
  HistoryIcon,
  SearchIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  RefreshCwIcon,
  TrashIcon,
  AlertCircleIcon,
  CloseIcon,
} from './Icons';
import { ConfirmModal } from './ConfirmModal';

export const HistoryManagement: React.FC = () => {
  const { isManager } = useAuth();

  const [history, setHistory] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<'ALL' | 'IMPORT' | 'EXPORT'>('ALL');
  const [searchProduct, setSearchProduct] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Confirmation Modals
  const [confirmDeleteSingle, setConfirmDeleteSingle] = useState<StockMovement | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast & Error banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isServerError?: boolean } | null>(null);
  const [globalError, setGlobalError] = useState<FormattedError | null>(null);

  const showError = (err: any) => {
    const parsed = parseAppError(err);
    setGlobalError(parsed);
    setToast({
      message: parsed.message,
      type: 'error',
      isServerError: parsed.isServerError,
    });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadHistory = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const records = await api.stock.getHistory(
        searchProduct.trim() || undefined,
        startDate || undefined,
        endDate || undefined
      );
      setHistory(records);
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory();
  };

  // XÓA VĨNH VIỄN 1 BẢN GHI LỊCH SỬ (Sau khi người dùng xác nhận)
  const handleExecuteDeleteSingle = async () => {
    if (!confirmDeleteSingle) return;
    setIsDeleting(true);
    try {
      await api.stock.deleteHistoryItem(confirmDeleteSingle.id, confirmDeleteSingle.type);
      setHistory(prev => prev.filter(item => !(item.id === confirmDeleteSingle.id && item.type === confirmDeleteSingle.type)));
      showToast(`Đã xóa vĩnh viễn phiếu ${confirmDeleteSingle.type === 'IMPORT' ? 'nhập' : 'xuất'} [${confirmDeleteSingle.productCode}]`);
      setConfirmDeleteSingle(null);
    } catch (err: any) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // XÓA VĨNH VIỄN TẤT CẢ LỊCH SỬ NHẬP XUẤT (Dành cho Quản lý sau khi người dùng xác nhận)
  const handleExecuteClearAll = async () => {
    setIsDeleting(true);
    try {
      await api.stock.clearHistory();
      setHistory([]);
      showToast('Đã xóa vĩnh viễn toàn bộ lịch sử nhập xuất kho!');
      setConfirmClearAll(false);
    } catch (err: any) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filterType === 'IMPORT' && item.type !== 'IMPORT') return false;
    if (filterType === 'EXPORT' && item.type !== 'EXPORT') return false;
    if (searchProduct.trim()) {
      const q = searchProduct.toLowerCase().trim();
      return item.productCode.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    }
    return true;
  });

  const totalImportQuantity = filteredHistory
    .filter(i => i.type === 'IMPORT')
    .reduce((sum, i) => sum + i.quantity, 0);

  const totalExportQuantity = filteredHistory
    .filter(i => i.type === 'EXPORT')
    .reduce((sum, i) => sum + i.quantity, 0);

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

      {/* Thông báo lỗi chi tiết nếu có */}
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
              {globalError.detail && globalError.detail !== globalError.message && (
                <p className="text-[11px] text-rose-600 mt-1 font-mono opacity-80">
                  Chi tiết: {globalError.detail}
                </p>
              )}
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

      {/* Header & Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lịch Sử Nhập & Xuất Kho
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-700">
              Nhật ký kho
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Theo dõi và quản lý lịch sử biến động số lượng hàng hóa trong kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* NÚT XÓA VĨNH VIỄN TOÀN BỘ LỊCH SỬ (DÀNH CHO QUẢN LÝ) */}
          {isManager && history.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Xóa vĩnh viễn toàn bộ lịch sử nhập xuất"
            >
              <TrashIcon size={16} />
              <span>Xóa tất cả lịch sử</span>
            </button>
          )}

          <button
            onClick={loadHistory}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownLeftIcon size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Tổng nhập</span>
            <span className="text-lg sm:text-xl font-black text-emerald-600">
              +{totalImportQuantity}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpRightIcon size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Tổng xuất</span>
            <span className="text-lg sm:text-xl font-black text-rose-600">
              -{totalExportQuantity}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HistoryIcon size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Số giao dịch</span>
            <span className="text-lg sm:text-xl font-black text-blue-600">
              {filteredHistory.length} lần
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Quick Tab switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'ALL' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('IMPORT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'IMPORT' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Chỉ Nhập
            </button>
            <button
              onClick={() => setFilterType('EXPORT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterType === 'EXPORT' ? 'bg-white shadow-xs text-rose-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Chỉ Xuất
            </button>
          </div>

          {/* Search by Product */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              value={searchProduct}
              onChange={e => setSearchProduct(e.target.value)}
              placeholder="Lọc theo mã hoặc tên sản phẩm..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </form>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-blue-500"
              title="Từ ngày"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-blue-500"
              title="Đến ngày"
            />
          </div>
        </div>
      </div>

      {/* History List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Loại giao dịch</th>
                <th className="py-3.5 px-4">Mã SP</th>
                <th className="py-3.5 px-4">Tên sản phẩm</th>
                <th className="py-3.5 px-4 text-center">Số lượng</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Người thực hiện</th>
                {isManager && <th className="py-3.5 px-4 text-center">Xóa</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="py-8 text-center text-slate-400 text-sm">
                    Không có bản ghi nhập xuất nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredHistory.map(item => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.type === 'IMPORT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.type === 'IMPORT' ? <ArrowDownLeftIcon size={14} /> : <ArrowUpRightIcon size={14} />}
                        <span>{item.type === 'IMPORT' ? 'NHẬP KHO' : 'XUẤT KHO'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {item.productCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`text-base font-black ${
                        item.type === 'IMPORT' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.type === 'IMPORT' ? `+${item.quantity}` : `-${item.quantity}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                      <div>{item.date}</div>
                      <div className="text-[11px] text-slate-400">{item.time}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.userName || `User #${item.userId}`}
                      </span>
                    </td>

                    {/* Nút Xóa vĩnh viễn 1 bản ghi (Dành cho Quản lý) */}
                    {isManager && (
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setConfirmDeleteSingle(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa vĩnh viễn bản ghi lịch sử này"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL HỎI XÁC NHẬN: XÓA VĨNH VIỄN 1 BẢN GHI LỊCH SỬ */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteSingle)}
        title="Xác nhận xóa vĩnh viễn bản ghi lịch sử"
        message={`Bạn có chắc chắn muốn XÓA VĨNH VIỄN phiếu ${confirmDeleteSingle?.type === 'IMPORT' ? 'NHẬP KHO' : 'XUẤT KHO'}:\n• Mã sản phẩm: ${confirmDeleteSingle?.productCode}\n• Tên sản phẩm: ${confirmDeleteSingle?.name}\n• Số lượng: ${confirmDeleteSingle?.quantity}\n• Thời gian: ${confirmDeleteSingle?.date} ${confirmDeleteSingle?.time}\n\nBản ghi này sẽ bị xóa sạch khỏi lịch sử và không thể khôi phục!`}
        confirmLabel="Xóa vĩnh viễn bản ghi"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDeleteSingle}
        onCancel={() => setConfirmDeleteSingle(null)}
      />

      {/* MODAL HỎI XÁC NHẬN: XÓA VĨNH VIỄN TOÀN BỘ LỊCH SỬ NHẬP XUẤT */}
      <ConfirmModal
        isOpen={confirmClearAll}
        title="CẢNH BÁO: Xóa vĩnh viễn TOÀN BỘ lịch sử kho"
        message={`Hành động này sẽ XÓA VĨNH VIỄN TOÀN BỘ (${history.length}) bản ghi lịch sử nhập xuất hàng trong hệ thống!\n\nToàn bộ nhật ký giao dịch trước đây sẽ biến mất hoàn toàn và KHÔNG THỂ KHÔI PHỤC.`}
        confirmLabel="Xóa toàn bộ lịch sử"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
};
