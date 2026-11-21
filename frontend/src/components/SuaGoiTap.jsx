import React, { useState, useEffect } from 'react';
import { 
  Sliders, Search, Save, X, AlertTriangle, 
  CheckCircle, Dumbbell, Calendar, ShieldCheck,
  ChevronRight, Lock
} from 'lucide-react';
import { api } from '../services/api';

export default function SuaGoiTap() {
  const [keyword, setKeyword] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [newFormat, setNewFormat] = useState('Trực tiếp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    setEditingCard(null);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.getMemberCards(m.maHoiVien);
      if (res.success) {
        setCards(res.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setNewFormat(card.hinhThucTap || 'Trực tiếp');
    setError('');
    setSuccessMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingCard) return;

    if (editingCard.hinhThucTap === newFormat) {
      setError('Thông tin chưa có thay đổi so với hình thức hiện tại!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.updatePackageFormat({
        maThe: editingCard.maThe,
        hinhThucTapMoi: newFormat,
        maNhanVien: 'NV005'
      });

      if (res.success) {
        setSuccessMsg(`Cập nhật thông tin gói tập ${editingCard.tenGoiTap} thành công sang hình thức "${newFormat}"!`);
        setEditingCard(null);
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
      {/* Top Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Sửa thông tin gói tập</h2>
            <p className="text-xs text-slate-500">Cho phép cập nhật hình thức tập, bảo toàn nguyên vẹn ngày kích hoạt, ngày hết hạn và số dư</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="badge-neutral font-mono">Quy tắc: Không đổi ngày hết hạn</span>
          <span className="badge-active">Nhân viên: NV005</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-lg text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-lg text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* Grid: 4 cols Member Directory, 8 cols Cards & Format Editor */}
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

        {/* Right Column: Member Cards & Editor */}
        <div className="lg:col-span-8 space-y-5">
          {!selectedMember ? (
            <div className="bg-white rounded-xl p-16 border border-slate-200 text-center text-slate-400 text-xs">
              Vui lòng chọn 1 hội viên ở danh sách bên trái để xem các gói tập
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Gói Tập Của Hội Viên: <strong className="text-slate-900 font-extrabold">{selectedMember.hoTen}</strong>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">Mã số: {selectedMember.maHoiVien}</p>
                </div>
                <span className="badge-neutral font-mono">{cards.length} gói</span>
              </div>

              <div className="space-y-3">
                {cards.map((c) => (
                  <div
                    key={c.maThe}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {c.maThe}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{c.tenGoiTap}</h4>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                        <span>Hình thức hiện tại: <strong className="text-orange-600 font-bold">{c.hinhThucTap}</strong></span>
                        <span>Hạn dùng: <strong className="font-mono text-slate-700">{c.ngayHetHan}</strong></span>
                        <span>Trạng thái: <strong className="text-emerald-700">{c.trangThai}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="btn-secondary-pro text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sửa hình thức</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Inline Editor Drawer */}
              {editingCard && (
                <div className="mt-5 p-5 bg-slate-50 border border-blue-300 rounded-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>Cập Nhật Hình Thức Cho Thẻ: {editingCard.tenGoiTap}</span>
                    </h4>
                    <button
                      onClick={() => setEditingCard(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 font-medium">Mã Thẻ (Khóa):</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5">{editingCard.maThe}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Kích hoạt:</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5">{editingCard.ngayKichHoat}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Hết hạn:</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5">{editingCard.ngayHetHan}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Trạng thái:</span>
                        <p className="font-bold text-emerald-700 mt-0.5">{editingCard.trangThai}</p>
                      </div>
                    </div>

                    <div>
                      <label className="form-label-pro">
                        Chọn Hình Thức Tập Mới (*)
                      </label>
                      <select
                        value={newFormat}
                        onChange={(e) => setNewFormat(e.target.value)}
                        className="form-input-pro bg-white font-semibold"
                      >
                        <option value="Trực tiếp">Trực tiếp (Tập trực tiếp tại trung tâm)</option>
                        <option value="Trực tuyến">Trực tuyến (Online qua ứng dụng GymSpace)</option>
                        <option value="Kèm 1-1">Kèm 1-1 (Huấn luyện viên cá nhân PT)</option>
                        <option value="Toàn diện">Toàn diện (Tự do tham gia mọi studio & cơ sở)</option>
                        <option value="Linh hoạt">Linh hoạt (Kết hợp trực tiếp & online)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditingCard(null)}
                        className="btn-secondary-pro text-xs py-2 px-4"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary-sport text-xs py-2 px-5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu Thay Đổi</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
