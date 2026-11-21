import React, { useState, useEffect } from 'react';
import { 
  UserPlus, User, Phone, Mail, Lock, Calendar, 
  CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff,
  Search, ShieldCheck, Sparkles, CreditCard, X
} from 'lucide-react';
import { api } from '../services/api';

export default function TaoTaiKhoan({ prefillData, onClearPrefill }) {
  const [formData, setFormData] = useState({
    hoTen: prefillData?.hoTen || '',
    soDienThoai: prefillData?.soDienThoai || '',
    email: prefillData?.email || '',
    ngaySinh: '1998-01-01',
    gioiTinh: 'Nam',
    tenDangNhap: prefillData?.soDienThoai ? `hv_${prefillData.soDienThoai.slice(-6)}` : '',
    matKhau: '123456'
  });
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdMember, setCreatedMember] = useState(null);
  const [memberList, setMemberList] = useState([]);

  const loadMembers = async () => {
    try {
      const res = await api.searchMembers('');
      if (res.success) setMemberList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        hoTen: prefillData.hoTen || prev.hoTen,
        soDienThoai: prefillData.soDienThoai || prev.soDienThoai,
        email: prefillData.email || prev.email,
        tenDangNhap: prefillData.soDienThoai ? `hv_${prefillData.soDienThoai.slice(-6)}` : prev.tenDangNhap
      }));
    }
  }, [prefillData]);

  const handleCheckUsername = async (val) => {
    setFormData(prev => ({ ...prev, tenDangNhap: val }));
    if (!val.trim()) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await api.checkUsername(val);
      if (res.success) {
        setUsernameStatus(res.available ? 'available' : 'taken');
      }
    } catch {
      setUsernameStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hoTen.trim() || !formData.soDienThoai.trim() || !formData.tenDangNhap.trim() || !formData.matKhau) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.soDienThoai.trim())) {
      setError('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng 0).');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Tên đăng nhập đã tồn tại trong CSDL! Vui lòng chọn tên đăng nhập khác.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.createMember({
        ...formData,
        maHoaDon: prefillData?.maHoaDon || null,
        maNhanVien: 'NV005'
      });

      if (res.success) {
        setCreatedMember(res.data);
        loadMembers();
        setFormData({
          hoTen: '',
          soDienThoai: '',
          email: '',
          ngaySinh: '1998-01-01',
          gioiTinh: 'Nam',
          tenDangNhap: '',
          matKhau: '123456'
        });
        setUsernameStatus(null);
        if (onClearPrefill) onClearPrefill();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Tạo tài khoản hội viên mới</h2>
            <p className="text-xs text-slate-500">Tự động phát sinh mã HV, mã hóa mật khẩu và liên kết CSDL KhachHang</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="badge-neutral font-mono">Module: Quản Lý Hội Viên</span>
          <span className="badge-active">Nhân viên: NV005</span>
        </div>
      </div>

      {/* Prefill from POS Invoice Banner */}
      {prefillData && prefillData.maHoaDon && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-blue-900 text-sm flex items-center gap-2">
                <span>Liên Kết Hóa Đơn Thanh Toán:</span>
                <span className="font-mono bg-blue-600 text-white px-2 py-0.5 rounded text-xs">{prefillData.maHoaDon}</span>
              </div>
              <p className="text-blue-800 mt-1 leading-relaxed">
                Đang tạo tài khoản hội viên cho khách hàng <strong>{prefillData.hoTen}</strong> ({prefillData.soDienThoai}). Vui lòng kiểm tra thông tin và thiết lập tài khoản đăng nhập để hệ thống tự động kích hoạt thẻ hội viên và các gói tập đã mua.
              </p>
            </div>
          </div>
          {onClearPrefill && (
            <button
              onClick={onClearPrefill}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Hủy liên kết hóa đơn"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-lg text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Grid: 7 cols Form, 5 cols Member Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Thông Tin Cá Nhân & Tài Khoản
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">(*) Bắt buộc</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Full name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label-pro">Họ và Tên Hội Viên (*)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  required
                  className="form-input-pro"
                />
              </div>

              <div>
                <label className="form-label-pro">Số Điện Thoại (* 10 số)</label>
                <input
                  type="text"
                  placeholder="0912345678"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  required
                  className="form-input-pro font-mono"
                />
              </div>
            </div>

            {/* Row 2: Email & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label-pro">Email Liên Hệ</label>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input-pro"
                />
              </div>

              <div>
                <label className="form-label-pro">Giới Tính</label>
                <select
                  value={formData.gioiTinh}
                  onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                  className="form-input-pro"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            {/* Row 3: Account Credentials */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Thiết Lập Tài Khoản Đăng Nhập Hệ Thống
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-pro">Tên Đăng Nhập (*)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="hv_nguyenvanan"
                      value={formData.tenDangNhap}
                      onChange={(e) => handleCheckUsername(e.target.value)}
                      required
                      className="form-input-pro font-mono bg-white pr-20"
                    />
                    {usernameStatus === 'checking' && (
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">Kiểm tra...</span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="absolute right-3 top-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Khả dụng
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="absolute right-3 top-2 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        Đã tồn tại
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label-pro">Mật Khẩu Ban Đầu (*)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.matKhau}
                      onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                      required
                      className="form-input-pro font-mono bg-white pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || usernameStatus === 'taken'}
                className="btn-primary-sport text-xs sm:text-sm px-6 py-2.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Lưu Hồ Sơ & Cấp Thẻ Hội Viên</span>
              </button>
            </div>
          </form>

          {/* Success Notification */}
          {createdMember && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Khởi Tạo Hội Viên & Cấp Thẻ Thành Công!</span>
                </div>
                <button
                  onClick={() => setCreatedMember(null)}
                  className="btn-secondary-pro text-[11px] py-1 px-2.5"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/80 p-3 rounded-lg border border-emerald-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Họ và tên:</span>
                  <strong className="text-slate-900">{createdMember.hoTen}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Mã hội viên:</span>
                  <strong className="font-mono text-emerald-800">{createdMember.maHoiVien}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tên đăng nhập:</span>
                  <strong className="font-mono text-slate-900">{createdMember.tenDangNhap}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Trạng thái:</span>
                  <span className="badge-active">{createdMember.trangThai}</span>
                </div>
              </div>

              {createdMember.createdCards && createdMember.createdCards.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-emerald-900 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Thẻ Tập Đã Kích Hoạt Theo Hóa Đơn:</span>
                  </span>
                  {createdMember.createdCards.map(c => (
                    <div key={c.maThe} className="p-2 bg-white rounded border border-emerald-200 flex justify-between items-center text-[11px]">
                      <div>
                        <strong className="text-blue-900">{c.tenGoiTap}</strong>
                        <span className="font-mono text-slate-500 ml-2">({c.maThe})</span>
                      </div>
                      <span className="font-mono text-slate-600">
                        {c.ngayKichHoat} → {c.ngayHetHan}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Member Directory */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh Sách Hội Viên Đã Cấp ({memberList.length})
            </h3>
            <button
              onClick={loadMembers}
              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-50"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {memberList.map((m) => (
              <div
                key={m.maHoiVien}
                className="p-3 bg-slate-50/60 rounded-lg border border-slate-200 hover:border-blue-300 transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{m.hoTen}</span>
                  <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {m.maHoiVien}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>User: <strong className="font-mono text-slate-700">{m.tenDangNhap}</strong></span>
                  <span className="font-mono">{m.soDienThoai}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[10px] border-t border-slate-100">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="badge-active">{m.trangThai}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
