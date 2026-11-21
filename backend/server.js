const express = require('express');
const cors = require('cors');
const path = require('path');

// Khởi tạo Database SQLite
const db = require('./database/db');

// Import các lớp nghiệp vụ theo thiết kế Biểu đồ lớp (ERD & Class Diagrams)
const ClsKhachHang = require('./models/ClsKhachHang');
const ClsLichHenTuVan = require('./models/ClsLichHenTuVan');
const ClsHoiVien = require('./models/ClsHoiVien');
const TheHoiVien = require('./models/TheHoiVien');
const ClsGoiTapTrenThe = require('./models/ClsGoiTapTrenThe');
const ClsGoiTap = require('./models/ClsGoiTap');
const ClsNhanVien = require('./models/ClsNhanVien');
const ClsHoaDon = require('./models/ClsHoaDon');
const ClsChiTietHoaDon = require('./models/ClsChiTietHoaDon');
const ClsLopHoc = require('./models/ClsLopHoc');
const ClsDatCho = require('./models/ClsDatCho');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Phục vụ frontend build nếu có
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.static(path.join(__dirname, '../frontend')));

// ====================================================================
// 0. AUTHENTICATION & LOGIN (PHÂN QUYỀN ĐĂNG NHẬP)
// ====================================================================

app.post('/api/auth/login', (req, res) => {
    try {
        const { tenDangNhap, matKhau } = req.body;
        if (!tenDangNhap || !matKhau) {
            return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
        }

        const username = String(tenDangNhap).trim();
        const password = String(matKhau).trim();

        // 1. Kiểm tra tài khoản Nhân viên
        const nv = db.prepare(`
            SELECT maNhanVien, hoTen, tenDangNhap, vaiTro
            FROM NhanVien
            WHERE (tenDangNhap = ? OR maNhanVien = ?) AND matKhau = ?;
        `).get(username, username, password);

        if (nv) {
            return res.json({
                success: true,
                message: 'Đăng nhập Nhân Viên thành công!',
                user: {
                    role: 'nhan-vien',
                    id: nv.maNhanVien,
                    maNhanVien: nv.maNhanVien,
                    tenDangNhap: nv.tenDangNhap,
                    hoTen: nv.hoTen,
                    vaiTro: nv.vaiTro,
                    soDienThoai: nv.soDienThoai,
                    email: nv.email
                }
            });
        }

        // 2. Kiểm tra tài khoản Hội viên
        const hv = db.prepare(`
            SELECT maHoiVien, hoTen, tenDangNhap, soDienThoai, trangThai, maKhachHang
            FROM HoiVien
            WHERE (tenDangNhap = ? OR maHoiVien = ?) AND matKhau = ?;
        `).get(username, username, password);

        if (hv) {
            return res.json({
                success: true,
                message: 'Đăng nhập Hội Viên thành công!',
                user: {
                    role: 'hoi-vien',
                    id: hv.maHoiVien,
                    maHoiVien: hv.maHoiVien,
                    tenDangNhap: hv.tenDangNhap,
                    hoTen: hv.hoTen,
                    soDienThoai: hv.soDienThoai,
                    trangThai: hv.trangThai,
                    maKhachHang: hv.maKhachHang
                }
            });
        }

        return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====================================================================
// 1. USE CASE: ĐẶT LỊCH TƯ VẤN TRỰC TUYẾN
// ====================================================================

// Lấy danh sách khung giờ trống trong ngày (30 phút/ca)
app.get('/api/tu-van/khung-gio', (req, res) => {
    try {
        const { ngayHen } = req.query;
        if (!ngayHen) {
            return res.status(400).json({ error: 'Vui lòng cung cấp ngày hẹn (ngayHen)!' });
        }
        const slots = ClsLichHenTuVan.kiemTraKhungGioTrong(ngayHen);
        res.json({ success: true, ngayHen, slots });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xác nhận đặt lịch tư vấn (Có concurrency check & lưu khách hàng)
app.post('/api/tu-van/dat-lich', (req, res) => {
    try {
        const { hoTen, soDienThoai, email, noiDungTraoDoi, ngayHen, gioBatDau } = req.body;
        if (!hoTen || !soDienThoai || !ngayHen || !gioBatDau) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
        }
        const result = ClsLichHenTuVan.xacNhanDatLich({
            hoTen,
            soDienThoai,
            email,
            noiDungTraoDoi,
            ngayHen,
            gioBatDau
        });
        res.status(201).json({
            success: true,
            message: 'Đặt lịch tư vấn trực tuyến thành công!',
            data: result
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Lấy danh sách các cuộc hẹn tư vấn
app.get('/api/tu-van/danh-sach', (req, res) => {
    try {
        const danhSach = ClsLichHenTuVan.layTatCaLichHen();
        res.json({ success: true, data: danhSach });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Hủy lịch hẹn
app.put('/api/tu-van/huy-lich/:maLichHen', (req, res) => {
    try {
        ClsLichHenTuVan.huyLichHen(req.params.maLichHen);
        res.json({ success: true, message: 'Đã hủy lịch hẹn tư vấn thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====================================================================
// 2. USE CASE: ĐĂNG KÝ TRỰC TIẾP – BÁN GÓI TẬP
// ====================================================================

// Lấy danh mục gói tập có sẵn (GoiTap)
app.get('/api/goi-tap', (req, res) => {
    try {
        const danhSach = ClsGoiTap.layDanhSach();
        res.json({ success: true, data: danhSach });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bán gói tập: Lập hóa đơn, chi tiết hóa đơn, tạo thẻ hội viên và ghi log
app.post('/api/ban-goi/thanh-toan', (req, res) => {
    try {
        const result = ClsHoaDon.banGoiTap(req.body);
        res.status(201).json({
            success: true,
            message: 'Thanh toán và đăng ký gói tập thành công!',
            data: result
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Danh sách hóa đơn
app.get('/api/hoa-don', (req, res) => {
    try {
        const danhSach = ClsHoaDon.layDanhSach();
        res.json({ success: true, data: danhSach });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chi tiết 1 hóa đơn
app.get('/api/hoa-don/:maHoaDon', (req, res) => {
    try {
        const hd = ClsHoaDon.layChiTietHoaDon(req.params.maHoaDon);
        if (!hd) return res.status(404).json({ error: 'Không tìm thấy hóa đơn!' });
        res.json({ success: true, data: hd });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====================================================================
// 3. USE CASE: TẠO TÀI KHOẢN HỘI VIÊN MỚI
// ====================================================================

// Kiểm tra trùng tên đăng nhập
app.get('/api/hoi-vien/check-username', (req, res) => {
    try {
        const { tenDangNhap } = req.query;
        if (!tenDangNhap) return res.status(400).json({ error: 'Thiếu tên đăng nhập' });
        const exists = ClsHoiVien.kiemTraTenDangNhap(tenDangNhap);
        res.json({ success: true, exists, available: !exists });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tạo tài khoản hội viên mới
app.post('/api/hoi-vien/tao-tai-khoan', (req, res) => {
    try {
        const hoiVien = ClsHoiVien.luuHoiVienMoi(req.body);

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản hội viên mới thành công!',
            data: hoiVien
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====================================================================
// 4. USE CASE: SỬA THÔNG TIN HỘI VIÊN & KHÁCH HÀNG
// ====================================================================

// Tìm kiếm hội viên theo từ khóa (Mã hoặc SĐT)
app.get('/api/hoi-vien/tim-kiem', (req, res) => {
    try {
        const { tuKhoa } = req.query;
        const list = ClsHoiVien.timKiemTheoTuKhoa(tuKhoa || '');
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy thông tin chi tiết hội viên
app.get('/api/hoi-vien/:maHoiVien', (req, res) => {
    try {
        const hv = ClsHoiVien.layThongTin(req.params.maHoiVien);
        if (!hv) return res.status(404).json({ error: 'Không tìm thấy hội viên!' });
        res.json({ success: true, data: hv });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách thẻ tập của hội viên (Cổng Hội Viên)
app.get('/api/hoi-vien/:maHoiVien/the-tap', (req, res) => {
    try {
        const list = TheHoiVien.layDanhSachGoi(req.params.maHoiVien);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách lớp học hội viên đã đặt chỗ (Cổng Hội Viên)
app.get('/api/hoi-vien/:maHoiVien/dat-cho', (req, res) => {
    try {
        const list = ClsDatCho.layDanhSachDatChoCuaHoiVien(req.params.maHoiVien);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy lịch sử hóa đơn của hội viên (Cổng Hội Viên)
app.get('/api/hoi-vien/:maHoiVien/hoa-don', (req, res) => {
    try {
        const list = ClsHoaDon.layHoaDonCuaHoiVien(req.params.maHoiVien);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sửa thông tin hội viên (cập nhật hoTen, soDienThoai và ghi Activity Log)
app.put('/api/hoi-vien/:maHoiVien', (req, res) => {
    try {
        const { maHoiVien } = req.params;
        const { hoTen, soDienThoai, maNhanVien } = req.body;

        const oldHv = ClsHoiVien.layThongTin(maHoiVien);
        if (!oldHv) return res.status(404).json({ error: 'Không tìm thấy hội viên!' });

        const updated = ClsHoiVien.capNhatThongTin(maHoiVien, hoTen, soDienThoai);

        res.json({
            success: true,
            message: 'Cập nhật thông tin hội viên thành công!',
            data: updated
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Tìm kiếm khách hàng
app.get('/api/khach-hang/tim-kiem', (req, res) => {
    try {
        const { tuKhoa } = req.query;
        const list = ClsKhachHang.timKiem(tuKhoa || '');
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sửa thông tin khách hàng chi tiết (hoTen, ngaySinh, gioiTinh, soDienThoai, email)
app.put('/api/khach-hang/:maKhachHang', (req, res) => {
    try {
        const { maKhachHang } = req.params;
        const kh = ClsKhachHang.layThongTin(maKhachHang);
        if (!kh) return res.status(404).json({ error: 'Không tìm thấy khách hàng!' });

        // Kiểm tra trùng lặp
        if (req.body.soDienThoai || req.body.email) {
            const trung = ClsKhachHang.kiemTraTrungLapKhac(maKhachHang, req.body.soDienThoai || kh.soDienThoai, req.body.email || kh.email);
            if (trung) {
                if (trung.trungSDT) return res.status(400).json({ error: 'Số điện thoại đã được sử dụng bởi khách hàng khác!' });
                if (trung.trungEmail) return res.status(400).json({ error: 'Email đã được sử dụng bởi khách hàng khác!' });
            }
        }

        const giaTriCu = `Họ tên: ${kh.hoTen}; SĐT: ${kh.soDienThoai}; Email: ${kh.email}; NS: ${kh.ngaySinh}; GT: ${kh.gioiTinh}`;
        kh.capNhatThongTin(req.body);
        const khMoi = ClsKhachHang.layThongTin(maKhachHang);

        res.json({
            success: true,
            message: 'Cập nhật thông tin khách hàng thành công!',
            data: khMoi
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====================================================================
// 5. USE CASE: GIA HẠN GÓI TẬP
// ====================================================================

// Lấy danh sách thẻ và gói tập của hội viên để chuẩn bị gia hạn
app.get('/api/gia-han/the-goi/:maHoiVien', (req, res) => {
    try {
        const { maHoiVien } = req.params;
        const list = TheHoiVien.layDanhSachGoi(maHoiVien);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thực hiện gia hạn gói tập
app.post('/api/gia-han/thuc-hien', (req, res) => {
    try {
        const { maThe, soKyGiaHan, maNhanVien, phuongThucThanhToan } = req.body;
        if (!maThe || !soKyGiaHan) {
            return res.status(400).json({ error: 'Vui lòng cung cấp mã thẻ và số kỳ gia hạn!' });
        }
        const result = ClsGoiTapTrenThe.giaHan(
            maThe,
            parseInt(soKyGiaHan, 10),
            maNhanVien || 'NV005',
            phuongThucThanhToan || 'Tiền mặt'
        );
        res.json({
            success: true,
            message: 'Gia hạn gói tập thành công!',
            data: result
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====================================================================
// 6. USE CASE: KẾT THÚC GÓI TẬP
// ====================================================================

app.post('/api/ket-thuc-goi/thuc-hien', (req, res) => {
    try {
        const { maThe, maHoiVien, maNhanVien } = req.body;
        if (!maThe || !maHoiVien) {
            return res.status(400).json({ error: 'Vui lòng cung cấp mã thẻ và mã hội viên!' });
        }
        const result = ClsGoiTapTrenThe.ketThucGoi(maThe, maHoiVien, maNhanVien || 'NV005');
        res.json({
            success: true,
            message: 'Kết thúc gói tập thành công!',
            data: result
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====================================================================
// 7. USE CASE: SỬA THÔNG TIN GÓI TẬP TRÊN THẺ
// ====================================================================

app.put('/api/sua-goi-tap', (req, res) => {
    try {
        const { maThe, hinhThucTapMoi, maNhanVien } = req.body;
        if (!maThe || !hinhThucTapMoi) {
            return res.status(400).json({ error: 'Vui lòng cung cấp mã thẻ và hình thức tập mới!' });
        }
        const result = ClsGoiTapTrenThe.capNhatHinhThucTap(maThe, hinhThucTapMoi, maNhanVien || 'NV005');
        res.json({
            success: true,
            message: 'Cập nhật thông tin gói tập thành công!',
            data: result
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====================================================================
// 8. LỚP HỌC & ĐẶT CHỖ (LopHoc & DatCho)
// ====================================================================

app.get('/api/lop-hoc', (req, res) => {
    try {
        const list = ClsLopHoc.layDanhSach();
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/lop-hoc/:maLop', (req, res) => {
    try {
        ClsLopHoc.capNhatLichHoc(req.params.maLop, req.body);
        res.json({ success: true, message: 'Cập nhật thông tin lớp học thành công!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/dat-cho', (req, res) => {
    try {
        const { maLop, maHoiVien } = req.body;
        const result = ClsDatCho.datChoLopHoc(maLop, maHoiVien);
        res.json({ success: true, message: 'Đặt chỗ lớp học thành công!', data: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/dat-cho/lop/:maLop', (req, res) => {
    try {
        const list = ClsDatCho.layHoiVienDaDat(req.params.maLop);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/dat-cho/huy/:maDatCho', (req, res) => {
    try {
        ClsDatCho.huyDatCho(req.params.maDatCho);
        res.json({ success: true, message: 'Hủy đặt chỗ thành công!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ====================================================================
// 10. NHÂN VIÊN & THỐNG KÊ DASHBOARD
// ====================================================================

app.get('/api/nhan-vien', (req, res) => {
    try {
        const list = ClsNhanVien.layDanhSach();
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dashboard/stats', (req, res) => {
    try {
        const countHoiVien = db.prepare("SELECT COUNT(*) AS c FROM HoiVien WHERE trangThai = 'Hoạt động';").get().c;
        const countLichHen = db.prepare("SELECT COUNT(*) AS c FROM LichHenTuVan WHERE trangThai = 'Đã xác nhận';").get().c;
        const countGoiTap = db.prepare("SELECT COUNT(*) AS c FROM GoiTap;").get().c;
        const countLopHoc = db.prepare("SELECT COUNT(*) AS c FROM LopHoc;").get().c;
        const doanhThu = db.prepare("SELECT COALESCE(SUM(tongTien), 0) AS total FROM HoaDon WHERE trangThai = 1;").get().total;

        res.json({
            success: true,
            data: {
                hoiVienHoatDong: countHoiVien,
                lichHenSapToi: countLichHen,
                soGoiTap: countGoiTap,
                soLopHoc: countLopHoc,
                tongDoanhThu: doanhThu
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chạy truy vấn SQL trực tiếp để kiểm thử toàn diện
app.post('/api/db/query', (req, res) => {
    try {
        const { sql } = req.body;
        if (!sql) return res.status(400).json({ error: 'Thiếu câu lệnh SQL' });
        const trimmed = sql.trim();
        if (trimmed.toUpperCase().startsWith('SELECT')) {
            const rows = db.prepare(trimmed).all();
            return res.json({ success: true, rows, count: rows.length });
        } else {
            const info = db.prepare(trimmed).run();
            return res.json({ success: true, info });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚡ GYMSPACE API SERVER RUNNING ON: http://localhost:${PORT}`);
    console.log(`⚡ Node.js + SQLite Engine Loaded Successfully`);
    console.log(`⚡ All 11 ERD Tables & Business Models Active`);
    console.log(`=======================================================`);
});
