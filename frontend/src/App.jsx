import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import GuestPortal from './components/GuestPortal';
import MemberPortal from './components/MemberPortal';
import DatLichTuVan from './components/DatLichTuVan';
import BanGoiTap from './components/BanGoiTap';
import TaoTaiKhoan from './components/TaoTaiKhoan';
import SuaThongTin from './components/SuaThongTin';
import GiaHanGoi from './components/GiaHanGoi';
import KetThucGoi from './components/KetThucGoi';
import SuaGoiTap from './components/SuaGoiTap';
import LopHocDatCho from './components/LopHocDatCho';
import { api } from './services/api';
import { 
  Users, Calendar, CreditCard, HeartPulse, 
  Menu, Bell, Search, Activity, Dumbbell, ShieldCheck,
  ChevronRight, MapPin, Building, User, UserCheck, Sparkles,
  LogOut, LogIn, KeyRound
} from 'lucide-react';

const TAB_TITLES = {
  // Cổng Khách Hàng
  'kh-portal': { title: 'Khám Phá Phòng Tập & Bảng Giá Gói Tập', category: 'Cổng Khách Hàng', code: 'PORTAL-GUEST' },
  'tu-van': { title: 'Đặt lịch tư vấn trực tuyến', category: 'Use Case 1', code: 'UC-01' },

  // Cổng Hội Viên
  'the-tap': { title: 'Thẻ Hội Viên & Gói Tập Của Tôi', category: 'Không Gian Hội Viên', code: 'MOD-CARD' },
  'dat-cho': { title: 'Đặt Chỗ & Lịch Studio Của Tôi', category: 'Không Gian Hội Viên', code: 'MOD-STUDIO-BOOK' },
  'ho-so': { title: 'Hồ Sơ & Thông Tin Cá Nhân', category: 'Không Gian Hội Viên', code: 'MOD-MY-PROFILE' },
  'hoa-don': { title: 'Lịch Sử Giao Dịch & Hóa Đơn', category: 'Không Gian Hội Viên', code: 'MOD-MY-INVOICE' },

  // Cổng Nhân Viên - Chuẩn hóa chính xác 100% theo tên đặc tả Use Case trong tài liệu
  'ban-goi': { title: 'Đăng ký trực tiếp – Bán gói tập', category: 'Use Case 2', code: 'UC-02' },
  'tao-hv': { title: 'Tạo tài khoản hội viên mới', category: 'Use Case 3', code: 'UC-03' },
  'ket-thuc': { title: 'Kết thúc gói tập', category: 'Use Case 4', code: 'UC-04' },
  'sua-tt': { title: 'Sửa thông tin khách hàng', category: 'Use Case 5', code: 'UC-05' },
  'gia-han': { title: 'Gia hạn gói tập', category: 'Use Case 6', code: 'UC-06' },
  'sua-goi': { title: 'Sửa thông tin gói tập', category: 'Use Case 7', code: 'UC-07' },
  'tu-van-admin': { title: 'Sổ lịch hẹn tư vấn', category: 'Nghiệp vụ Tiếp đón', code: 'UC-01-ADMIN' },
  'lop-hoc': { title: 'Lớp học & Đặt chỗ', category: 'Vận hành Studio', code: 'MOD-CLASS' },
};

