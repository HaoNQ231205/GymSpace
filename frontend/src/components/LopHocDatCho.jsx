import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, Clock, MapPin, 
  CheckCircle, AlertCircle, XCircle, Plus, Eye,
  X, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function LopHocDatCho() {
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [bookedMembers, setBookedMembers] = useState([]);
  const [bookingMemberId, setBookingMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [resClass, resMem] = await Promise.all([
        api.getClasses(),
        api.searchMembers('')
      ]);
      if (resClass.success) setClasses(resClass.data);
      if (resMem.success) setMembers(resMem.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewBookings = async (cls) => {
    setSelectedClass(cls);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.getClassBookings(cls.maLop);
      if (res.success) setBookedMembers(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBookSpot = async (cls) => {
    if (!bookingMemberId) {
      setError('Vui lòng chọn 1 hội viên ở thanh công cụ bên trên để đặt chỗ!');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.bookClass({
        maLop: cls.maLop,
        maHoiVien: bookingMemberId
      });
      if (res.success) {
        setSuccessMsg(`Đặt chỗ thành công cho hội viên vào lớp ${cls.tenLop}!`);
        loadData();
        if (selectedClass?.maLop === cls.maLop) {
          handleViewBookings(cls);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSpot = async (maDatCho) => {
    if (!window.confirm('Xác nhận hủy lượt đặt chỗ này và giải phóng vị trí?')) return;
    try {
      await api.cancelBooking(maDatCho);
      setSuccessMsg('Đã hủy đặt chỗ thành công và hoàn trả 1 vị trí trống cho lớp học!');
      loadData();
      if (selectedClass) {
        handleViewBookings(selectedClass);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Quản Lý Lớp Học & Đăng Ký Chỗ Tập (LopHoc & DatCho)</h2>
            <p className="text-xs text-slate-500">Kiểm soát sĩ số phòng tập, HLV hướng dẫn và quyền đặt chỗ của hội viên sở hữu thẻ</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="badge-neutral font-mono">Bảng: LopHoc + DatCho</span>
          <span className="badge-active">Nhân viên: NV005</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-lg text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-lg text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* Quick Action Member Selector Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-700 uppercase tracking-wide">Chọn Hội Viên Để Đặt Chỗ Lớp Học:</span>
        </div>
        <select
          value={bookingMemberId}
          onChange={(e) => setBookingMemberId(e.target.value)}
          className="form-input-pro max-w-md bg-white font-semibold"
        >
          <option value="">-- Chọn hội viên muốn đặt chỗ --</option>
          {members.map(m => (
            <option key={m.maHoiVien} value={m.maHoiVien}>
              {m.hoTen} ({m.maHoiVien} - {m.soDienThoai})
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Studio Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const isFull = cls.soChoDat >= cls.soChoToiDa;
          const percent = Math.min(100, Math.round((cls.soChoDat / cls.soChoToiDa) * 100));
          return (
            <div
              key={cls.maLop}
              className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {cls.maLop}
                  </span>
                  <span className={isFull ? 'badge-danger' : 'badge-active'}>
                    {isFull ? 'Đã đủ chỗ' : 'Còn nhận chỗ'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2">
                  {cls.tenLop}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ngày diễn ra: <strong className="font-mono text-slate-800">{cls.ngayHoc}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Khung giờ: <strong className="font-mono text-blue-800 font-bold">{cls.gioBatDau} - {cls.gioKetThuc}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>HLV: <strong className="text-slate-800">{cls.hlv}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phòng: <strong className="text-slate-800">{cls.phongTap}</strong></span>
                  </div>
                </div>

                {/* Sĩ số progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Sĩ số phòng:</span>
                    <span className={isFull ? 'text-rose-600 font-mono' : 'text-blue-700 font-mono'}>
                      {cls.soChoDat}/{cls.soChoToiDa} chỗ ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isFull ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleViewBookings(cls)}
                  className="btn-secondary-pro flex-1 text-xs py-2"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>DS Đã Đặt ({cls.soChoDat})</span>
                </button>

                <button
                  disabled={isFull || loading || !bookingMemberId}
                  onClick={() => handleBookSpot(cls)}
                  className="btn-primary-sport flex-1 text-xs py-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đặt Chỗ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booked Members Roster Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Danh Sách Đặt Chỗ: {selectedClass.tenLop}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ngày: <span className="font-mono">{selectedClass.ngayHoc}</span> • Giờ: <span className="font-mono">{selectedClass.gioBatDau} - {selectedClass.gioKetThuc}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {bookedMembers.length === 0 ? (
                <p className="text-center py-8 text-slate-400">Chưa có hội viên nào đặt chỗ cho lớp này</p>
              ) : (
                bookedMembers.map((bm) => (
                  <div
                    key={bm.maDatCho}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                          {bm.maDatCho}
                        </span>
                        <span className="font-bold text-slate-900">{bm.hoTen}</span>
                      </div>
                      <p className="font-mono text-slate-500 text-[11px] mt-0.5">
                        Mã HV: {bm.maHoiVien} • SĐT: {bm.soDienThoai}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={bm.trangThaiDat === 'Đã hủy' ? 'badge-danger' : 'badge-active'}>
                        {bm.trangThaiDat}
                      </span>
                      {bm.trangThaiDat === 'Đã đặt' && (
                        <button
                          onClick={() => handleCancelSpot(bm.maDatCho)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold underline"
                        >
                          Hủy chỗ
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedClass(null)}
                className="btn-secondary-pro text-xs py-2 px-4"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
