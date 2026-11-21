import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Search, Edit3, X, Save, AlertCircle, 
  CheckCircle, History, Phone, User, Mail, Calendar,
  Lock, RotateCcw, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function SuaThongTin() {
  const [activeSubTab, setActiveSubTab] = useState('hoivien'); // 'hoivien' | 'khachhang'
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cachedItem, setCachedItem] = useState(null); // Bộ nhớ đệm để khôi phục khi HỦY BỎ
  const [formFields, setFormFields] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    ngaySinh: '',
    gioiTinh: 'Nam'
  });
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, [activeSubTab]);

  const handleSearch = async (kw = keyword) => {
    setError('');
    setSuccessMsg('');
    try {
      if (activeSubTab === 'hoivien') {
        const res = await api.searchMembers(kw);
        if (res.success) setList(res.data);
      } else {
        const res = await api.searchCustomers(kw);
        if (res.success) setList(res.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setCachedItem({ ...item });
    setFormFields({
      hoTen: item.hoTen || '',
      soDienThoai: item.soDienThoai || '',
      email: item.email || '',
      ngaySinh: item.ngaySinh || '',
      gioiTinh: item.gioiTinh || 'Nam'
    });
    setPhoneError('');
    setError('');
    setSuccessMsg('');
    setIsSaved(false);
  };

  const handleCancel = () => {
    if (cachedItem) {
      setFormFields({
        hoTen: cachedItem.hoTen || '',
        soDienThoai: cachedItem.soDienThoai || '',
        email: cachedItem.email || '',
        ngaySinh: cachedItem.ngaySinh || '',
        gioiTinh: cachedItem.gioiTinh || 'Nam'
      });
    }
    setPhoneError('');
    setError('');
    setSuccessMsg('Đã hủy bỏ thao tác và khôi phục dữ liệu ban đầu từ bộ nhớ đệm!');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setError('');
    setSuccessMsg('');

    if (!formFields.hoTen.trim()) {
      setError('Họ và tên không được để trống!');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formFields.soDienThoai.trim())) {
      setPhoneError('Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng 10 chữ số (bắt đầu bằng 0).');
      return;
    }

    setLoading(true);
    try {
      if (activeSubTab === 'hoivien') {
        const res = await api.updateMember(selectedItem.maHoiVien, {
          hoTen: formFields.hoTen.trim(),
          soDienThoai: formFields.soDienThoai.trim(),
          maNhanVien: 'NV005'
        });
        if (res.success) {
          setSuccessMsg('Cập nhật thông tin hội viên thành công!');
          setIsSaved(true);
          setCachedItem({ ...selectedItem, ...formFields });
          handleSearch();
        }
      } else {
        const res = await api.updateCustomer(selectedItem.maKhachHang, {
          hoTen: formFields.hoTen.trim(),
          soDienThoai: formFields.soDienThoai.trim(),
          email: formFields.email.trim(),
          ngaySinh: formFields.ngaySinh,
          gioiTinh: formFields.gioiTinh,
          maNhanVien: 'NV005'
        });
        if (res.success) {
          setSuccessMsg('Cập nhật thông tin khách hàng thành công!');
          setIsSaved(true);
          setCachedItem({ ...selectedItem, ...formFields });
          handleSearch();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Segment Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Quản Lý & Sửa Thông Tin Hồ Sơ</h2>
            <p className="text-xs text-slate-500">Khóa mã định danh, kiểm tra Regex 10 số và cập nhật thông tin đồng bộ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSubTab('hoivien');
              setSelectedItem(null);
              setKeyword('');
            }}
            className={`
              px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all
              ${activeSubTab === 'hoivien'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
            `}
          >
            Hồ Sơ Hội Viên (Mã HV)
          </button>
          <button
            onClick={() => {
              setActiveSubTab('khachhang');
              setSelectedItem(null);
              setKeyword('');
            }}
            className={`
              px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all
              ${activeSubTab === 'khachhang'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
            `}
          >
            Hồ Sơ Khách Hàng (Mã KH)
          </button>
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

      {/* Grid: 6 cols Directory, 6 cols Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Grid */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh Mục {activeSubTab === 'hoivien' ? 'Hội Viên' : 'Khách Hàng'}
            </h3>
            <span className="badge-neutral font-mono">{list.length} mục</span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={activeSubTab === 'hoivien' ? 'Tìm theo mã HV hoặc họ tên...' : 'Tìm theo mã KH hoặc SĐT...'}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="form-input-pro pl-9"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="btn-primary-sport text-xs px-4"
            >
              Tìm
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead>
                <tr>
                  <th className="table-header-cell">Mã</th>
                  {activeSubTab === 'hoivien' && <th className="table-header-cell">Username</th>}
                  <th className="table-header-cell">Họ Tên</th>
                  <th className="table-header-cell">SĐT</th>
                  <th className="table-header-cell text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                      Không tìm thấy dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  list.map((item) => {
                    const id = activeSubTab === 'hoivien' ? item.maHoiVien : item.maKhachHang;
                    const isSelected = (activeSubTab === 'hoivien' ? selectedItem?.maHoiVien : selectedItem?.maKhachHang) === id;
                    return (
                      <tr
                        key={id}
                        className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/70' : ''}`}
                      >
                        <td className="table-body-cell font-mono font-bold text-blue-700">{id}</td>
                        {activeSubTab === 'hoivien' && <td className="table-body-cell font-mono text-slate-600">{item.tenDangNhap}</td>}
                        <td className="table-body-cell font-semibold text-slate-800">{item.hoTen}</td>
                        <td className="table-body-cell font-mono text-slate-600">{item.soDienThoai}</td>
                        <td className="table-body-cell text-center">
                          <button
                            onClick={() => handleSelectItem(item)}
                            className={`
                              px-2.5 py-1 rounded text-[11px] font-bold transition-all
                              ${isSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                            `}
                          >
                            Chọn sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Editor Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Biểu Mẫu Chỉnh Sửa Dữ Liệu</span>
            </h3>
            {selectedItem && (
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {activeSubTab === 'hoivien' ? selectedItem.maHoiVien : selectedItem.maKhachHang}
              </span>
            )}
          </div>

          {!selectedItem ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs">Vui lòng chọn 1 bản ghi ở danh sách bên trái để chỉnh sửa</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Readonly locked keys */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-pro flex items-center gap-1.5 text-slate-500">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Mã định danh (Khóa)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeSubTab === 'hoivien' ? selectedItem.maHoiVien : selectedItem.maKhachHang}
                    className="form-input-pro font-mono bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                  />
                </div>

                {activeSubTab === 'hoivien' && (
                  <div>
                    <label className="form-label-pro flex items-center gap-1.5 text-slate-500">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Tên đăng nhập (Khóa)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedItem.tenDangNhap}
                      className="form-input-pro font-mono bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Editable Fields */}
              <div>
                <label className="form-label-pro">Họ và Tên (*)</label>
                <input
                  type="text"
                  value={formFields.hoTen}
                  onChange={(e) => {
                    setFormFields({ ...formFields, hoTen: e.target.value });
                    setIsSaved(false);
                  }}
                  required
                  className="form-input-pro font-semibold"
                />
              </div>

              <div>
                <label className="form-label-pro">Số Điện Thoại (*) (10 số)</label>
                <input
                  type="tel"
                  value={formFields.soDienThoai}
                  onChange={(e) => {
                    setFormFields({ ...formFields, soDienThoai: e.target.value });
                    setPhoneError('');
                    setIsSaved(false);
                  }}
                  required
                  className={`form-input-pro font-mono ${phoneError ? 'border-rose-500 ring-1 ring-rose-500 text-rose-700' : ''}`}
                />
                {phoneError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{phoneError}</p>
                )}
              </div>

              {activeSubTab === 'khachhang' && (
                <>
                  <div>
                    <label className="form-label-pro">Email</label>
                    <input
                      type="email"
                      value={formFields.email}
                      onChange={(e) => {
                        setFormFields({ ...formFields, email: e.target.value });
                        setIsSaved(false);
                      }}
                      className="form-input-pro"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label-pro">Ngày Sinh</label>
                      <input
                        type="date"
                        value={formFields.ngaySinh || ''}
                        onChange={(e) => {
                          setFormFields({ ...formFields, ngaySinh: e.target.value });
                          setIsSaved(false);
                        }}
                        className="form-input-pro font-mono"
                      />
                    </div>
                    <div>
                      <label className="form-label-pro">Giới Tính</label>
                      <select
                        value={formFields.gioiTinh}
                        onChange={(e) => {
                          setFormFields({ ...formFields, gioiTinh: e.target.value });
                          setIsSaved(false);
                        }}
                        className="form-input-pro bg-white"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons: CANCEL (Rollback cache) & SAVE */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary-pro text-xs py-2 px-4"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>HỦY BỎ (KHÔI PHỤC)</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || isSaved}
                  className="btn-primary-sport text-xs py-2 px-5"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU THAY ĐỔI</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
