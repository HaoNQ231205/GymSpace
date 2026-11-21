# HỆ THỐNG QUẢN LÝ PHÒNG TẬP GYMSPACE (GYMPRO ATHLETICS)
> **Đề tài Bài tập lớn:** Phân tích thiết kế hệ thống quản lý phòng tập GymSpace sử dụng NodeJS, ReactJS và SQL  
> **Môn học:** Phân tích thiết kế hệ thống thông tin (PTTKHTTT)  
> **Giảng viên hướng dẫn:** ThS. Nguyễn Đình Hiến  
> **Nhóm lớp học phần:** 13 — **Nhóm sinh viên thực hiện:** 09  

---

## 👥 THÀNH VIÊN VÀ PHÂN CÔNG CHỨC NĂNG (THEO 2 FILE DOCX)

| Họ và tên | Mã sinh viên | Chức năng nghiệp vụ phân công |
| :--- | :--- | :--- |
| **Phan Quang Doanh** | B23DCKH024 | **Use Case 1:** Đặt lịch tư vấn trực tuyến (Book a Call) |
| **Nguyễn Quang Hảo** | B23DCKH036 | **Use Case 2:** Đăng ký trực tiếp – Bán gói tập (POS quầy lễ tân)<br>**Use Case 3:** Tạo tài khoản hội viên mới |
| **Vũ Thanh Cương** | B23DCKH014 | **Use Case 4:** Sửa thông tin hội viên & Sửa thông tin khách hàng<br>**Use Case 6:** Kết thúc gói tập trước hạn |
| **Lê Doãn Nhật** | B23DCKH084 | **Use Case 5:** Gia hạn gói tập trên thẻ hội viên<br>**Use Case 7:** Chỉnh sửa thông tin gói tập (Hình thức tập) |

---

## 🎨 THIẾT KẾ GIAO DIỆN FRONTEND (REACTJS)
- **Tôn chỉ thiết kế:** Thể thao, năng động, bùng nổ năng lượng thi đấu (Athletic & High Energy).
- **Quy tắc tuyệt đối:** **KHÔNG DÙNG MÀU ĐEN LÀM MÀU CHỦ ĐẠO**.
- **Bảng màu thể thao chuẩn:**
  - **Electric Sport Blue (`#1d4ed8`, `#2563eb`, `#3b82f6`):** Tượng trưng cho sự chuyên nghiệp, bền bỉ và hiện đại.
  - **Flame Neon Orange / Amber (`#ea580c`, `#f97316`, `#f59e0b`):** Tượng trưng cho nhiệt huyết, sức mạnh và calo được đốt cháy.
  - **Stadium Emerald (`#10b981`):** Trạng thái hoạt động, thẻ hợp lệ và năng lượng phục hồi.
  - **Crisp Ice Slate & White (`#ffffff`, `#f8fafc`, `#f1f5f9`):** Nền sáng, thoáng đãng, mang lại trải nghiệm phòng gym sạch sẽ, cao cấp.

---

## 🗄️ LƯỢC ĐỒ CƠ SỞ DỮ LIỆU SQL (11 BẢNG CHUẨN ERD)

Toàn bộ lược đồ được trích xuất nguyên vẹn từ ERD trong 2 file Word:
1. `NhanVien (maNhanVien, hoTen, tenDangNhap, matKhau, soDienThoai, email, vaiTro)`
2. `KhachHang (maKhachHang, hoTen, soDienThoai, email, noiDungTraoDoi, ngaySinh, gioiTinh)`
3. `HoiVien (maHoiVien, tenDangNhap, matKhau, hoTen, soDienThoai, trangThai, maKhachHang)`
4. `GoiTap (maGoiTap, tenGoiTap, donGia, soNgayMacDinh, thoiHan, hinhThucTap)`
5. `TheHoiVien (maThe, maHoiVien, maGoiTap, ngayKichHoat, ngayHetHan, trangThai)`
6. `HoaDon (maHoaDon, maHoiVien, ngayThanhToan, tongTien, phuongThucThanhToan, trangThai, maNhanVien)`
7. `ChiTietHoaDon (maHoaDon, maGoiTap, soLuong, thanhTien)`
8. `LichHenTuVan (maLichHen, ngayHen, gioBatDau, thoiLuong, trangThai, maKhachHang)`
9. `LopHoc (maLop, tenLop, ngayHoc, gioBatDau, gioKetThuc, hlv, phongTap, soChoToiDa, soChoDat, maNhanVien)`
10. `DatCho (maDatCho, maLop, maHoiVien, trangThaiDat)`
11. `LichSuLog (maLog, maNhanVien, maHoiVien, thoiGian, hanhDong, truongThayDoi, giaTriCu, giaTriMoi)`

---

## 🏗️ CÁC LỚP THỰC THỂ BACKEND (OOP MODELS THEO BIỂU ĐỒ LỚP)

Toàn bộ các lớp và phương thức được lập trình đầy đủ trong thư mục `backend/models/`:
- `ClsKhachHang`: `kiemTraTonTai()`, `layThongTin()`, `capNhatThongTin()`, `taoKhachHangMoi()`, `timKiem()`
- `ClsLichHenTuVan`: `kiemTraKhungGioTrong()`, `kiemTraXungDot()`, `xacNhanDatLich()`, `huyLichHen()`
- `ClsKhungGioTuVan`: `kiemTraConTrong()`, `giuChoNeuConTrong()`, `giaiPhong()`
- `ClsHoiVien`: `dangNhap()`, `kiemTraTenDangNhap()`, `phatSinhMaHoiVien()`, `luuHoiVienMoi()`, `timKiemTheoTuKhoa()`, `capNhatThongTin()`
- `TheHoiVien`: `phatHanhThe()`, `kiemTraDieuKienGiaHan()`, `tinhNgayHetHanMoi()`, `layDanhSachGoi()`
- `ClsGoiTapTrenThe`: `kiemTraHieuLuc()`, `giaHan()`, `ketThucGoi()`, `capNhatHinhThucTap()`
- `ClsGoiTap`: `layDanhSach()`, `layThongTin()`, `kiemTraHieuLuc()`, `tinhNgayHetHan()`
- `ClsNhanVien`: `dangNhap()`, `layThongTin()`, `layDanhSach()`
- `ClsHoaDon`: `tinhTongTien()`, `banGoiTap()`, `layChiTietHoaDon()`, `layDanhSach()`
- `ClsChiTietHoaDon`: `tinhThanhTien()`, `kiemTraDuLieu()`
- `ClsLopHoc`: `kiemTraTrungLichPhong()`, `kiemTraTrungLichHLV()`, `capNhatLichHoc()`, `conChoTrong()`
- `ClsDatCho`: `kiemTraQuyenDatCho()`, `datChoLopHoc()`, `huyDatCho()`, `layHoiVienDaDat()`
- `ClsLichSuLog`: `ghiNhanLog()`, `layLichSu()`

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Cách 1: Chạy Server Tích Hợp (Tất cả trong 1 cổng 5000)
Backend đã tự động tích hợp bản build sản xuất của ReactJS và cơ sở dữ liệu SQLite:
```powershell
cd H:\PTTKHTTT\backend
node server.js
```
Mở trình duyệt truy cập: **`http://localhost:5000`**

### Cách 2: Chạy Môi Trường Phát Triển (Dev Mode)
**Terminal 1 - Backend API:**
```powershell
cd H:\PTTKHTTT\backend
node server.js
```

**Terminal 2 - Frontend Vite React:**
```powershell
cd H:\PTTKHTTT\frontend
npm run dev
```
Mở trình duyệt truy cập: **`http://localhost:3000`**
