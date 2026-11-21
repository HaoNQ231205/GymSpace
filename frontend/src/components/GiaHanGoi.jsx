import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Search, CreditCard, Calendar, CheckCircle, 
  AlertTriangle, Clock, ShieldCheck, Dumbbell, ArrowRight,
  ChevronRight, X
} from 'lucide-react';
import { api } from '../services/api';

export default function GiaHanGoi() {
  const [keyword, setKeyword] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [cards, setCards] = useState([]);
  const [activeCardToRenew, setActiveCardToRenew] = useState(null);
  const [soKyGiaHan, setSoKyGiaHan] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  const handleSearch = async (kw = keyword) => {
    setError('');
    try {
      const res = await api.searchMembers(kw);
      if (res.success) {
        setMemberList(res.data);
        if (res.data.length > 0 && !selectedMember) {
          handleSelectMember(res.data[0]);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setError('');
    setSuccessReceipt(null);
    setActiveCardToRenew(null);
    try {
      const res = await api.getMemberCards(member.maHoiVien);
      if (res.success) {
        setCards(res.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateRenewPreview = () => {
    if (!activeCardToRenew) return null;
    const ky = Math.max(1, parseInt(soKyGiaHan, 10) || 1);
    const soNgayThem = ky * (activeCardToRenew.soNgayMacDinh || 30);
    const tongTien = ky * activeCardToRenew.donGia;

    const oldDate = new Date(activeCardToRenew.ngayHetHan);
    const newDate = new Date(oldDate.getTime() + soNgayThem * 24 * 60 * 60 * 1000);
    const ngayHetHanMoi = newDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const seHoatDong = ngayHetHanMoi >= today;

    return {
      ky,
      soNgayThem,
      ngayHetHanCu: activeCardToRenew.ngayHetHan,
      ngayHetHanMoi,
      tongTien,
      seHoatDong
    };
  };

  const preview = calculateRenewPreview();

  const handleConfirmRenew = async () => {
    if (!activeCardToRenew) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.renewPackage({
        maThe: activeCardToRenew.maThe,
        soKyGiaHan: parseInt(soKyGiaHan, 10),
        maNhanVien: 'NV005',
        phuongThucThanhToan: paymentMethod
      });

      if (res.success) {
        setSuccessReceipt(res.data);
        setActiveCardToRenew(null);
        handleSelectMember(selectedMember);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Gia Hạn Thẻ Tập Theo Kỳ</h2>
            <p className="text-xs text-slate-500">Tự động cộng dồn thời hạn, xuất hóa đơn gia hạn và kích hoạt lại thẻ hết hạn</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="badge-neutral font-mono">Formula: Hạn mới = Hạn cũ + (Kỳ × 30 ngày)</span>
          <span className="badge-active">Nhân viên: NV005</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-lg text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Grid: 4 cols Member Directory, 8 cols Cards & Renewal Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Member Search */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <span>Tra Cứu Hội Viên</span>
            </h3>
            <span className="badge-neutral font-mono">{memberList.length}</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã HV hoặc SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="form-input-pro"
            />
            <button
              onClick={() => handleSearch()}
              className="btn-primary-sport text-xs px-3"
            >
              Tìm
            </button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {memberList.map((m, idx) => {
              const isSelected = selectedMember?.maHoiVien === m.maHoiVien;
              return (
                <div
                  key={m.maHoiVien}
                  onClick={() => handleSelectMember(m)}
                  className={`
                    p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between
                    ${isSelected
                      ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}
                  `}
                >
                  <div>
                    <p className="font-bold text-slate-900">{m.hoTen}</p>
                    <p className="font-mono text-[11px] text-slate-500 mt-0.5">{m.maHoiVien} • {m.soDienThoai}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Member Overview & Card Packages List */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedMember ? (
            <div className="bg-white rounded-xl p-12 border border-slate-200 text-center text-slate-400 text-xs">
              Vui lòng chọn 1 hội viên ở danh sách bên trái để kiểm tra thẻ tập
            </div>
          ) : (
            <>
              {/* Member Brief Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Hội viên:</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedMember.hoTen}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Mã số:</span>
                    <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{selectedMember.maHoiVien}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Điện thoại:</span>
                    <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{selectedMember.soDienThoai}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Trạng thái:</span>
                    <div className="mt-0.5">
                      <span className="badge-active">{selectedMember.trangThai}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards List on Selected Member */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Danh Sách Gói Tập Thuộc Thẻ Hội Viên ({cards.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Một thẻ duy nhất tích hợp nhiều gói</span>
                </div>

                {cards.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Hội viên chưa có gói tập nào trên thẻ. Vui lòng vào màn hình Bán Gói Tập để mua mới.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cards.map((card, idx) => {
                      const isExpired = card.trangThai === 'Hết hạn';
                      const isTerminated = card.trangThai === 'Đã kết thúc';
                      return (
                        <div
                          key={card.maThe}
                          className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
                              <Dumbbell className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">{card.tenGoiTap}</h4>
                                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-600">
                                  {card.maThe}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                <span>Giá kỳ: <strong className="font-mono text-slate-800">{Number(card.donGia).toLocaleString('vi-VN')} đ</strong></span>
                                <span>Hạn dùng: <strong className={`font-mono ${isExpired ? 'text-rose-600' : 'text-blue-900'}`}>{card.ngayHetHan}</strong></span>
                                <span>Hình thức: <strong className="text-slate-700">{card.hinhThucTap}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={isExpired ? 'badge-danger' : isTerminated ? 'badge-neutral' : 'badge-active'}>
                              {card.trangThai}
                            </span>

                            {!isTerminated && (
                              <button
                                onClick={() => {
                                  setActiveCardToRenew(card);
                                  setSoKyGiaHan(1);
                                }}
                                className="btn-accent-sport text-xs py-1.5 px-3.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Gia Hạn</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Renewal Calculation & Confirmation Modal */}
      {activeCardToRenew && preview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-orange-600" />
                <span>Gia Hạn Gói: {activeCardToRenew.tenGoiTap}</span>
              </h3>
              <button
                onClick={() => setActiveCardToRenew(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="form-label-pro">
                  Số kỳ gia hạn (*) ({activeCardToRenew.soNgayMacDinh} ngày/kỳ)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={soKyGiaHan}
                  onChange={(e) => setSoKyGiaHan(e.target.value)}
                  className="form-input-pro font-mono font-bold"
                />
              </div>

              {/* Exact Formula Breakdown Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn hết cũ:</span>
                  <span className="font-mono font-semibold text-slate-800">{preview.ngayHetHanCu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số ngày cộng thêm:</span>
                  <span className="font-bold text-blue-700">+{preview.soNgayThem} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn hết mới dự kiến:</span>
                  <span className="font-mono font-bold text-blue-900 text-sm">{preview.ngayHetHanMoi}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Tổng tiền thu:</span>
                  <span className="font-mono font-bold text-orange-600 text-base">
                    {preview.tongTien.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>

              {!preview.seHoatDong && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>Cảnh báo: Sau khi gia hạn {soKyGiaHan} kỳ, ngày hết hạn mới vẫn trước ngày hiện tại! Thẻ vẫn ở trạng thái Hết hạn.</span>
                </div>
              )}

              <div>
                <label className="form-label-pro">Phương Thức Thanh Toán</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Chuyển khoản', 'Tiền mặt'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`
                        py-2 rounded-lg border text-center font-bold transition-all
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
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveCardToRenew(null)}
                className="btn-secondary-pro text-xs py-2 px-4"
              >
                Hủy bỏ
              </button>
              <button
                disabled={loading}
                onClick={handleConfirmRenew}
                className="btn-accent-sport text-xs py-2 px-4"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xác Nhận & Lập Hóa Đơn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successReceipt && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-950 text-sm">Gia hạn thành công gói tập!</p>
              <p className="text-emerald-800 mt-0.5">
                Mã HĐ: <strong className="font-mono">{successReceipt.maHoaDon}</strong> • Hạn cũ: {successReceipt.ngayHetHanCu} → Hạn mới: <strong className="font-bold text-blue-900">{successReceipt.ngayHetHanMoi}</strong> • Số tiền: {Number(successReceipt.tongTien).toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessReceipt(null)}
            className="btn-secondary-pro text-xs py-1 px-3"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
