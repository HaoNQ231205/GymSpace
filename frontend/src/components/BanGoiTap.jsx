import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Plus, Trash2, CheckCircle, 
  CreditCard, User, AlertCircle, ArrowRight, Printer,
  Check, Search, ShieldCheck, UserPlus, RefreshCw, Calendar,
  Clock, Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function BanGoiTap({ initialCustomer, onGoToCreateMember, onGoToRenew }) {
  const [packages, setPackages] = useState([]);
  const [members, setMembers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  
  // Buyer Mode: 'new_customer' (Khách hàng mới/Khách tư vấn) vs 'existing_member' (Hội viên cũ mua thêm gói)
  const [buyerMode, setBuyerMode] = useState(initialCustomer ? 'new_customer' : 'new_customer');
  
  // New Customer Information
  const [newCustomer, setNewCustomer] = useState({
    hoTen: initialCustomer?.hoTen || '',
    soDienThoai: initialCustomer?.soDienThoai || '',
    email: initialCustomer?.email || ''
  });

  // Existing Member Information
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberExistingCards, setMemberExistingCards] = useState([]);
  const [searchMemberKeyword, setSearchMemberKeyword] = useState('');

  // Cart & Checkout
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialCustomer) {
      setBuyerMode('new_customer');
      setNewCustomer({
        hoTen: initialCustomer.hoTen || '',
        soDienThoai: initialCustomer.soDienThoai || '',
        email: initialCustomer.email || ''
      });
    }
  }, [initialCustomer]);

  const loadInitialData = async () => {
    try {
      const [resPkg, resMem, resConsult] = await Promise.all([
        api.getPackages(),
        api.searchMembers(''),
        api.getConsultations().catch(() => ({ success: false, data: [] }))
      ]);
      if (resPkg.success) setPackages(resPkg.data);
      if (resMem.success) setMembers(resMem.data);
      if (resConsult.success) {
        // Lọc các lịch hẹn hợp lệ
        setConsultations(resConsult.data.filter(c => c.trangThai !== 'Đã hủy'));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectMember = async (m) => {
    setSelectedMember(m);
    setError('');
    try {
      const res = await api.getMemberCards(m.maHoiVien);
      if (res.success) {
        setMemberExistingCards(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConsultationCustomer = (c) => {
    setNewCustomer({
      hoTen: c.hoTen || '',
      soDienThoai: c.soDienThoai || '',
      email: c.email || ''
    });
  };

  const handleAddToCart = (pkg) => {
    setError('');
    const existingIndex = cart.findIndex(c => c.maGoiTap === pkg.maGoiTap);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].soLuong += 1;
      newCart[existingIndex].thanhTien = newCart[existingIndex].soLuong * pkg.donGia;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          maGoiTap: pkg.maGoiTap,
          tenGoiTap: pkg.tenGoiTap,
          donGia: pkg.donGia,
          soNgayMacDinh: pkg.soNgayMacDinh,
          hinhThucTap: pkg.hinhThucTap,
          soLuong: 1,
          thanhTien: pkg.donGia
        }
      ]);
    }
  };

  const handleQuantityChange = (index, delta) => {
    const newCart = [...cart];
    const newQty = newCart[index].soLuong + delta;
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    newCart[index].soLuong = newQty;
    newCart[index].thanhTien = newQty * newCart[index].donGia;
    setCart(newCart);
  };

  const handleRemoveItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.thanhTien, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Giỏ hàng chưa có gói tập nào! Vui lòng chọn ít nhất 1 gói tập từ danh mục.');
      return;
    }

    if (buyerMode === 'new_customer') {
      if (!newCustomer.hoTen.trim() || !newCustomer.soDienThoai.trim()) {
        setError('Vui lòng nhập Họ tên và Số điện thoại của Khách hàng mới để lập hóa đơn!');
        return;
      }
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(newCustomer.soDienThoai.trim())) {
        setError('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng 0).');
        return;
      }
    } else {
      if (!selectedMember) {
        setError('Vui lòng tìm và chọn Hội viên cũ cần mua thêm gói!');
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.processSale({
        maHoiVien: buyerMode === 'new_customer' ? null : selectedMember.maHoiVien,
        gioHang: cart,
        phuongThucThanhToan: paymentMethod,
        maNhanVien: 'NV005'
      });

      if (res.success) {
        setReceipt({
          ...res.data,
          buyerMode,
          customerData: buyerMode === 'new_customer' ? { ...newCustomer } : { ...selectedMember }
        });
        setCart([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workstation Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Đăng ký trực tiếp – Bán gói tập</h2>
            <p className="text-xs text-slate-500">Phục vụ Khách hàng mới sau tư vấn và Hội viên cũ mua thêm gói tập</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
            Thu ngân: <strong className="text-slate-800">NV005 (Nhân Viên Lễ Tân)</strong>
          </span>
          <span className="badge-active">Quầy POS 01</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-lg text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Buyer Selector & Package Catalog */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Buyer Selector Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>1. Chọn Đối Tượng Mua Gói</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Use Case Phân Luồng Nghiệp Vụ</span>
            </div>

            {/* Buyer Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setBuyerMode('new_customer')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  buyerMode === 'new_customer'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 text-orange-500" />
                <span>Khách Hàng Mới (Chưa có thẻ)</span>
              </button>

              <button
                type="button"
                onClick={() => setBuyerMode('existing_member')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  buyerMode === 'existing_member'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Hội Viên Cũ (Mua thêm gói)</span>
              </button>
            </div>

            {/* CASE A: KHÁCH HÀNG MỚI */}
            {buyerMode === 'new_customer' && (
              <div className="space-y-4 pt-1">
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>Quy trình Use Case 2: Đăng ký trực tiếp - Bán gói tập</span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Khách hàng mua gói trực tiếp hoặc sau khi đặt lịch tư vấn. Nhân viên thu tiền lập Hóa đơn trước, ngay sau khi thanh toán thành công hệ thống sẽ chuyển sang màn hình Tạo Tài Khoản Hội Viên để cấp thẻ tập.
                  </p>
                </div>

                {/* Quick Select from Consultation appointments if available */}
                {consultations.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chọn nhanh từ khách hàng đặt lịch tư vấn:</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {consultations.slice(0, 4).map(c => (
                        <button
                          key={c.maLichHen}
                          type="button"
                          onClick={() => handleSelectConsultationCustomer(c)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-700 transition flex items-center gap-1.5"
                        >
                          <span className="font-bold">{c.hoTen}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({c.soDienThoai})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="form-label-pro">Họ và Tên Khách Hàng (*)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={newCustomer.hoTen}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, hoTen: e.target.value }))}
                      className="form-input-pro"
                    />
                  </div>
                  <div>
                    <label className="form-label-pro">Số Điện Thoại (* 10 số)</label>
                    <input
                      type="text"
                      placeholder="0912345678"
                      value={newCustomer.soDienThoai}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, soDienThoai: e.target.value }))}
                      className="form-input-pro font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label-pro">Email Liên Hệ (Không bắt buộc)</label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input-pro"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE B: HỘI VIÊN CŨ */}
            {buyerMode === 'existing_member' && (
              <div className="space-y-4 pt-1">
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-800">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hội viên cũ mua thêm gói tập mới</span>
                    </span>
                    {onGoToRenew && (
                      <button
                        type="button"
                        onClick={onGoToRenew}
                        className="text-[11px] text-blue-700 hover:text-blue-900 underline font-bold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Hội viên muốn Gia Hạn gói cũ? Bấm vào đây</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Hội viên đã có tài khoản và mã HV. Khi mua thêm gói mới, hóa đơn được gắn trực tiếp cho mã HV và thẻ mới được kích hoạt ngay, không cần tạo tài khoản mới.
                  </p>
                </div>

                {/* Member Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo Mã hội viên (HV...) hoặc Số điện thoại..."
                    value={searchMemberKeyword}
                    onChange={(e) => {
                      setSearchMemberKeyword(e.target.value);
                      api.searchMembers(e.target.value).then(res => {
                        if (res.success) setMembers(res.data);
                      });
                    }}
                    className="form-input-pro pl-9"
                  />
                </div>

                {/* Member List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {members.map(m => {
                    const isSelected = selectedMember?.maHoiVien === m.maHoiVien;
                    return (
                      <div
                        key={m.maHoiVien}
                        onClick={() => handleSelectMember(m)}
                        className={`
                          p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between
                          ${isSelected 
                            ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-700'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{m.hoTen}</span>
                          <span className="font-mono text-[10px] text-blue-600 font-bold">{m.maHoiVien}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 mt-1">{m.soDienThoai}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Member Info & Owned Packages */}
                {selectedMember && (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-500">Đã chọn:</span>{' '}
                        <strong className="text-blue-900 font-bold">{selectedMember.hoTen}</strong>{' '}
                        <span className="font-mono text-slate-500">({selectedMember.maHoiVien})</span>
                      </div>
                      <span className="badge-active">{selectedMember.trangThai}</span>
                    </div>

                    {memberExistingCards.length > 0 && (
                      <div className="pt-2 border-t border-blue-100 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-600">Gói tập hội viên đang sở hữu:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {memberExistingCards.map(c => (
                            <span 
                              key={c.maThe}
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${
                                c.trangThai === 'Hoạt động'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {c.tenGoiTap} (Hạn: {c.ngayHetHan})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Package Catalog */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>2. Danh Mục Gói Tập Kinh Doanh (GoiTap)</span>
              </h3>
              <span className="badge-neutral font-mono">{packages.length} gói</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {packages.map((pkg) => (
                <div
                  key={pkg.maGoiTap}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {pkg.maGoiTap}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {pkg.soNgayMacDinh} ngày/kỳ
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-2">{pkg.tenGoiTap}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Hình thức: <strong className="text-slate-700">{pkg.hinhThucTap}</strong></p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Đơn giá</p>
                      <p className="font-mono text-base font-bold text-orange-600">
                        {Number(pkg.donGia).toLocaleString('vi-VN')} <span className="text-xs">đ</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(pkg)}
                      className="btn-primary-sport text-xs py-1.5 px-3"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout POS Register */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span>Giỏ Hàng Tạm Thời</span>
              </h3>
              <span className="badge-blue font-mono">{cart.length} mục</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs">Chưa có gói tập nào trong giỏ</p>
                <p className="text-[11px] text-slate-400">Chọn gói bên trái để thêm vào giỏ thanh toán</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={item.maGoiTap}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-800 truncate">{item.tenGoiTap}</p>
                        <p className="font-mono text-[11px] text-slate-500">
                          {Number(item.donGia).toLocaleString('vi-VN')} đ × {item.soLuong} kỳ
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center border border-slate-300 rounded bg-white">
                          <button
                            onClick={() => handleQuantityChange(idx, -1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-slate-800">{item.soLuong}</span>
                          <button
                            onClick={() => handleQuantityChange(idx, 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-mono font-bold text-slate-900 w-20 text-right">
                          {Number(item.thanhTien).toLocaleString('vi-VN')} đ
                        </span>

                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buyer Summary Badge */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-500">Người mua hóa đơn:</span>
                  <span className="font-bold text-slate-900">
                    {buyerMode === 'new_customer' 
                      ? (newCustomer.hoTen || 'Khách hàng mới') 
                      : (selectedMember ? `${selectedMember.hoTen} (${selectedMember.maHoiVien})` : 'Chưa chọn')}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <label className="form-label-pro">Phương Thức Thanh Toán</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Chuyển khoản', 'Tiền mặt'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`
                          py-2 px-3 rounded-lg border text-center font-bold transition-all
                          ${paymentMethod === m
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                        `}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal & Total */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Số lượng gói mua:</span>
                    <span className="font-mono font-semibold text-slate-800">{cart.length} gói</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase">TỔNG TIỀN PHẢI THU:</span>
                    <span className="font-mono text-xl font-bold text-orange-600">
                      {totalAmount.toLocaleString('vi-VN')} <span className="text-xs">VNĐ</span>
                    </span>
                  </div>
                </div>

                {/* Submit Checkout Button */}
                <button
                  disabled={loading || cart.length === 0}
                  onClick={handleCheckout}
                  className="w-full btn-accent-sport py-3 text-xs sm:text-sm uppercase tracking-wider"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Xác Nhận Thu Tiền (Lập Hóa Đơn)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Confirmation Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Giao Dịch Thu Tiền Thành Công</h3>
              </div>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {receipt.maHoaDon}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian lập hóa đơn:</span>
                <span className="font-mono font-semibold text-slate-800">{receipt.ngayThanhToan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức thanh toán:</span>
                <span className="font-semibold text-blue-700">{receipt.phuongThucThanhToan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đối tượng thanh toán:</span>
                <span className="font-bold text-slate-900">
                  {receipt.buyerMode === 'new_customer'
                    ? `${receipt.customerData.hoTen} (${receipt.customerData.soDienThoai})`
                    : `${receipt.customerData.hoTen} (${receipt.customerData.maHoiVien})`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">TỔNG TIỀN ĐÃ THU:</span>
                <span className="font-mono font-bold text-orange-600 text-base">
                  {Number(receipt.tongTien).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            {/* If Buyer is Existing Member, Cards were auto-attached */}
            {receipt.buyerMode === 'existing_member' && receipt.createdCards && receipt.createdCards.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Thẻ Hội Viên Đã Được Cấp Thêm:</p>
                {receipt.createdCards.map(c => (
                  <div key={c.maThe} className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-blue-900">{c.tenGoiTap} ({c.maThe})</p>
                      <p className="font-mono text-[11px] text-slate-500">{c.ngayKichHoat} → {c.ngayHetHan}</p>
                    </div>
                    <span className="badge-active">Hoạt động</span>
                  </div>
                ))}
              </div>
            )}

            {/* If Buyer is New Customer, Prompt to create Member Account */}
            {receipt.buyerMode === 'new_customer' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Bước tiếp theo: Cấp tài khoản hội viên và kích hoạt thẻ</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Hóa đơn <strong className="font-mono">{receipt.maHoaDon}</strong> đã được lưu thành công. Theo đúng kịch bản Use Case 2, hệ thống sẽ chuyển sang giao diện tạo tài khoản để hoàn tất cấp thẻ hội viên cho khách hàng <strong>{receipt.customerData.hoTen}</strong>.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setReceipt(null)}
                className="btn-secondary-pro text-xs py-2 px-4"
              >
                Đóng
              </button>

              {receipt.buyerMode === 'new_customer' && onGoToCreateMember && (
                <button
                  onClick={() => {
                    const dataToPass = {
                      maHoaDon: receipt.maHoaDon,
                      hoTen: receipt.customerData.hoTen,
                      soDienThoai: receipt.customerData.soDienThoai,
                      email: receipt.customerData.email
                    };
                    setReceipt(null);
                    onGoToCreateMember(dataToPass);
                  }}
                  className="btn-accent-sport text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <span>Chuyển Sang Tạo Tài Khoản Hội Viên</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
