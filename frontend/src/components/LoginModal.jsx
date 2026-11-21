import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Dumbbell, Lock, User, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff,
  UserCheck, Building, KeyRound
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenDangNhap || !matKhau) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(tenDangNhap, matKhau);
      if (res.success) {
        onLoginSuccess(res.user);
        if (onClose) onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username, password) => {
    setTenDangNhap(username);
    setMatKhau(password);
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(username, password);
      if (res.success) {
        onLoginSuccess(res.user);
        if (onClose) onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    onLoginSuccess({
      role: 'khach-hang',
      id: 'GUEST',
      hoTen: 'Khách Vãng Lai',
      tenDangNhap: 'guest'
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative">
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shadow-md">
                <Dumbbell className="w-5 h-5 -rotate-12" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                GYM<span className="text-orange-400">SPACE</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full text-blue-100 uppercase tracking-wider">
                Xác Thực
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold transition ml-1"
                title="Đóng cửa sổ (Tiếp tục với tư cách Khách Hàng)"
              >
                ✕
              </button>
            </div>
          </div>

          <h3 className="text-xl font-black text-white mt-2">
            Đăng Nhập Hệ Thống
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            Phân quyền tự động theo vai trò: <strong>Nhân Viên</strong> hoặc <strong>Hội Viên</strong>
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Đăng Nhập / Mã Định Danh
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: nv005 hoặc nguyenan"
                  value={tenDangNhap}
                  onChange={(e) => setTenDangNhap(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật Khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu"
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  className="w-full text-xs pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Quick-fill Demo Presets */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              ⚡ Tài Khoản Mẫu Kiểm Thử Nhanh (1 Click):
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('nv005', '123456')}
                className="p-2.5 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/70 rounded-xl text-left transition flex flex-col"
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-800">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Nhân Viên</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">nv005 / 123456</span>
                <span className="text-[10px] text-indigo-700 font-semibold truncate">Nhân Viên Lễ Tân (NV005)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('nguyenan', '123456')}
                className="p-2.5 bg-orange-50/70 hover:bg-orange-100 text-orange-900 border border-orange-200/70 rounded-xl text-left transition flex flex-col"
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-orange-800">
                  <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>Hội Viên</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">nguyenan / 123456</span>
                <span className="text-[10px] text-orange-700 font-semibold truncate">Hội Viên Tiêu Biểu (HV001)</span>
              </button>
            </div>
          </div>

          {/* Public Guest Access Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tiếp Tục Với Tư Cách Khách Hàng (Không cần đăng nhập)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
