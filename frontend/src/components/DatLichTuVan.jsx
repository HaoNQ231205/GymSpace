import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, Phone, Mail, 
  MessageSquare, CheckCircle, AlertTriangle, ArrowRight, 
  RotateCcw, XCircle, ShieldCheck, ChevronRight, Lock,
  ShoppingCart
} from 'lucide-react';
import { api } from '../services/api';

export default function DatLichTuVan({ isStaffView = false, onGoToSale, initialContent }) {
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Chọn khung giờ, 3: Xác nhận thành công
  const [formData, setFormData] = useState({
    ho: '',
    ten: '',
    soDienThoai: '',
    email: '',
    noiDungTraoDoi: initialContent ? `Cần tư vấn thông tin đăng ký ${initialContent}` : ''
  });
  const [ngayHen, setNgayHen] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [existingList, setExistingList] = useState([]);

  const loadExistingBookings = async () => {
    if (!isStaffView) return;
    try {
      const res = await api.getConsultations();
      if (res.success) setExistingList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isStaffView) {
      loadExistingBookings();
    }
  }, [isStaffView]);

  useEffect(() => {
    if (initialContent) {
      setFormData(prev => ({
        ...prev,
        noiDungTraoDoi: `Cần tư vấn thông tin đăng ký ${initialContent}`
      }));
    }
  }, [initialContent]);

  const handleFetchSlots = async (e) => {
    if (e) e.preventDefault();
    if (!formData.ho.trim() || !formData.ten.trim() || !formData.soDienThoai.trim()) {
      setError('Vui lòng điền đầy đủ Họ, Tên và Số điện thoại liên hệ!');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.soDienThoai.trim())) {
      setError('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng số 0).');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.getSlots(ngayHen);
      if (res.success) {
        setSlots(res.slots);
        setSelectedSlot(null);
        setStep(2);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setError('Vui lòng chọn một khung giờ khả dụng!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const fullHoTen = `${formData.ho.trim()} ${formData.ten.trim()}`;
      const res = await api.bookConsultation({
        hoTen: fullHoTen,
        soDienThoai: formData.soDienThoai.trim(),
        email: formData.email.trim(),
        noiDungTraoDoi: formData.noiDungTraoDoi.trim(),
        ngayHen: selectedSlot.ngayHen,
        gioBatDau: selectedSlot.gioBatDau
      });

      if (res.success) {
        setBookingResult(res.data);
        setStep(3);
        loadExistingBookings();
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('vừa được đặt')) {
        const reload = await api.getSlots(ngayHen);
        if (reload.success) setSlots(reload.slots);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (maLichHen) => {
    if (!window.confirm(`Xác nhận hủy lịch hẹn ${maLichHen}?`)) return;
    try {
      await api.cancelConsultation(maLichHen);
      loadExistingBookings();
      if (step === 2) {
        const reload = await api.getSlots(ngayHen);
        if (reload.success) setSlots(reload.slots);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedSlot(null);
    setBookingResult(null);
    setError('');
    setFormData({
      ho: '',
      ten: '',
      soDienThoai: '',
      email: '',
      noiDungTraoDoi: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Workflow Stepper Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Thông Tin Khách Hàng</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Chọn Khung Giờ 30P</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>Xác Nhận & Ghi Sổ</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Thời lượng tiêu chuẩn: <strong className="text-slate-800">30 phút/ca</strong></span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-lg text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form or Time Slot Grid */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">1. Nhập Hồ Sơ Khách Hàng Tiềm Năng</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Khách hàng sẽ được đối soát tự động với danh bạ hệ thống</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">(*) Bắt buộc</span>
              </div>

              <form onSubmit={handleFetchSlots} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-pro">Họ đệm (*)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn"
                      value={formData.ho}
                      onChange={(e) => setFormData({ ...formData, ho: e.target.value })}
                      required
                      className="form-input-pro"
                    />
                  </div>

                  <div>
                    <label className="form-label-pro">Tên (*)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: An"
                      value={formData.ten}
                      onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                      required
                      className="form-input-pro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-pro">Số điện thoại (*) (10 số)</label>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                      required
                      className="form-input-pro font-mono"
                    />
                  </div>

                  <div>
                    <label className="form-label-pro">Email</label>
                    <input
                      type="email"
                      placeholder="an.nguyen@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input-pro"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label-pro">Nội dung tư vấn gói tập gym / Thắc mắc về các gói</label>
                  <textarea
                    rows="3"
                    placeholder="Ví dụ: Cần tư vấn chi tiết gói Gym Toàn Thân hoặc Boxing, thời gian tập, hình thức tập kèm 1-1..."
                    value={formData.noiDungTraoDoi}
                    onChange={(e) => setFormData({ ...formData, noiDungTraoDoi: e.target.value })}
                    className="form-input-pro"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Hệ thống áp dụng mã bảo mật chuẩn SSL</span>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-sport"
                  >
                    <span>Tiếp tục: Xem khung giờ trống</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">2. Chọn Khung Giờ Tư Vấn Trực Tuyến</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khách: <strong className="text-slate-800">{formData.ho} {formData.ten}</strong> ({formData.soDienThoai})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={ngayHen}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setNgayHen(e.target.value);
                      api.getSlots(e.target.value).then((res) => {
                        if (res.success) {
                          setSlots(res.slots);
                          setSelectedSlot(null);
                        }
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-slate-50 text-slate-800"
                  />
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary-pro text-xs py-1.5 px-3"
                  >
                    Sửa thông tin
                  </button>
                </div>
              </div>

              {/* Ca Sáng */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Ca Sáng (08:00 - 11:30)
                  </h3>
                  <span className="text-[11px] text-slate-400">6 ca 30 phút</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {slots.filter(s => s.buoi === 'Sáng').map((slot) => {
                    const isBooked = slot.trangThai === 'Đã kín';
                    const isSelected = selectedSlot?.gioBatDau === slot.gioBatDau;
                    return (
                      <button
                        key={slot.gioBatDau}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between
                          ${isBooked 
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                            : isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 text-slate-800'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold">{slot.gioBatDau} - {slot.gioKetThuc}</span>
                          {isBooked && <Lock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1.5 ${
                          isBooked ? 'text-rose-500' : isSelected ? 'text-blue-100' : 'text-emerald-600'
                        }`}>
                          {slot.trangThai}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ca Chiều */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                    Ca Chiều (14:00 - 17:00)
                  </h3>
                  <span className="text-[11px] text-slate-400">6 ca 30 phút</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {slots.filter(s => s.buoi === 'Chiều').map((slot) => {
                    const isBooked = slot.trangThai === 'Đã kín';
                    const isSelected = selectedSlot?.gioBatDau === slot.gioBatDau;
                    return (
                      <button
                        key={slot.gioBatDau}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between
                          ${isBooked 
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                            : isSelected
                            ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 hover:border-orange-500 hover:bg-orange-50/20 text-slate-800'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold">{slot.gioBatDau} - {slot.gioKetThuc}</span>
                          {isBooked && <Lock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1.5 ${
                          isBooked ? 'text-rose-500' : isSelected ? 'text-orange-100' : 'text-emerald-600'
                        }`}>
                          {slot.trangThai}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  {selectedSlot ? (
                    <span className="text-slate-600">
                      Đã chọn ca: <strong className="text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{selectedSlot.gioBatDau} ({selectedSlot.ngayHen})</strong>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Vui lòng nhấp chọn một ô giờ để tiếp tục</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary-pro"
                  >
                    Quay lại
                  </button>
                  <button
                    disabled={!selectedSlot || loading}
                    onClick={handleConfirmBooking}
                    className="btn-accent-sport"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác nhận đặt lịch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && bookingResult && (
            <div className="bg-white border border-emerald-300 rounded-xl p-8 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div>
                <span className="badge-active">Đặt lịch thành công</span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">Lịch Hẹn Đã Được Ghi Sổ Hệ Thống</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mã tham chiếu: <strong className="font-mono text-blue-700">{bookingResult.maLichHen}</strong>. Hồ sơ khách hàng đã được lưu trữ an toàn.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-w-sm mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-bold text-slate-800">{bookingResult.hoTen}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono font-bold text-slate-800">{bookingResult.soDienThoai}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Ngày hẹn:</span>
                  <span className="font-bold text-blue-700">{bookingResult.ngayHen}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Khung giờ:</span>
                  <span className="font-bold text-orange-600">{bookingResult.gioBatDau} (30 phút)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="badge-active">{bookingResult.trangThai}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetFlow}
                  className="btn-primary-sport"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đặt tiếp lịch hẹn khác</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Staff Roster OR Customer Highlights */}
        {isStaffView ? (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Sổ Lịch Hẹn Gần Đây</h3>
                </div>
                <span className="badge-neutral font-mono">{existingList.length} ca</span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {existingList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">Chưa có lịch hẹn nào</div>
                ) : (
                  existingList.map((item) => (
                    <div
                      key={item.maLichHen}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.hoTen}</span>
                        <span className={item.trangThai === 'Đã hủy' ? 'badge-danger' : 'badge-active'}>
                          {item.trangThai}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-mono">{item.soDienThoai}</span>
                        <span className="font-semibold text-slate-700">{item.gioBatDau} • {item.ngayHen}</span>
                      </div>

                      {item.noiDungTraoDoi && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/60 line-clamp-2">
                          {item.noiDungTraoDoi}
                        </p>
                      )}

                      {item.trangThai !== 'Đã hủy' && (
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <button
                            onClick={() => handleCancelBooking(item.maLichHen)}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Hủy lịch</span>
                          </button>

                          {onGoToSale && (
                            <button
                              onClick={() => onGoToSale({
                                hoTen: item.hoTen,
                                soDienThoai: item.soDienThoai,
                                email: item.email || '',
                                noiDungTraoDoi: item.noiDungTraoDoi || ''
                              })}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Tư Vấn & Bán Gói (POS)</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-blue-100">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Nội Dung Buổi Tư Vấn Gói Tập (30 Phút)
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Tư Vấn Chi Tiết Các Gói Tập Gym</strong>
                    <span className="text-slate-500 text-[11px]">Tìm hiểu đặc điểm và quyền lợi các gói: Yoga, Gym Toàn Thân, Boxing Chuyên Sâu và VIP All-in-one.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Lựa Chọn Hình Thức & Thời Gian Tập</strong>
                    <span className="text-slate-500 text-[11px]">Hỗ trợ chọn hình thức tập luyện tự do (Trực tiếp) hoặc Kèm 1-1 theo lịch trình của bạn.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Tham Quan Phòng Tập & Lịch Lớp Studio</strong>
                    <span className="text-slate-500 text-[11px]">Giải đáp thắc mắc về máy móc, cơ sở vật chất phòng gym và thời khóa biểu các lớp học.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">100% Miễn Phí</strong>
                    <span className="text-slate-500 text-[11px]">Tư vấn trực tuyến hoặc trực tiếp hoàn toàn miễn phí, không bắt buộc mua gói.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Hotline tư vấn: <strong className="text-blue-700 font-mono">1900 6868</strong></span>
                <span>Phòng Gym Trung Tâm</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
