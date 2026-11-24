'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, Category } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { parseAppError, FormattedError } from '@/lib/error-handler';
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  FileSpreadsheetIcon,
  DownloadIcon,
  RefreshCwIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  AlertCircleIcon,
  BoxIcon,
  CloseIcon,
  SmartphoneIcon,
  LaptopIcon,
} from './Icons';
import { QuickMovementModal } from './QuickMovementModal';
import { ProductFormModal } from './ProductFormModal';
import { ExcelImportModal } from './ExcelImportModal';
import { ConfirmModal } from './ConfirmModal';

export const ProductManagement: React.FC = () => {
  const { user, isManager, isStaff } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Bước 2: Gõ tìm kiếm nhanh tên sản phẩm
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK'>('ALL');

  // Modal Bước 3: Nhập / Xuất nhanh
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [isMovementOpen, setIsMovementOpen] = useState(false);

  // Modals Quản lý
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isExcelOpen, setIsExcelOpen] = useState(false);

  // Confirmation Modals (Hỏi người dùng trước khi xóa vĩnh viễn)
  const [confirmDeleteSingle, setConfirmDeleteSingle] = useState<Product | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast & Error banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error'; isServerError?: boolean } | null>(null);
  const [globalError, setGlobalError] = useState<FormattedError | null>(null);

  // Chế độ hiển thị: Mobile Card hoặc Laptop Table
  const [viewLayout, setViewLayout] = useState<'auto' | 'mobile' | 'laptop'>('auto');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const showError = (err: any) => {
    const parsed = parseAppError(err);
    setGlobalError(parsed);
    setToast({
      message: parsed.message,
      type: 'error',
      isServerError: parsed.isServerError,
    });
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const [prods, cats] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lọc sản phẩm theo từ khóa tìm kiếm (Bước 2: Instant Search)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchQuery.trim().toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || p.categoryId === selectedCategory;

      const matchStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW' && p.quantity <= 10) ||
        (stockFilter === 'IN_STOCK' && p.quantity > 0);

      return matchQuery && matchCategory && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Thao tác Bước 2 -> Bước 3: Mở modal Nhập / Xuất
  const handleOpenMovement = (product: Product) => {
    setMovementProduct(product);
    setIsMovementOpen(true);
  };

  // Callback sau khi Bước 3 hoàn thành thành công (Tự động lưu và cập nhật tồn kho)
  const handleMovementSuccess = (updatedProduct: Product, type: 'IMPORT' | 'EXPORT', quantity: number) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    const actionText = type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho';
    showToast(`✓ Đã ${actionText} thành công ${quantity} sản phẩm [${updatedProduct.productCode}]! Tồn kho mới: ${updatedProduct.quantity}`);
  };

  // XÓA VĨNH VIỄN 1 SẢN PHẨM (Sau khi người dùng xác nhận)
  const handleExecuteDeleteSingle = async () => {
    if (!confirmDeleteSingle) return;
    setIsDeleting(true);
    try {
      await api.products.delete(confirmDeleteSingle.id);
      setProducts(prev => prev.filter(p => p.id !== confirmDeleteSingle.id));
      showToast(`Đã xóa vĩnh viễn sản phẩm [${confirmDeleteSingle.productCode}] ${confirmDeleteSingle.name}`);
      setConfirmDeleteSingle(null);
    } catch (err: any) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // XÓA VĨNH VIỄN TẤT CẢ SẢN PHẨM (Dành cho Quản lý sau khi người dùng xác nhận)
  const handleExecuteDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await api.products.deleteAll();
      setProducts([]);
      showToast('Đã xóa vĩnh viễn tất cả sản phẩm trong kho!');
      setConfirmDeleteAll(false);
    } catch (err: any) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quản lý xuất Excel / CSV
  const handleExportExcel = () => {
    try {
      window.open(api.products.getExportExcelUrl(), '_blank');
      showToast('Đang tải file Excel danh sách sản phẩm...');
    } catch (err: any) {
      showError(err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-short text-sm font-semibold max-w-md ${
          toast.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/30' :
          toast.type === 'error' ? 'bg-rose-600 text-white shadow-rose-600/30' :
          'bg-slate-800 text-white'
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

      {/* Header & Quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Kho Hàng
            </h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              isManager ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isManager ? 'Quyền Quản lý' : 'Quyền Nhân viên'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isManager
              ? 'Toàn quyền thêm, sửa, xóa vĩnh viễn, nhập xuất kho & xuất file Excel'
              : 'Thao tác nhập/xuất số lượng sản phẩm nhanh chóng'}
          </p>
        </div>

        {/* Quick action buttons for Manager */}
        <div className="flex flex-wrap items-center gap-2">
          {isManager && (
            <>
              <button
                onClick={() => {
                  setProductToEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <PlusIcon size={16} />
                <span>Thêm sản phẩm</span>
              </button>

              <button
                onClick={() => setIsExcelOpen(true)}
                className="px-3 py-2 text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                title="Nhập sản phẩm từ file Excel"
              >
                <FileSpreadsheetIcon size={16} />
                <span>Nhập Excel</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="px-3 py-2 text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                title="Xuất file Excel toàn bộ sản phẩm"
              >
                <DownloadIcon size={16} />
                <span>Xuất Excel</span>
              </button>

              {/* NÚT XÓA VĨNH VIỄN TẤT CẢ SẢN PHẨM (DÀNH CHO QUẢN LÝ) */}
              {products.length > 0 && (
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="px-3 py-2 text-xs sm:text-sm font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  title="Xóa vĩnh viễn tất cả sản phẩm trong kho"
                >
                  <TrashIcon size={16} />
                  <span>Xóa tất cả SP</span>
                </button>
              )}
            </>
          )}

          {/* Nút chuyển đổi xem giao diện giả lập Mobile / Laptop */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewLayout('auto')}
              className={`px-2.5 py-1 rounded-lg transition-all ${viewLayout === 'auto' ? 'bg-white shadow-xs text-blue-600' : 'hover:text-slate-900'}`}
            >
              Tự động
            </button>
            <button
              onClick={() => setViewLayout('mobile')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${viewLayout === 'mobile' ? 'bg-white shadow-xs text-blue-600' : 'hover:text-slate-900'}`}
              title="Xem mô phỏng chế độ Mobile"
            >
              <SmartphoneIcon size={14} /> Mobile
            </button>
            <button
              onClick={() => setViewLayout('laptop')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${viewLayout === 'laptop' ? 'bg-white shadow-xs text-blue-600' : 'hover:text-slate-900'}`}
              title="Xem chế độ Laptop Table"
            >
              <LaptopIcon size={14} /> Laptop
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ================= BƯỚC 2: THANH GÕ TÌM KIẾM NHANH TÊN SẢN PHẨM ================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <SearchIcon size={20} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Gõ tìm nhanh tên sản phẩm hoặc mã sản phẩm..."
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Filter chips (Danh mục & Tồn kho) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả danh mục ({products.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.categoryName}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 shrink-0 mx-1" />

          <button
            onClick={() => setStockFilter(stockFilter === 'LOW' ? 'ALL' : 'LOW')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              stockFilter === 'LOW'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Sắp hết hàng (≤ 10)
          </button>
        </div>
      </div>

      {/* ================= KHÔNG TÌM THẤY SẢN PHẨM ================= */}
      {filteredProducts.length === 0 && searchQuery.trim() !== '' && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircleIcon size={26} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Không tìm thấy sản phẩm &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
              {isStaff ? (
                <span className="text-rose-700 font-semibold block">
                  Sản phẩm chưa có trong hệ thống kho. Tài khoản Nhân viên không có quyền tạo mới. Vui lòng liên hệ tài khoản Quản lý để thêm sản phẩm!
                </span>
              ) : (
                <span>
                  Sản phẩm chưa có trong danh mục kho. Bạn có quyền Quản lý nên có thể bấm nút dưới đây để tạo mới ngay lập tức.
                </span>
              )}
            </p>
          </div>

          {isManager && (
            <button
              onClick={() => {
                setProductToEdit(null);
                setIsFormOpen(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <PlusIcon size={18} />
              <span>Thêm sản phẩm &quot;{searchQuery}&quot; mới</span>
            </button>
          )}
        </div>
      )}

      {/* ================= DANH SÁCH SẢN PHẨM ================= */}
      {/* 1. HIỂN THỊ DẠNG THẺ (CARD VIEW) - Tối ưu cho Mobile */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 ${
        viewLayout === 'laptop' ? 'hidden' : viewLayout === 'mobile' ? 'block' : 'md:hidden'
      }`}>
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-md">
                  {product.productCode}
                </span>
                <span className="text-xs font-medium text-slate-500 line-clamp-1">
                  {product.categoryName}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                {product.name}
              </h3>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Tồn kho</span>
                <span className={`text-xl font-black ${
                  product.quantity <= 5 ? 'text-rose-600' : product.quantity <= 15 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {product.quantity}
                </span>
              </div>

              {/* BƯỚC 2 -> BƯỚC 3: Bấm nút chọn sản phẩm cần nhập hoặc xuất */}
              <button
                type="button"
                onClick={() => handleOpenMovement(product)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowDownLeftIcon size={16} />
                <span>Nhập / Xuất</span>
              </button>
            </div>

            {/* Quản lý nút Sửa / Xóa vĩnh viễn */}
            {isManager && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => {
                    setProductToEdit(product);
                    setIsFormOpen(true);
                  }}
                  className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <EditIcon size={14} /> Sửa
                </button>
                <button
                  onClick={() => setConfirmDeleteSingle(product)}
                  className="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors font-semibold"
                >
                  <TrashIcon size={14} /> Xóa vĩnh viễn
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 2. HIỂN THỊ DẠNG BẢNG (TABLE VIEW) - Tối ưu cho Laptop */}
      <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden ${
        viewLayout === 'mobile' ? 'hidden' : viewLayout === 'laptop' ? 'block' : 'hidden md:block'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Mã SP</th>
                <th className="py-3.5 px-4">Tên sản phẩm</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4 text-center">Số lượng tồn</th>
                <th className="py-3.5 px-4 text-right">Thao tác Nhập / Xuất</th>
                {isManager && <th className="py-3.5 px-4 text-center">Quản lý</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {product.productCode}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {product.name}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {product.categoryName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                      product.quantity <= 5
                        ? 'bg-rose-100 text-rose-700'
                        : product.quantity <= 15
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {product.quantity}
                    </span>
                  </td>

                  {/* BƯỚC 2 -> BƯỚC 3: Nút chọn sản phẩm để Nhập / Xuất */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenMovement(product)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <ArrowDownLeftIcon size={14} />
                      <span>Nhập / Xuất</span>
                    </button>
                  </td>

                  {/* Quản lý sửa / xóa vĩnh viễn */}
                  {isManager && (
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setProductToEdit(product);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa thông tin sản phẩm"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteSingle(product)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa vĩnh viễn sản phẩm"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL BƯỚC 3: FORM NHẬP / XUẤT NHANH ================= */}
      <QuickMovementModal
        product={movementProduct}
        isOpen={isMovementOpen}
        onClose={() => {
          setIsMovementOpen(false);
          setTimeout(() => searchInputRef.current?.focus(), 150);
        }}
        onSuccess={handleMovementSuccess}
        currentUserId={user?.id || 1}
      />

      {/* Modal Thêm / Sửa sản phẩm (Dành cho Quản lý) */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={(product, isNew) => {
          if (isNew) {
            setProducts(prev => [product, ...prev]);
            showToast(`Đã thêm sản phẩm [${product.productCode}] ${product.name}`);
          } else {
            setProducts(prev => prev.map(p => p.id === product.id ? product : p));
            showToast(`Đã cập nhật sản phẩm [${product.productCode}]`);
          }
        }}
        productToEdit={productToEdit}
        categories={categories}
        initialSearchTerm={searchQuery}
      />

      {/* Modal Nhập Excel (Dành cho Quản lý) */}
      <ExcelImportModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        onSuccess={() => {
          loadData();
          showToast('Đã nhập dữ liệu từ Excel thành công!');
        }}
      />

      {/* MODAL HỎI XÁC NHẬN: XÓA VĨNH VIỄN 1 SẢN PHẨM */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteSingle)}
        title="Xác nhận xóa vĩnh viễn sản phẩm"
        message={`Bạn có chắc chắn muốn XÓA VĨNH VIỄN sản phẩm:\n• Mã: ${confirmDeleteSingle?.productCode}\n• Tên: ${confirmDeleteSingle?.name}\n\nToàn bộ dữ liệu tồn kho và lịch sử nhập xuất của sản phẩm này sẽ bị xóa sạch khỏi hệ thống!`}
        confirmLabel="Xóa vĩnh viễn sản phẩm"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDeleteSingle}
        onCancel={() => setConfirmDeleteSingle(null)}
      />

      {/* MODAL HỎI XÁC NHẬN: XÓA VĨNH VIỄN TẤT CẢ SẢN PHẨM */}
      <ConfirmModal
        isOpen={confirmDeleteAll}
        title="CẢNH BÁO NGUY HIỂM: Xóa vĩnh viễn TẤT CẢ sản phẩm"
        message={`Hành động này sẽ XÓA VĨNH VIỄN TOÀN BỘ (${products.length}) SẢN PHẨM trong kho!\n\nToàn bộ số lượng tồn kho và lịch sử giao dịch liên quan sẽ bị xóa sạch hoàn toàn.`}
        confirmLabel="Xóa tất cả sản phẩm"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
};
