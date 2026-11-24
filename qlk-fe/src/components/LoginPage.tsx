'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { BoxIcon, LockIcon, UserIcon, AlertCircleIcon, CheckIcon } from './Icons';

export const LoginPage: React.FC = () => {
  const { login, sessionMessage, clearSessionMessage } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    setError(null);
    clearSessionMessage();

    try {
      await login(username.trim(), password.trim());
      // Hệ thống sẽ tự động chuyển vào màn hình Quản lý Sản phẩm theo AuthContext
    } catch (err: any) {
      setError(err.message || 'Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <BoxIcon size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hệ Thống Quản Lý Kho
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Đăng nhập tài khoản để vào hệ thống kho hàng
          </p>
        </div>

        {/* Session Expired Message */}
        {sessionMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm rounded-xl flex items-start gap-2">
            <AlertCircleIcon size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <span>{sessionMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-start gap-2">
            <AlertCircleIcon size={18} className="shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="VD: quanly, nhanvien, admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <LockIcon size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Duy trì đăng nhập 1 ngày indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <CheckIcon size={16} className="text-emerald-600 shrink-0" />
            <span>Tự động duy trì phiên đăng nhập trong <strong>1 ngày (24 giờ)</strong></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY'}
          </button>
        </form>

      </div>
    </div>
  );
};
