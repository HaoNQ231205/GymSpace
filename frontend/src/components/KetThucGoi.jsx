import React, { useState, useEffect } from 'react';
import { 
  StopCircle, Search, AlertTriangle, CheckCircle, 
  Dumbbell, Calendar, ShieldAlert, XCircle, X, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function KetThucGoi() {
  const [keyword, setKeyword] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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

  const handleSelectMember = async (m) => {
    setSelectedMember(m);
    setSelectedCard(null);
    setResult(null);
    setError('');
    try {
      const res = await api.getMemberCards(m.maHoiVien);
      if (res.success) {
        setCards(res.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenConfirm = () => {
    if (!selectedCard) {
      setError('Vui lòng chọn 1 gói tập đang ở trạng thái Hoạt động để kết thúc!');
      return;
    }
    if (selectedCard.trangThai !== 'Hoạt động') {
      setError('Chỉ có thể kết thúc gói tập đang ở trạng thái "Hoạt động"!');
      return;
    }
    setError('');
    setConfirmModal(true);
  };

  const handleExecuteTerminate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.terminatePackage({
        maThe: selectedCard.maThe,
        maHoiVien: selectedMember.maHoiVien,
        maNhanVien: 'NV005'
      });

      if (res.success) {
        setResult(res.data);
        setConfirmModal(false);
        setSelectedCard(null);
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
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <StopCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Kết thúc gói tập</h2>
            <p className="text-xs text-slate-500">Chuyển trạng thái thẻ sang 'Đã kết thúc' và tự động hủy lịch đặt lớp nếu hội viên hết gói</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="badge-neutral font-mono">Quy tắc: Hủy đặt chỗ nếu hết gói</span>
          <span className="badge-active">Nhân viên: NV005</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-lg text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Kết thúc gói tập {result.tenGoiTap} ({result.maThe}) thành công!</span>
          </div>
          <p className="text-emerald-700">
            {result.conGoiHoatDongKhac
              ? 'Hội viên vẫn còn gói tập hoạt động khác trên thẻ.'
              : `Hệ thống đã tự động hủy ${result.soLopBiHuy} lượt đặt chỗ lớp học tương lai và hoàn lại sĩ số cho phòng tập.`}
          </p>
        </div>
      )}

      {/* Grid: 4 cols Directory, 8 cols Active Package Table */}
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
              placeholder="Mã HV hoặc SĐT..."
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
            {memberList.map((m) => {
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

        {/* Right Column: Member Packages Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Gói Tập Thuộc Hội Viên
              </h3>
              {selectedMember && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Hội viên: <strong className="text-slate-900">{selectedMember.hoTen}</strong> • Mã: <span className="font-mono text-blue-700 font-bold">{selectedMember.maHoiVien}</span>
                </p>
              )}
            </div>
            {selectedMember && <span className="badge-active">{selectedMember.trangThai}</span>}
          </div>

          {!selectedMember ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Vui lòng chọn 1 hội viên ở danh sách bên trái
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr>
                      <th className="table-header-cell text-center w-12">Chọn</th>
                      <th className="table-header-cell">Mã Thẻ</th>
                      <th className="table-header-cell">Tên Gói Tập</th>
                      <th className="table-header-cell">Kích Hoạt</th>
                      <th className="table-header-cell">Hết Hạn</th>
                      <th className="table-header-cell">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cards.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                          Hội viên chưa có gói tập nào
                        </td>
                      </tr>
                    ) : (
                      cards.map((c) => {
                        const isSelected = selectedCard?.maThe === c.maThe;
                        const isActionable = c.trangThai === 'Hoạt động';
                        return (
                          <tr
                            key={c.maThe}
                            onClick={() => isActionable && setSelectedCard(c)}
                            className={`transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-50 font-semibold'
                                : isActionable
                                ? 'hover:bg-slate-50'
                                : 'bg-slate-50/60 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <td className="table-body-cell text-center">
                              <input
                                type="radio"
                                name="selectedPackage"
                                disabled={!isActionable}
                                checked={isSelected}
                                onChange={() => setSelectedCard(c)}
                                className="cursor-pointer text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="table-body-cell font-mono font-bold text-blue-700">{c.maThe}</td>
                            <td className="table-body-cell font-bold text-slate-900">{c.tenGoiTap}</td>
                            <td className="table-body-cell font-mono text-slate-600">{c.ngayKichHoat}</td>
                            <td className="table-body-cell font-mono text-slate-600">{c.ngayHetHan}</td>
                            <td className="table-body-cell">
                              <span className={c.trangThai === 'Hoạt động' ? 'badge-active' : 'badge-neutral'}>
                                {c.trangThai}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  disabled={!selectedCard || selectedCard.trangThai !== 'Hoạt động'}
                  onClick={handleOpenConfirm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>KẾT THÚC GÓI ĐÃ CHỌN</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      {confirmModal && selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-3 border-b border-slate-100">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-base text-slate-900">Xác Nhận Kết Thúc Gói Tập</h3>
                <p className="text-xs text-rose-600 font-medium">Thao tác này sẽ chuyển trạng thái thẻ vĩnh viễn!</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Gói tập:</span>
                <span className="font-bold text-slate-900">{selectedCard.tenGoiTap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã thẻ:</span>
                <span className="font-mono font-bold text-blue-700">{selectedCard.maThe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày kích hoạt:</span>
                <span className="font-mono text-slate-800">{selectedCard.ngayKichHoat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày hết hạn hiện tại:</span>
                <span className="font-mono text-slate-800">{selectedCard.ngayHetHan}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Trạng thái gói tập sẽ chuyển thành <strong className="text-rose-700">"Đã kết thúc"</strong>. Nếu hội viên không còn gói tập nào khác ở trạng thái "Hoạt động", các lượt đặt chỗ tương lai sẽ tự động bị hủy và hoàn lại chỗ trống cho lớp học.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmModal(false)}
                className="btn-secondary-pro text-xs py-2 px-4"
              >
                Hủy bỏ
              </button>
              <button
                disabled={loading}
                onClick={handleExecuteTerminate}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Xác Nhận Kết Thúc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