export default function App() {
  // Authentication & Current User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gymspace_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (currentUser?.role === 'nhan-vien') return 'ban-goi';
    if (currentUser?.role === 'hoi-vien') return 'the-tap';
    return 'kh-portal';
  });

  const [stats, setStats] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saleCustomerPrefill, setSaleCustomerPrefill] = useState(null);
  const [memberCreatePrefill, setMemberCreatePrefill] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error('Lỗi lấy thống kê:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('gymspace_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }

    // Set default initial tab based on role
    if (user.role === 'nhan-vien') {
      setActiveTab('ban-goi');
    } else if (user.role === 'hoi-vien') {
      setActiveTab('the-tap');
    } else {
      setActiveTab('kh-portal');
    }
    setIsLoginModalOpen(false);
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('gymspace_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setActiveTab('kh-portal');
    setIsLoginModalOpen(false);
  };

  const currentTabInfo = TAB_TITLES[activeTab] || { title: 'GymSpace Management Workstation', category: 'Hệ Thống' };
  const userRole = currentUser?.role || 'khach-hang';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Login Authentication Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Left Navigation Sidebar */}
      <Navbar 
        currentUser={currentUser}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={stats}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Workstation Viewport */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Operations Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button on mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb & Section Name */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <span>GYMSPACE</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-blue-600 truncate">{currentTabInfo.category}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {currentTabInfo.title}
              </h1>
            </div>
          </div>

          {/* Top User Info & Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* User Profile Badge based on Role */}
            {currentUser && userRole !== 'khach-hang' ? (
              <div className="flex items-center gap-2">
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                  userRole === 'nhan-vien' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    : 'bg-orange-50 border-orange-200 text-orange-900'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    userRole === 'nhan-vien' ? 'bg-indigo-600' : 'bg-orange-500'
                  }`} />
                  <span className="font-bold">{currentUser.hoTen || currentUser.tenDangNhap}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {userRole === 'nhan-vien' ? `NV: ${currentUser.maNhanVien || currentUser.id}` : `HV: ${currentUser.maHoiVien || currentUser.id}`}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng Xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm hover:shadow"
              >
                <LogIn className="w-4 h-4 text-orange-300" />
                <span>Đăng Nhập Thành Viên</span>
              </button>
            )}

            {/* Quick Metrics Strip - ONLY VISIBLE TO NHÂN VIÊN */}
            {stats && userRole === 'nhan-vien' && (
              <div className="hidden xl:flex items-center gap-3 pl-2 pr-3 border-l border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="font-mono font-bold text-slate-900">{stats.hoiVienHoatDong}</span>
                  <span className="text-slate-400">Hội viên</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="font-mono font-bold text-slate-900">{stats.lichHenSapToi}</span>
                  <span className="text-slate-400">Lịch hẹn</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="font-mono font-bold text-slate-900">{(stats.tongDoanhThu || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {/* Dynamic Screen View according to Active Role & Tab */}
          <div className="space-y-6">
            {/* 1. ROLE: KHÁCH HÀNG */}
            {userRole === 'khach-hang' && (
              <>
                {activeTab === 'kh-portal' && (
                  <GuestPortal 
                    onSwitchToConsultation={() => setActiveTab('tu-van')} 
                    onOpenLoginModal={() => setIsLoginModalOpen(true)}
                  />
                )}
                {activeTab === 'tu-van' && <DatLichTuVan isStaffView={false} />}
              </>
            )}

            {/* 2. ROLE: HỘI VIÊN / NGƯỜI DÙNG */}
            {userRole === 'hoi-vien' && (
              <MemberPortal 
                currentUser={currentUser} 
                activeSubTab={activeTab} 
                onTabChange={(tab) => setActiveTab(tab)} 
              />
            )}

            {/* 3. ROLE: NHÂN VIÊN */}
            {userRole === 'nhan-vien' && (
              <>
                {activeTab === 'ban-goi' && (
                  <BanGoiTap 
                    initialCustomer={saleCustomerPrefill}
                    onGoToCreateMember={(data) => {
                      setMemberCreatePrefill(data);
                      setActiveTab('tao-hv');
                    }}
                    onGoToRenew={() => setActiveTab('gia-han')}
                  />
                )}
                {activeTab === 'tu-van-admin' && (
                  <DatLichTuVan 
                    isStaffView={true} 
                    onGoToSale={(cust) => {
                      setSaleCustomerPrefill(cust);
                      setActiveTab('ban-goi');
                    }}
                  />
                )}
                {activeTab === 'tao-hv' && (
                  <TaoTaiKhoan 
                    prefillData={memberCreatePrefill}
                    onClearPrefill={() => setMemberCreatePrefill(null)}
                  />
                )}
                {activeTab === 'sua-tt' && <SuaThongTin />}
                {activeTab === 'gia-han' && <GiaHanGoi />}
                {activeTab === 'ket-thuc' && <KetThucGoi />}
                {activeTab === 'sua-goi' && <SuaGoiTap />}
                {activeTab === 'lop-hoc' && <LopHocDatCho />}
              </>
            )}
          </div>
        </main>

        {/* Commercial Enterprise Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">GymSpace Fitness Management System</span>
              {userRole !== 'khach-hang' && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-blue-700">
                    Đăng nhập: {userRole === 'hoi-vien' ? `Hội Viên (${currentUser?.hoTen || currentUser?.tenDangNhap})` : `Nhân Viên (${currentUser?.hoTen || currentUser?.maNhanVien})`}
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              © 2026 GymSpace Inc. All rights reserved. • Hotline: 1900 6868
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
