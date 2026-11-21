import React from 'react';
import { 
  Calendar, ShoppingCart, UserPlus, UserCheck, 
  RefreshCw, StopCircle, Sliders, BookOpen, History,
  Activity, ShieldCheck, ChevronRight, Menu, X, Dumbbell,
  Clock, CheckCircle2, TrendingUp, Users, User, CreditCard,
  FileText, Sparkles, UserCog, HeartHandshake, LogOut, LogIn
} from 'lucide-react';

export default function Navbar({ 
  currentUser,
  activeTab, 
  setActiveTab, 
  stats, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  onLogout,
  onOpenLoginModal
}) {
  const role = currentUser?.role || 'khach-hang';

  // Navigation structure segmented strictly by logged-in role
  const roleMenus = {
    'khach-hang': [
      {
        group: 'Cổng Khách Hàng',
        items: [
          { id: 'kh-portal', label: 'Khám Phá Gym & Gói Tập', icon: Sparkles, badge: 'Dịch vụ' },
          { id: 'tu-van', label: 'Đặt lịch tư vấn trực tuyến', icon: Calendar, badge: '30m' },
        ]
      }
    ],
    'hoi-vien': [
      {
        group: 'Không Gian Hội Viên',
        items: [
          { id: 'the-tap', label: 'Thẻ & Gói Tập Của Tôi', icon: CreditCard, badge: 'Thẻ' },
          { id: 'dat-cho', label: 'Đặt Chỗ Lớp Studio', icon: Calendar, badge: 'Studio' },
          { id: 'ho-so', label: 'Hồ Sơ Cá Nhân', icon: User, badge: 'Cá nhân' },
          { id: 'hoa-don', label: 'Lịch Sử Giao Dịch', icon: FileText, badge: 'Hóa đơn' },
        ]
      }
    ],
    'nhan-vien': [
      {
        group: 'Nghiệp Vụ Bán Hàng & Tiếp Đón',
        items: [
          { id: 'ban-goi', label: 'Đăng ký trực tiếp – Bán gói tập', icon: ShoppingCart, badge: 'POS' },
          { id: 'tao-hv', label: 'Tạo tài khoản hội viên mới', icon: UserPlus, badge: 'Mới' },
          { id: 'sua-tt', label: 'Sửa thông tin khách hàng', icon: UserCheck, badge: 'Hồ sơ' },
          { id: 'tu-van-admin', label: 'Sổ lịch hẹn tư vấn', icon: Calendar, badge: 'Lịch hẹn' }
        ]
      },
      {
        group: 'Quản Trị Gói Tập & Thẻ',
        items: [
          { id: 'gia-han', label: 'Gia hạn gói tập', icon: RefreshCw, badge: 'Gia hạn' },
          { id: 'ket-thuc', label: 'Kết thúc gói tập', icon: StopCircle, badge: 'Kết thúc' },
          { id: 'sua-goi', label: 'Sửa thông tin gói tập', icon: Sliders, badge: 'Sửa gói' },
          { id: 'lop-hoc', label: 'Lớp học & Đặt chỗ', icon: BookOpen, badge: 'Lớp' }
        ]
      }
    ]
  };

  const currentNavSections = roleMenus[role] || [];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
      lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
        <div className="flex items-center gap-3 select-none">
          <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black shadow-sm">
            <Dumbbell className="w-5 h-5 -rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                GYM<span className="text-orange-600">SPACE</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              Quản Trị Trung Tâm Thể Hình
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Indicator Banner - ONLY for Logged In Members & Staff */}
      {role !== 'khach-hang' && (
        <div className="p-3 border-b border-slate-200 bg-slate-100/70 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tài Khoản Đang Đăng Nhập
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đang trực tuyến"></span>
          </div>

          {role === 'hoi-vien' && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-2.5 py-1.5 text-xs text-orange-900 font-bold">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Hội Viên: {currentUser.hoTen || currentUser.tenDangNhap}</span>
              </div>
            </div>
          )}

          {role === 'nhan-vien' && (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs text-indigo-900 font-bold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nhân Viên: {currentUser.hoTen || currentUser.maNhanVien}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role-Specific Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        {currentNavSections.map((section, sIdx) => (
          <div key={sIdx}>
            <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {section.group}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group text-left
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <span className={`
                      text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0
                      ${isActive ? 'bg-blue-700/60 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                    `}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Identity & Logout Footer */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex-shrink-0">
        {role === 'khach-hang' ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
              <User className="w-4 h-4 text-blue-600" />
              <span>Dành Cho Thành Viên</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Đăng nhập để xem gói tập, thời khóa biểu và quyền lợi hội viên.
            </p>
            <button
              onClick={onOpenLoginModal}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập Thành Viên</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs border ${
                role === 'hoi-vien'
                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : 'bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}>
                {currentUser?.hoTen ? currentUser.hoTen.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.hoTen || currentUser?.tenDangNhap}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {role === 'hoi-vien' ? `Mã HV: ${currentUser?.maHoiVien || currentUser?.id}` : `Mã NV: ${currentUser?.maNhanVien || currentUser?.id} • ${currentUser?.vaiTro || 'Nhân viên'}`}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full py-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
