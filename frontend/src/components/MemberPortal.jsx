import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  CreditCard, Calendar, User, Clock, CheckCircle2,
  XCircle, AlertCircle, Dumbbell, MapPin, UserCheck,
  ChevronRight, RefreshCw, Phone, ShieldCheck, Flame,
  FileText, Sparkles, SwitchCamera
} from 'lucide-react';

export default function MemberPortal({ currentUser, activeSubTab, onTabChange }) {
  const [memberList, setMemberList] = useState([]);
  const [activeMember, setActiveMember] = useState(null);
  const [memberTab, setMemberTab] = useState(activeSubTab || 'the-tap'); // 'the-tap' | 'dat-cho' | 'ho-so' | 'hoa-don'
  
  useEffect(() => {
    if (activeSubTab) {
      setMemberTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabSwitch = (tab) => {
    setMemberTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  
  // Data states
  const [cards, setCards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // Loading & status
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  // Profile edit form state
  const [editForm, setEditForm] = useState({ hoTen: '', soDienThoai: '' });

  // 1. Initial load of members for switcher
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await api.searchMembers('');
        if (res.success && res.data.length > 0) {
          setMemberList(res.data);
          const targetId = currentUser?.maHoiVien || currentUser?.id;
          const found = res.data.find(m => m.maHoiVien === targetId);
          setActiveMember(found || res.data[0]);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách hội viên:', err);
      }
    };
    loadMembers();
  }, [currentUser]);

  // 2. Fetch member-specific data whenever activeMember changes
  const refreshMemberData = async (hv) => {
    if (!hv) return;
    setLoading(true);
    setActionMsg(null);
    try {
      const [cardsRes, classesRes, bookingsRes, invoicesRes, detailRes] = await Promise.all([
        api.getMemberCards(hv.maHoiVien),
        api.getClasses(),
        api.getMemberBookings(hv.maHoiVien),
        api.getMemberInvoices(hv.maHoiVien),
        api.getMemberDetail(hv.maHoiVien)
      ]);

      if (cardsRes.success) setCards(cardsRes.data);
      if (classesRes.success) setClasses(classesRes.data);
      if (bookingsRes.success) setMyBookings(bookingsRes.data);
      if (invoicesRes.success) setInvoices(invoicesRes.data);
      if (detailRes.success) {
        setEditForm({
          hoTen: detailRes.data.hoTen || '',
          soDienThoai: detailRes.data.soDienThoai || ''
        });
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu hội viên:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMember) {
      refreshMemberData(activeMember);
    }
  }, [activeMember]);

  // Handle booking class for self
  const handleBookClass = async (maLop) => {
    setActionMsg(null);
    try {
      const res = await api.bookClass({
        maLop,
        maHoiVien: activeMember.maHoiVien
      });
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Đặt chỗ lớp học thành công!' });
        refreshMemberData(activeMember);
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Handle canceling booking
  const handleCancelBooking = async (maDatCho) => {
    if (!window.confirm('Bạn có chắc muốn hủy đặt chỗ cho lớp này không?')) return;
    setActionMsg(null);
    try {
      const res = await api.cancelBooking(maDatCho);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Đã hủy đặt chỗ thành công!' });
        refreshMemberData(activeMember);
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Handle update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setActionMsg(null);
    try {
      const res = await api.updateMember(activeMember.maHoiVien, {
        hoTen: editForm.hoTen,
        soDienThoai: editForm.soDienThoai,
        maNhanVien: 'NV005'
      });
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Cập nhật hồ sơ cá nhân thành công!' });
        setActiveMember(prev => ({
          ...prev,
          hoTen: editForm.hoTen,
          soDienThoai: editForm.soDienThoai
        }));
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  if (!activeMember) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin tài khoản hội viên...</p>
      </div>
    );
  }

  // Active card check
  const activeCards = cards.filter(c => c.trangThai === 'Hoạt động');
  const hasActiveCard = activeCards.length > 0;

  return (
    <div className="space-y-6">
      {/* Member Card Banner & Account Switcher */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          {/* Member Identity Details */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
              {activeMember.hoTen ? activeMember.hoTen.charAt(0).toUpperCase() : 'H'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-blue-100">
                  {activeMember.maHoiVien}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {activeMember.trangThai || 'Hoạt động'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {activeMember.hoTen}
              </h2>
              <p className="text-xs text-blue-200 flex items-center gap-2 mt-0.5">
                <Phone className="w-3 h-3 text-orange-400" />
                <span>{activeMember.soDienThoai}</span>
                <span className="text-white/40">•</span>
                <span>Tên ĐN: <strong className="font-mono text-white">{activeMember.tenDangNhap}</strong></span>
              </p>
            </div>
          </div>

          {/* Member Switcher Dropdown */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-blue-100 font-semibold">
              <SwitchCamera className="w-4 h-4 text-orange-400" />
              <span>Chuyển Tài Khoản:</span>
            </div>
            <select
              value={activeMember.maHoiVien}
              onChange={(e) => {
                const found = memberList.find(m => m.maHoiVien === e.target.value);
                if (found) setActiveMember(found);
              }}
              className="bg-white text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 border-none shadow-sm cursor-pointer"
            >
              {memberList.map((m) => (
                <option key={m.maHoiVien} value={m.maHoiVien}>
                  {m.maHoiVien} - {m.hoTen} ({m.soDienThoai})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Member Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/15">
          <button
            onClick={() => handleTabSwitch('the-tap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              memberTab === 'the-tap'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Thẻ Tập Của Tôi ({cards.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('dat-cho')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              memberTab === 'dat-cho'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Đặt Chỗ Studio ({myBookings.filter(b => b.trangThaiDat === 'Đã đặt').length} đã đặt)</span>
          </button>

          <button
            onClick={() => handleTabSwitch('ho-so')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              memberTab === 'ho-so'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ Sơ Cá Nhân</span>
          </button>

          <button
            onClick={() => handleTabSwitch('hoa-don')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              memberTab === 'hoa-don'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Hóa Đơn & Giao Dịch ({invoices.length})</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
          actionMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* 1. TAB: THẺ TẬP CỦA TÔI */}
      {memberTab === 'the-tap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Danh Sách Thẻ Tập GymSpace</h3>
              <p className="text-xs text-slate-500">Thẻ hội viên điện tử sử dụng khi ra vào phòng tập và đăng ký lớp</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Tổng số thẻ: <strong className="text-slate-900">{cards.length}</strong>
            </span>
          </div>

          {cards.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Chưa có thẻ hội viên nào</p>
              <p className="text-xs text-slate-400 mt-1">Liên hệ nhân viên quầy tiếp tân để đăng ký gói tập mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card) => {
                const isActive = card.trangThai === 'Hoạt động';
                const today = new Date();
                const expDate = new Date(card.ngayHetHan);
                const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = diffDays > 0 && diffDays <= 7;
                const isExpired = diffDays <= 0 || card.trangThai === 'Hết hạn';

                return (
                  <div
                    key={card.maThe}
                    className={`rounded-2xl border p-5 relative overflow-hidden transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-sm'
                        : 'bg-white border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            {card.maThe}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {card.trangThai}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1.5">
                          {card.tenGoiTap}
                        </h4>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 py-3 border-y border-slate-100 my-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hình thức tập luyện:</span>
                        <span className="font-semibold text-slate-800">{card.hinhThucTap}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Ngày kích hoạt:</span>
                        <span className="font-medium text-slate-700">{card.ngayKichHoat}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hạn sử dụng:</span>
                        <span className="font-bold text-slate-900">{card.ngayHetHan}</span>
                      </div>
                    </div>

                    {/* Expiry countdown indicator */}
                    <div className="flex items-center justify-between text-xs">
                      {isActive && !isExpired ? (
                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Còn lại: <strong className="text-blue-900 font-bold">{diffDays} ngày</strong></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Thẻ đã hết hạn</span>
                        </div>
                      )}

                      <span className="text-[11px] text-slate-400">
                        {card.donGia ? `${Number(card.donGia).toLocaleString('vi-VN')} đ` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. TAB: ĐẶT CHỖ LỚP HỌC STUDIO */}
      {memberTab === 'dat-cho' && (
        <div className="space-y-6">
          {/* Warning if no active cards */}
          {!hasActiveCard && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong className="font-semibold">Lưu ý điều kiện đặt chỗ:</strong> Hội viên cần sở hữu ít nhất 1 thẻ tập đang hoạt động và còn hạn để đăng ký tham gia các lớp học Studio.
              </div>
            </div>
          )}

          {/* Section: My Booked Classes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Lớp Học Bạn Đã Đặt Chỗ ({myBookings.filter(b => b.trangThaiDat === 'Đã đặt').length})
              </h3>
            </div>

            {myBookings.filter(b => b.trangThaiDat === 'Đã đặt').length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-400">
                Bạn chưa đặt chỗ lớp học nào. Hãy chọn lớp bên dưới để giữ chỗ trước giờ tập.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myBookings.filter(b => b.trangThaiDat === 'Đã đặt').map((b) => (
                  <div key={b.maDatCho} className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          {b.maDatCho}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                          Đã giữ chỗ
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{b.tenLop}</h4>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.gioBatDau} - {b.gioKetThuc}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.phongTap} • HLV {b.hlv}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelBooking(b.maDatCho)}
                      className="mt-3 w-full py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Hủy Đặt Chỗ</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Available Studio Classes */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Lớp Học Studio Sắp Diễn Ra ({classes.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => {
                const spotsLeft = cls.soChoToiDa - cls.soChoDat;
                const isFull = spotsLeft <= 0;
                const alreadyBooked = myBookings.some(b => b.maLop === cls.maLop && b.trangThaiDat === 'Đã đặt');

                return (
                  <div key={cls.maLop} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cls.maLop}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isFull ? 'Hết chỗ' : `Còn ${spotsLeft} chỗ`}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{cls.tenLop}</h4>

                      <div className="space-y-1 text-xs text-slate-600 mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cls.gioBatDau} - {cls.gioKetThuc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Phòng: <strong className="text-slate-700">{cls.phongTap}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>HLV: <strong className="text-blue-700">{cls.hlv}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {cls.soChoDat}/{cls.soChoToiDa} người
                      </span>

                      {alreadyBooked ? (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          ✓ Đã đặt chỗ
                        </span>
                      ) : (
                        <button
                          disabled={isFull || !hasActiveCard}
                          onClick={() => handleBookClass(cls.maLop)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            isFull || !hasActiveCard
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                          }`}
                        >
                          <span>Đặt Chỗ Ngay</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: HỒ SƠ CÁ NHÂN */}
      {memberTab === 'ho-so' && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Thông Tin Tài Khoản Hội Viên</h3>
            <p className="text-xs text-slate-500">Xem và cập nhật thông tin liên lạc của bạn trong hệ thống GymSpace</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã Hội Viên</label>
                <input
                  type="text"
                  disabled
                  value={activeMember.maHoiVien}
                  className="w-full text-xs font-mono bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Đăng Nhập</label>
                <input
                  type="text"
                  disabled
                  value={activeMember.tenDangNhap}
                  className="w-full text-xs font-mono bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ Và Tên</label>
              <input
                type="text"
                required
                value={editForm.hoTen}
                onChange={(e) => setEditForm({ ...editForm, hoTen: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
              <input
                type="tel"
                required
                value={editForm.soDienThoai}
                onChange={(e) => setEditForm({ ...editForm, soDienThoai: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Thay Đổi Hồ Sơ</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB: HÓA ĐƠN & GIAO DỊCH */}
      {memberTab === 'hoa-don' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Lịch Sử Giao Dịch & Hóa Đơn</h3>
              <p className="text-xs text-slate-500">Các giao dịch mua gói tập và gia hạn đã thanh toán tại GymSpace</p>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
              Chưa có giao dịch hóa đơn nào được ghi nhận cho tài khoản này.
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.maHoaDon} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {inv.maHoaDon}
                      </span>
                      <span className="text-xs text-slate-500">{inv.ngayThanhToan}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Phương thức: <strong className="text-slate-800">{inv.phuongThucThanhToan}</strong></span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Đã thanh toán
                      </span>
                    </div>
                  </div>

                  {/* Line items */}
                  {inv.chiTiet && inv.chiTiet.length > 0 && (
                    <div className="py-2.5 space-y-1.5 border-b border-slate-100 text-xs">
                      {inv.chiTiet.map((ct, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700">
                          <span>{ct.tenGoiTap} (x{ct.soLuong})</span>
                          <span className="font-mono font-medium">{Number(ct.thanhTien).toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Thu ngân: {inv.tenNhanVien || inv.maNhanVien}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-500 font-semibold">Tổng thanh toán:</span>
                      <span className="text-sm font-black text-blue-700 font-mono">
                        {Number(inv.tongTien).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
