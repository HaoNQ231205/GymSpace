-- ====================================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG TẬP GYMSPACE (GymPro / GymSpace)
-- Lược đồ CSDL quan hệ chính xác theo ERD (N13 Nhóm 09 & N13 Nhóm (1))
-- ====================================================================

-- 1. Bảng NhanVien (Nhân viên phòng tập)
CREATE TABLE IF NOT EXISTS NhanVien (
    maNhanVien VARCHAR(10) PRIMARY KEY,
    hoTen NVARCHAR(100) NOT NULL,
    tenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    matKhau VARCHAR(255) NOT NULL,
    soDienThoai VARCHAR(15),
    email VARCHAR(100),
    vaiTro NVARCHAR(20) NOT NULL
);

-- 2. Bảng KhachHang (Khách hàng tiềm năng & thông tin cá nhân)
CREATE TABLE IF NOT EXISTS KhachHang (
    maKhachHang VARCHAR(10) PRIMARY KEY,
    hoTen NVARCHAR(100) NOT NULL,
    soDienThoai CHAR(10) UNIQUE NOT NULL,
    email VARCHAR(100),
    noiDungTraoDoi NVARCHAR(255),
    ngaySinh DATE,
    gioiTinh NVARCHAR(10)
);

-- 3. Bảng HoiVien (Tài khoản hội viên chính thức)
CREATE TABLE IF NOT EXISTS HoiVien (
    maHoiVien VARCHAR(20) PRIMARY KEY,
    tenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    matKhau VARCHAR(255) NOT NULL,
    hoTen NVARCHAR(100) NOT NULL,
    soDienThoai VARCHAR(15) NOT NULL,
    trangThai NVARCHAR(50) NOT NULL DEFAULT 'Hoạt động',
    maKhachHang VARCHAR(10),
    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang) ON DELETE SET NULL
);

-- 4. Bảng GoiTap (Danh mục các gói tập kinh doanh)
CREATE TABLE IF NOT EXISTS GoiTap (
    maGoiTap VARCHAR(20) PRIMARY KEY,
    tenGoiTap NVARCHAR(100) NOT NULL,
    donGia BIGINT NOT NULL,
    soNgayMacDinh INT NOT NULL,
    thoiHan INT NOT NULL,
    hinhThucTap NVARCHAR(50) NOT NULL
);

-- 5. Bảng TheHoiVien (Thẻ hội viên tích hợp các gói tập)
CREATE TABLE IF NOT EXISTS TheHoiVien (
    maThe VARCHAR(20) PRIMARY KEY,
    maHoiVien VARCHAR(20) NOT NULL,
    maGoiTap VARCHAR(20) NOT NULL,
    ngayKichHoat DATE NOT NULL,
    ngayHetHan DATE NOT NULL,
    trangThai NVARCHAR(50) NOT NULL DEFAULT 'Hoạt động',
    FOREIGN KEY (maHoiVien) REFERENCES HoiVien(maHoiVien) ON DELETE CASCADE,
    FOREIGN KEY (maGoiTap) REFERENCES GoiTap(maGoiTap) ON DELETE RESTRICT
);

-- 6. Bảng HoaDon (Hóa đơn bán gói và gia hạn)
CREATE TABLE IF NOT EXISTS HoaDon (
    maHoaDon VARCHAR(20) PRIMARY KEY,
    maHoiVien VARCHAR(20),
    ngayThanhToan DATETIME NOT NULL,
    tongTien BIGINT NOT NULL,
    phuongThucThanhToan NVARCHAR(50) NOT NULL,
    trangThai INT NOT NULL DEFAULT 1,
    maNhanVien VARCHAR(10) NOT NULL,
    FOREIGN KEY (maHoiVien) REFERENCES HoiVien(maHoiVien) ON DELETE SET NULL,
    FOREIGN KEY (maNhanVien) REFERENCES NhanVien(maNhanVien) ON DELETE RESTRICT
);

-- 7. Bảng ChiTietHoaDon (Chi tiết gói mua trong từng hóa đơn)
CREATE TABLE IF NOT EXISTS ChiTietHoaDon (
    maHoaDon VARCHAR(20) NOT NULL,
    maGoiTap VARCHAR(20) NOT NULL,
    soLuong INT NOT NULL,
    thanhTien BIGINT NOT NULL,
    PRIMARY KEY (maHoaDon, maGoiTap),
    FOREIGN KEY (maHoaDon) REFERENCES HoaDon(maHoaDon) ON DELETE CASCADE,
    FOREIGN KEY (maGoiTap) REFERENCES GoiTap(maGoiTap) ON DELETE RESTRICT
);

-- 8. Bảng LichHenTuVan (Lịch hẹn tư vấn trực tuyến 30 phút/ca)
CREATE TABLE IF NOT EXISTS LichHenTuVan (
    maLichHen VARCHAR(20) PRIMARY KEY,
    ngayHen DATE NOT NULL,
    gioBatDau VARCHAR(10) NOT NULL,
    thoiLuong INT NOT NULL DEFAULT 30,
    trangThai NVARCHAR(50) NOT NULL DEFAULT 'Đã xác nhận',
    maKhachHang VARCHAR(10) NOT NULL,
    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang) ON DELETE CASCADE
);

-- 9. Bảng LopHoc (Lớp học theo lịch trình tại phòng tập)
CREATE TABLE IF NOT EXISTS LopHoc (
    maLop VARCHAR(20) PRIMARY KEY,
    tenLop NVARCHAR(100) NOT NULL,
    ngayHoc DATE NOT NULL,
    gioBatDau VARCHAR(10) NOT NULL,
    gioKetThuc VARCHAR(10) NOT NULL,
    hlv NVARCHAR(100) NOT NULL,
    phongTap NVARCHAR(50) NOT NULL,
    soChoToiDa INT NOT NULL,
    soChoDat INT NOT NULL DEFAULT 0,
    maNhanVien VARCHAR(10),
    FOREIGN KEY (maNhanVien) REFERENCES NhanVien(maNhanVien) ON DELETE SET NULL
);

-- 10. Bảng DatCho (Đăng ký chỗ tham gia lớp học của hội viên)
CREATE TABLE IF NOT EXISTS DatCho (
    maDatCho VARCHAR(20) PRIMARY KEY,
    maLop VARCHAR(20) NOT NULL,
    maHoiVien VARCHAR(20) NOT NULL,
    trangThaiDat NVARCHAR(50) NOT NULL DEFAULT 'Đã đặt',
    FOREIGN KEY (maLop) REFERENCES LopHoc(maLop) ON DELETE CASCADE,
    FOREIGN KEY (maHoiVien) REFERENCES HoiVien(maHoiVien) ON DELETE CASCADE
);

-- 11. Bảng LichSuLog (Nhật ký kiểm soát thay đổi hệ thống)
CREATE TABLE IF NOT EXISTS LichSuLog (
    maLog VARCHAR(20) PRIMARY KEY,
    maNhanVien VARCHAR(10) NOT NULL,
    maHoiVien VARCHAR(20),
    thoiGian DATETIME NOT NULL,
    hanhDong NVARCHAR(100) NOT NULL,
    truongThayDoi NVARCHAR(100),
    giaTriCu NVARCHAR(255),
    giaTriMoi NVARCHAR(255),
    FOREIGN KEY (maNhanVien) REFERENCES NhanVien(maNhanVien) ON DELETE RESTRICT
);
