'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LoginPage } from './LoginPage';
import { ProductManagement } from './ProductManagement';
import { UserManagement } from './UserManagement';
import { HistoryManagement } from './HistoryManagement';
import { CategoryManagement } from './CategoryManagement';
import {
  BoxIcon,
  UserIcon,
  HistoryIcon,
  LogOutIcon,
  RefreshCwIcon,
  CategoryIcon,
} from './Icons';
import { checkBackendHealth, getBackendStatus } from '@/lib/api';

export const MainLayout: React.FC = () => {
  const { user, isLoading, logout, isAdmin, isManager, isStaff } = useAuth();

  // Mặc định: Nhân viên & Quản lý vào thẳng màn hình Quản lý Sản phẩm (Bước 1)
  // Admin vào thẳng màn hình Quản lý Tài khoản
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'USERS' | 'HISTORY' | 'CATEGORIES'>('PRODUCTS');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      setActiveTab('USERS');
    } else {
      setActiveTab('PRODUCTS'); // Bước 1 theo đúng yêu cầu
    }
  }, [isAdmin, isManager, isStaff]);

  useEffect(() => {
    // Kiểm tra kết nối backend
    checkBackendHealth().then(status => setBackendOnline(status));
    const interval = setInterval(() => {
      checkBackendHealth().then(status => setBackendOnline(status));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Đang tải ứng dụng QLK...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> Hiển thị trang đăng nhập
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 pb-20 md:pb-6">
      {/* ================= TOP NAVBAR (Laptop & Desktop) ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & System Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <BoxIcon size={20} />
            </div>
            <div>
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                QLK <span className="text-blue-600 font-extrabold text-xs px-1.5 py-0.5 bg-blue-50 rounded-md">Smart Warehouse</span>
              </span>
            </div>
          </div>

          {/* Navigation Links for Laptop */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-semibold">
            {/* Tab Quản lý sản phẩm: Quản lý & Nhân viên */}
            {(!isAdmin || true) && (
              <button
                onClick={() => setActiveTab('PRODUCTS')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'PRODUCTS'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BoxIcon size={16} />
                <span>Quản Lý Sản Phẩm</span>
              </button>
            )}

            {/* Tab Lịch sử: Quản lý & Nhân viên */}
            {(!isAdmin || true) && (
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'HISTORY'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HistoryIcon size={16} />
                <span>Lịch Sử Nhập / Xuất</span>
              </button>
            )}

            {/* Tab Quản lý Danh mục: Chỉ Quản lý */}
            {isManager && (
              <button
                onClick={() => setActiveTab('CATEGORIES')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'CATEGORIES'
                    ? 'bg-white text-purple-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CategoryIcon size={16} />
                <span>Danh Mục</span>
              </button>
            )}

            {/* Tab Quản lý Tài khoản: Chỉ Admin */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('USERS')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'USERS'
                    ? 'bg-white text-rose-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon size={16} />
                <span>Quản Lý Tài Khoản (Admin)</span>
              </button>
            )}
          </nav>

          {/* Right Area: Status, User Badge, Logout */}
          <div className="flex items-center gap-3">
            {/* Backend connection status pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                backendOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title={backendOnline ? 'Đã kết nối máy chủ Spring Boot (8080)' : 'Chế độ Demo Offline (Sẵn sàng đồng bộ khi bật Spring Boot)'}
            >
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{backendOnline ? 'API 8080' : 'Demo Mode'}</span>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user.username}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {user.roleName}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Đăng xuất (Duy trì 1 ngày)"
            >
              <LogOutIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'PRODUCTS' && <ProductManagement />}
        {activeTab === 'HISTORY' && <HistoryManagement />}
        {activeTab === 'CATEGORIES' && (isManager ? <CategoryManagement /> : <div className="p-8 text-center text-slate-500 font-bold">Chỉ tài khoản Quản lý mới có quyền truy cập trang này.</div>)}
        {activeTab === 'USERS' && (isAdmin ? <UserManagement /> : <div className="p-8 text-center text-slate-500 font-bold">Chỉ tài khoản Admin mới có quyền truy cập trang này.</div>)}
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION (Điện thoại) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {/* Nút Sản phẩm (Bước 1 cho Nhân viên & Quản lý) */}
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
            activeTab === 'PRODUCTS'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BoxIcon size={20} />
          <span className="text-[10px]">Kho hàng</span>
        </button>

        {/* Nút Lịch sử */}
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
            activeTab === 'HISTORY'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <HistoryIcon size={20} />
          <span className="text-[10px]">Lịch sử</span>
        </button>

        {/* Nút Danh mục nếu là Quản lý */}
        {isManager && (
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
              activeTab === 'CATEGORIES'
                ? 'text-purple-600 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CategoryIcon size={20} />
            <span className="text-[10px]">Danh mục</span>
          </button>
        )}

        {/* Nút Admin nếu là Admin */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
              activeTab === 'USERS'
                ? 'text-rose-600 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon size={20} />
            <span className="text-[10px]">Tài khoản</span>
          </button>
        )}

        {/* Nút Đăng xuất */}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
        >
          <LogOutIcon size={20} />
          <span className="text-[10px]">Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
};
