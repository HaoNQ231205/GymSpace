-- ====================================================================
-- DỮ LIỆU MẪU BAN ĐẦU HỆ THỐNG GYMSPACE
-- ====================================================================

-- 1. Nhân viên (Mã NV001, NV005, NV009 theo vai trò đại diện)
INSERT OR IGNORE INTO NhanVien (maNhanVien, hoTen, tenDangNhap, matKhau, soDienThoai, email, vaiTro) VALUES
('NV001', 'Quản Lý Chi Nhánh', 'admin', '123456', '0901234567', 'admin@gymspace.vn', 'Quản lý'),
('NV005', 'Nhân Viên Lễ Tân', 'nv005', '123456', '0912345005', 'letan@gymspace.vn', 'Nhân viên lễ tân'),
('NV009', 'Nhân Viên Tư Vấn', 'nvcuong', '123456', '0988776655', 'tuvan@gymspace.vn', 'Nhân viên tư vấn');

-- 2. Khách hàng (Đại diện)
INSERT OR IGNORE INTO KhachHang (maKhachHang, hoTen, soDienThoai, email, noiDungTraoDoi, ngaySinh, gioiTinh) VALUES
('KH001', 'Khách Hàng 01', '0901234567', 'khachhang01@gymspace.vn', 'Quan tâm các lớp Gym và Boxing', '1995-08-15', 'Nam'),
('KH002', 'Khách Hàng 02', '0912000111', 'khachhang02@gymspace.vn', 'Tư vấn giảm mỡ tăng cơ cá nhân', '1998-05-20', 'Nam'),
('KH003', 'Khách Hàng 03', '0922334455', 'khachhang03@gymspace.vn', 'Đăng ký tập Yoga buổi sáng', '2000-11-10', 'Nữ'),
('KH004', 'Khách Hàng 04', '0933445566', 'khachhang04@gymspace.vn', 'Tư vấn gói gia đình All-in-one', '1999-03-25', 'Nam');

-- 3. Hội viên (Đại diện)
INSERT OR IGNORE INTO HoiVien (maHoiVien, tenDangNhap, matKhau, hoTen, soDienThoai, trangThai, maKhachHang) VALUES
('HV001', 'nguyenan', '123456', 'Hội Viên 01', '0901234567', 'Hoạt động', 'KH001'),
('HV002', 'tranvanb', '123456', 'Hội Viên 02', '0912000111', 'Hoạt động', 'KH002'),
('HV003', 'phamthu', '123456', 'Hội Viên 03', '0922334455', 'Hoạt động', 'KH003');

-- 4. Danh mục gói tập (G01, G02, G03, G04 theo đúng thiết kế)
INSERT OR IGNORE INTO GoiTap (maGoiTap, tenGoiTap, donGia, soNgayMacDinh, thoiHan, hinhThucTap) VALUES
('G01', 'Gói Yoga Cơ Bản', 300000, 30, 1, 'Trực tiếp'),
('G02', 'Gói Gym Toàn Thân', 500000, 30, 1, 'Trực tiếp'),
('G03', 'Gói Boxing Chuyên Sâu', 600000, 30, 1, 'Trực tiếp'),
('G04', 'Gói VIP All-in-one', 1200000, 90, 3, 'Toàn diện');

-- 5. Thẻ hội viên (TheHoiVien)
INSERT OR IGNORE INTO TheHoiVien (maThe, maHoiVien, maGoiTap, ngayKichHoat, ngayHetHan, trangThai) VALUES
('THE-2939', 'HV001', 'G01', '2026-11-01', '2026-12-01', 'Hoạt động'),
('THE-2940', 'HV001', 'G03', '2026-11-10', '2026-12-10', 'Hoạt động'),
('THE-5512', 'HV002', 'G02', '2026-09-01', '2026-10-01', 'Hết hạn'),
('THE-7890', 'HV003', 'G04', '2026-11-15', '2027-02-13', 'Hoạt động');

-- 6. Hóa đơn
INSERT OR IGNORE INTO HoaDon (maHoaDon, maHoiVien, ngayThanhToan, tongTien, phuongThucThanhToan, trangThai, maNhanVien) VALUES
('HD2026110101', 'HV001', '2026-11-01 09:30:00', 300000, 'Chuyển khoản', 1, 'NV005'),
('HD2026111002', 'HV001', '2026-11-10 14:15:00', 600000, 'Tiền mặt', 1, 'NV005'),
('HD2026111503', 'HV003', '2026-11-15 10:00:00', 1200000, 'Chuyển khoản', 1, 'NV001');

-- 7. Chi tiết hóa đơn
INSERT OR IGNORE INTO ChiTietHoaDon (maHoaDon, maGoiTap, soLuong, thanhTien) VALUES
('HD2026110101', 'G01', 1, 300000),
('HD2026111002', 'G03', 1, 600000),
('HD2026111503', 'G04', 1, 1200000);

-- 8. Lịch hẹn tư vấn trực tuyến
INSERT OR IGNORE INTO LichHenTuVan (maLichHen, ngayHen, gioBatDau, thoiLuong, trangThai, maKhachHang) VALUES
('LH2026112501', '2026-11-25', '08:30', 30, 'Đã xác nhận', 'KH001'),
('LH2026112502', '2026-11-25', '14:00', 30, 'Đã xác nhận', 'KH002'),
('LH2026112601', '2026-11-26', '09:30', 30, 'Đã xác nhận', 'KH004');

-- 9. Lớp học
INSERT OR IGNORE INTO LopHoc (maLop, tenLop, ngayHoc, gioBatDau, gioKetThuc, hlv, phongTap, soChoToiDa, soChoDat, maNhanVien) VALUES
('LOP01', 'Yoga Chào Ngày Mới - Cơ bản', '2026-11-28', '08:00', '09:30', 'HLV Yoga 01', 'Studio Yoga 1', 15, 2, 'NV005'),
('LOP02', 'Cardio & Strength Toàn Thân', '2026-11-28', '17:30', '19:00', 'HLV Fitness 02', 'Phòng Đa Năng A', 20, 1, 'NV005'),
('LOP03', 'Boxing Sparring & Kỹ Thuật', '2026-11-29', '18:00', '19:30', 'HLV Boxing 03', 'Võ Đài Trung Tâm', 10, 1, 'NV001');

-- 10. Đặt chỗ tham gia lớp học
INSERT OR IGNORE INTO DatCho (maDatCho, maLop, maHoiVien, trangThaiDat) VALUES
('DC001', 'LOP01', 'HV001', 'Đã đặt'),
('DC002', 'LOP01', 'HV003', 'Đã đặt'),
('DC003', 'LOP02', 'HV001', 'Đã đặt'),
('DC004', 'LOP03', 'HV001', 'Đã đặt');

-- 11. Nhật ký hoạt động (Activity Log)
INSERT OR IGNORE INTO LichSuLog (maLog, maNhanVien, maHoiVien, thoiGian, hanhDong, truongThayDoi, giaTriCu, giaTriMoi) VALUES
('LOG0001', 'NV005', 'HV001', '2026-11-01 09:35:00', 'Đăng ký trực tiếp & Cấp thẻ mới', 'TheHoiVien', 'Chưa có thẻ', 'Mã thẻ THE-2939; Gói G01'),
('LOG0002', 'NV005', 'HV002', '2026-11-15 16:20:00', 'Sửa thông tin hội viên', 'hoTen, soDienThoai', 'Họ tên: Trần Văn B; SĐT: 0912000111', 'Họ tên: Trần Văn Bình; SĐT: 0987654321');
