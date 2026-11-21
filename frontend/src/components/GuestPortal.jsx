import React, { useState, useEffect } from 'react';
import DatLichTuVan from './DatLichTuVan';
import { api } from '../services/api';
import { 
  Calendar, Dumbbell, Sparkles, CheckCircle2, Clock, 
  MapPin, UserCheck, Flame, ArrowRight, ShieldCheck,
  Award, HeartHandshake, PhoneCall, ChevronRight, Info, LogIn,
  Building, Check, Star, Zap, Lock, ShowerHead, Droplets,
  Layers, Compass, BadgeCheck
} from 'lucide-react';

// Package Imagery & Details Mapping
const PACKAGE_IMAGES = {
  'G01': {
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Thư giãn cơ thể, dẻo dai và định hình vóc dáng chuẩn',
    badge: 'Lớp Studio',
    tagColor: 'bg-emerald-600 text-white',
    features: [
      'Không giới hạn số lần check-in tập Yoga trong tháng',
      'Tham gia các lớp Yoga Chào Ngày Mới, Vinyasa, Hatha',
      'Được trang bị sẵn thảm tập định tuyến cao cấp',
      'Sử dụng tủ đồ Smart Locker & phòng tắm nóng lạnh',
      'Hỗ trợ gia hạn linh hoạt theo từng kỳ 30 ngày'
    ]
  },
  'G02': {
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Phát triển cơ bắp, tăng cường thể lực và săn chắc toàn thân',
    badge: 'Phổ Biến Nhất',
    tagColor: 'bg-blue-600 text-white',
    features: [
      'Toàn quyền sử dụng 100% máy gym, giàn tạ & khu Cardio',
      'Hơn 50 đầu máy tạ nhập khẩu chuẩn Olympic quốc tế',
      'Không giới hạn khung giờ tập (06:00 - 22:00 hàng ngày)',
      'Miễn phí nước uống tinh khiết nóng lạnh & gửi xe',
      'Sử dụng phòng tắm nóng lạnh, máy sấy tóc cao cấp'
    ]
  },
  'G03': {
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Đốt mỡ siêu tốc, rèn luyện phản xạ và kỹ năng tự vệ',
    badge: 'Cường Độ Cao',
    tagColor: 'bg-rose-600 text-white',
    features: [
      'Luyện tập tại khu vực bao cát nặng & võ đài chuẩn thi đấu',
      'Huấn luyện viên Boxing hướng dẫn kỹ thuật đấm & né đòn',
      'Tập luyện phát triển sức mạnh bộc phát và sức bền tim mạch',
      'Được trang bị sẵn găng tập và băng quấn bảo hộ an toàn',
      'Toàn quyền sử dụng phòng xông hơi và tủ đồ bảo mật'
    ]
  },
  'G04': {
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    subtitle: 'Gói thẻ không giới hạn toàn bộ dịch vụ Gym, Yoga & Boxing trong 90 ngày',
    badge: 'Gói Cao Cấp VIP',
    tagColor: 'bg-orange-500 text-white',
    features: [
      'Thẻ VIP 90 ngày: Toàn quyền truy cập mọi khu vực phòng tập',
      'Tham gia không giới hạn tất cả các lớp Studio (Yoga, Boxing, HIIT)',
      'Ưu tiên đặt chỗ trước tại các lớp học sĩ số giới hạn',
      'Hỗ trợ tư vấn trực tiếp 1-1 về bài tập cùng Huấn luyện viên',
      'Đặc quyền tủ đồ VIP riêng biệt và khăn tập miễn phí mỗi buổi'
    ]
  }
};

// Facility Zones Photos
const GYM_ZONES = [
  {
    title: 'Khu Vực Free Weights & Máy Khối Chuẩn Olympic',
    desc: 'Hệ thống hơn 50 máy tạ đa năng, giàn Squat Rack, máy Smith, máy ép ngực và dàn tạ tay cao su từ 2.5kg đến 50kg đáp ứng mọi bài tập tăng cơ săn chắc.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tag: 'Tăng Cơ & Sức Mạnh'
  },
  {
    title: 'Khu Vực Cardio & Chạy Bộ Hiện Đại',
    desc: 'Dàn máy chạy bộ Matrix màn hình cảm ứng, xe đạp trượt tuyết và máy chèo thuyền view thoáng đãng, tự động đo nhịp tim và calo đốt cháy.',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
    tag: 'Đốt Mỡ & Tim Mạch'
  },
  {
    title: 'Studio Yoga & Nhảy Nhóm Sàn Gỗ Cao Cấp',
    desc: 'Không gian yên tĩnh, sàn gỗ tự nhiên chống trơn trượt, trang bị đầy đủ thảm tập định tuyến, bóng tập và hệ thống âm thanh ánh sáng thư giãn.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    tag: 'Dẻo Dai & Thư Giãn'
  },
  {
    title: 'Võ Đài Boxing & Đối Kháng Chuyên Nghiệp',
    desc: 'Võ đài sàn tiêu chuẩn thi đấu, giàn bao cát nặng đàn hồi giảm chấn thương, trang bị sẵn găng tập và bảo hộ đạt chuẩn cho các buổi tập đối kháng.',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    tag: 'Phản Xạ & Tự Vệ'
  }
];

export default function GuestPortal({ onSwitchToConsultation, onOpenLoginModal }) {
  // Default to 'tong-quan' so guests immediately see the Gym introduction + Packages with images!
  const [activeGuestTab, setActiveGuestTab] = useState('tong-quan');
  const [packages, setPackages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consultPrefill, setConsultPrefill] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pkgRes, clsRes] = await Promise.all([
          api.getPackages(),
          api.getClasses()
        ]);
        if (pkgRes.success) setPackages(pkgRes.data);
        if (clsRes.success) setClasses(clsRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu cổng khách hàng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectPackageForConsult = (pkg) => {
    setConsultPrefill(pkg.tenGoiTap);
    setActiveGuestTab('tu-van');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* 1. HERO BANNER: Welcoming Presentation */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/25 via-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-xs font-semibold border border-white/20">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Trung Tâm Thể Hình & Fitness Tiêu Chuẩn Quốc Tế</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Khám Phá Không Gian Tập Luyện & Các Gói Hội Viên GymSpace
          </h2>

          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            GymSpace mang đến không gian thể hình hiện đại hơn 1.000m², trang thiết bị nhập khẩu nguyên chiếc cùng các lớp Yoga, Boxing và Gym chuyên nghiệp. Minh bạch bảng giá dịch vụ và tư vấn lộ trình phù hợp cho từng hội viên.
          </p>

          {/* Navigation Tab Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
            <button
              onClick={() => setActiveGuestTab('tong-quan')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeGuestTab === 'tong-quan'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600 scale-102'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Tổng Quan Phòng Gym & Gói Tập</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('goi-tap')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeGuestTab === 'goi-tap'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600 scale-102'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Bảng Giá & Gói Tập ({packages.length})</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('co-so-vat-chat')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeGuestTab === 'co-so-vat-chat'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600 scale-102'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Không Gian Phòng Gym</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('tu-van')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeGuestTab === 'tu-van'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600 scale-102'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Lịch Tư Vấn 30m</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('lich-hoc')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeGuestTab === 'lich-hoc'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600 scale-102'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Lịch Studio ({classes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB A: TỔNG QUAN (GIỚI THIỆU PHÒNG GYM + CÁC GÓI TẬP CÓ HÌNH ẢNH) */}
      {/* ============================================================== */}
      {activeGuestTab === 'tong-quan' && (
        <div className="space-y-12">
          {/* Section 1: Giới thiệu 4 Khu Vực Phòng Gym */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                  <Building className="w-4 h-4" />
                  <span>Cơ Sở Vật Chất Chuẩn 5 Sao</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Không Gian Luyện Tập Hiện Đại & Đa Năng
                </h3>
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Phân khu tập luyện khoa học, trang bị 100% giàn tạ, máy khối và phòng studio chuyên biệt
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {GYM_ZONES.map((zone, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img 
                      src={zone.image} 
                      alt={zone.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full shadow-xs">
                        {zone.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition">
                      {zone.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                      {zone.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4 Amenity Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs text-slate-900 block truncate">06:00 - 22:00</strong>
                  <span className="text-[10px] text-slate-400">Mở cửa 7 ngày/tuần</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs text-slate-900 block truncate">Smart Locker</strong>
                  <span className="text-[10px] text-slate-400">Khóa từ an toàn tuyệt đối</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <ShowerHead className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs text-slate-900 block truncate">Phòng Tắm Nước Nóng</strong>
                  <span className="text-[10px] text-slate-400">Khu thay đồ sạch sẽ</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <strong className="text-xs text-slate-900 block truncate">Nước Uống Miễn Phí</strong>
                  <span className="text-[10px] text-slate-400">Nóng lạnh tinh khiết</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Bảng Giá & Chi Tiết Các Gói Tập (Ảnh to, giá rõ ràng, quyền lợi chi tiết) */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                  <Dumbbell className="w-4 h-4" />
                  <span>Bảng Giá Niêm Yết Minh Bạch</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Các Gói Tập Gym Tiêu Biểu Dành Cho Hội Viên
                </h3>
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Lựa chọn gói tập phù hợp với mục tiêu tăng cơ, giảm mỡ, yoga dẻo dai hay boxing đối kháng
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {packages.map((pkg) => {
                const meta = PACKAGE_IMAGES[pkg.maGoiTap] || {
                  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                  subtitle: 'Gói tập thể hình chuyên nghiệp',
                  badge: 'Gói Tiêu Chuẩn',
                  tagColor: 'bg-blue-600 text-white',
                  features: ['Đầy đủ quyền lợi phòng tập GymSpace']
                };

                const isVip = pkg.maGoiTap === 'G04';

                return (
                  <div
                    key={pkg.maGoiTap}
                    className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg ${
                      isVip 
                        ? 'border-orange-400 ring-2 ring-orange-200' 
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div>
                      {/* Photo Header */}
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img 
                          src={meta.image} 
                          alt={pkg.tenGoiTap} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="font-mono text-[10px] font-black tracking-wider bg-white/95 backdrop-blur-md text-slate-800 px-2 py-0.5 rounded shadow-xs">
                            {pkg.maGoiTap}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${meta.tagColor}`}>
                            {meta.badge}
                          </span>
                        </div>

                        {/* Package Title on Image */}
                        <div className="absolute bottom-2.5 left-3 right-3 text-white">
                          <h4 className="text-base font-black leading-tight drop-shadow-sm">
                            {pkg.tenGoiTap}
                          </h4>
                          <p className="text-[11px] text-blue-100 line-clamp-1 mt-0.5">
                            {meta.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Pricing Box */}
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                          <div className="flex items-baseline justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <span>Đơn giá niêm yết</span>
                            <span>Thời hạn: {pkg.soNgayMacDinh} ngày</span>
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-black text-blue-700">
                              {Number(pkg.donGia).toLocaleString('vi-VN')}
                            </span>
                            <span className="text-xs font-bold text-slate-600">VNĐ</span>
                          </div>
                        </div>

                        {/* Detailed Bullet Points */}
                        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-2 font-semibold text-slate-800 pb-1 border-b border-slate-100">
                            <BadgeCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>Hình thức: <strong className="text-blue-700">{pkg.hinhThucTap}</strong></span>
                          </div>
                          {meta.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-[11px] text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleSelectPackageForConsult(pkg)}
                        className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Đặt Lịch Tư Vấn Gói Này</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Consultation Booking Form Section right below */}
          <section className="bg-slate-100/70 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Đăng Ký Tư Vấn Trực Tuyến 30 Phút</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Trao Đổi Trực Tiếp Cùng Huấn Luyện Viên Về Các Gói Tập
                </h3>
              </div>
              <span className="badge-active self-start sm:self-auto">Miễn Phí 100%</span>
            </div>

            <DatLichTuVan isStaffView={false} initialContent={consultPrefill} />
          </section>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB B: DANH MỤC GÓI TẬP RIÊNG */}
      {/* ============================================================== */}
      {activeGuestTab === 'goi-tap' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bảng Giá Dịch Vụ & Các Gói Tập Gym</h3>
              <p className="text-xs text-slate-500">Minh bạch giá niêm yết, thời hạn sử dụng và quyền lợi chi tiết cho từng gói tập</p>
            </div>
            <button
              onClick={() => setActiveGuestTab('tu-van')}
              className="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <span>Đặt Lịch Tư Vấn Gói Tập</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg) => {
              const meta = PACKAGE_IMAGES[pkg.maGoiTap] || {
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
                subtitle: 'Gói tập thể hình chuyên nghiệp',
                badge: 'Gói Tiêu Chuẩn',
                tagColor: 'bg-blue-600 text-white',
                features: ['Đầy đủ quyền lợi phòng tập GymSpace']
              };

              const isVip = pkg.maGoiTap === 'G04';

              return (
                <div
                  key={pkg.maGoiTap}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg ${
                    isVip 
                      ? 'border-orange-400 ring-2 ring-orange-200' 
                      : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div>
                    {/* Visual Photo Header */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img 
                        src={meta.image} 
                        alt={pkg.tenGoiTap} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="font-mono text-[10px] font-black tracking-wider bg-white/95 backdrop-blur-md text-slate-800 px-2 py-0.5 rounded shadow-xs">
                          {pkg.maGoiTap}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${meta.tagColor}`}>
                          {meta.badge}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <h4 className="text-base font-black leading-tight drop-shadow-sm">
                          {pkg.tenGoiTap}
                        </h4>
                        <p className="text-[11px] text-blue-100 line-clamp-1 mt-0.5">
                          {meta.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                        <div className="flex items-baseline justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <span>Đơn giá niêm yết</span>
                          <span>Thời hạn: {pkg.soNgayMacDinh} ngày</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="font-mono text-2xl font-black text-blue-700">
                            {Number(pkg.donGia).toLocaleString('vi-VN')}
                          </span>
                          <span className="text-xs font-bold text-slate-600">VNĐ</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-800 pb-1 border-b border-slate-100">
                          <BadgeCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>Hình thức: <strong className="text-blue-700">{pkg.hinhThucTap}</strong></span>
                        </div>
                        {meta.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-[11px] text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleSelectPackageForConsult(pkg)}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Đặt Lịch Tư Vấn Gói Này</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB C: KHÔNG GIAN PHÒNG GYM RIÊNG */}
      {/* ============================================================== */}
      {activeGuestTab === 'co-so-vat-chat' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Không Gian & Cơ Sở Vật Chất GymSpace</h3>
              <p className="text-xs text-slate-500">Môi trường tập luyện tiêu chuẩn quốc tế, trang thiết bị tối tân và tiện ích đẳng cấp</p>
            </div>
            <button
              onClick={() => setActiveGuestTab('tu-van')}
              className="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <span>Hẹn Giờ Tham Quan Trực Tiếp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {GYM_ZONES.map((zone, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={zone.image} 
                    alt={zone.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-xs">
                      {zone.tag}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="text-base font-bold text-slate-900">{zone.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{zone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB D: ĐẶT LỊCH TƯ VẤN TRỰC TUYẾN RIÊNG */}
      {/* ============================================================== */}
      {activeGuestTab === 'tu-van' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-semibold">Dành cho Khách Hàng:</strong> Bạn không cần đăng nhập hay sở hữu thẻ hội viên để đặt lịch hẹn. Hệ thống sẽ tự động đối soát khung giờ trống và chuyên viên tư vấn sẽ liên hệ theo số điện thoại đã đăng ký để giới thiệu gói tập phù hợp.
            </div>
          </div>
          <DatLichTuVan isStaffView={false} initialContent={consultPrefill} />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB E: THỜI KHÓA BIỂU STUDIO */}
      {/* ============================================================== */}
      {activeGuestTab === 'lich-hoc' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Thời Khóa Biểu Lớp Học Studio</h3>
              <p className="text-xs text-slate-500">Các lớp Yoga, Cardio và Boxing diễn ra hàng ngày dưới sự hướng dẫn của huấn luyện viên</p>
            </div>
            <div className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Chỉ dành cho Hội viên có thẻ kích hoạt</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const spotsLeft = cls.soChoToiDa - cls.soChoDat;
              const isFull = spotsLeft <= 0;

              return (
                <div key={cls.maLop} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {cls.maLop}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{cls.tenLop}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isFull ? 'Đã hết chỗ' : `Còn ${spotsLeft} chỗ`}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cls.gioBatDau} - {cls.gioKetThuc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phòng tập: <strong className="text-slate-800">{cls.phongTap}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Huấn luyện viên: <strong className="text-blue-700">{cls.hlv}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Sĩ số: {cls.soChoDat}/{cls.soChoToiDa}</span>
                    <button
                      onClick={() => {
                        setConsultPrefill(`Lớp ${cls.tenLop} (${cls.phongTap})`);
                        setActiveGuestTab('tu-van');
                      }}
                      className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                    >
                      <span>Tư vấn đăng ký</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
