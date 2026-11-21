const db = require('../database/db');
const ClsKhachHang = require('./ClsKhachHang');

class ClsLichHenTuVan {
    constructor(data = {}) {
        this.maLichHen = data.maLichHen || '';
        this.ngayHen = data.ngayHen || '';
        this.gioBatDau = data.gioBatDau || '';
        this.thoiLuong = data.thoiLuong || 30; // 30 phút cố định
        this.trangThai = data.trangThai || 'Đã xác nhận';
        this.maKhachHang = data.maKhachHang || '';
    }

    // Lấy danh sách khung giờ đã được đặt trong ngày
    // SELECT gioBatDau, thoiLuong, trangThai FROM LichHenTuVan WHERE ngayHen = @ngayHen AND trangThai != 'Đã hủy';
    static layLichDaDatTrongNgay(ngayHen) {
        const stmt = db.prepare(`
            SELECT maLichHen, ngayHen, gioBatDau, thoiLuong, trangThai, maKhachHang
            FROM LichHenTuVan
            WHERE ngayHen = ? AND trangThai <> 'Đã hủy'
            ORDER BY gioBatDau ASC;
        `);
        return stmt.all(ngayHen);
    }

    // Kiểm tra trùng khung giờ trước khi đặt (Concurrency check)
    // SELECT COUNT(*) AS SoLuongTrung FROM LichHenTuVan WHERE ngayHen = @ngayHen AND gioBatDau = @gioBatDau AND trangThai != 'Đã hủy';
    static kiemTraXungDot(ngayHen, gioBatDau) {
        const stmt = db.prepare(`
            SELECT COUNT(*) AS soLuongTrung
            FROM LichHenTuVan
            WHERE ngayHen = ? AND gioBatDau = ? AND trangThai <> 'Đã hủy';
        `);
        const result = stmt.get(ngayHen, gioBatDau);
        return result.soLuongTrung > 0;
    }

    // Tính toán và hiển thị danh sách tất cả các khung giờ khả dụng trong ngày
    // Chia ca sáng (08:00 - 11:30) và ca chiều (14:00 - 17:30), mỗi ca 30 phút
    static kiemTraKhungGioTrong(ngayHen) {
        const allSlots = [
            // Ca sáng
            { gioBatDau: '08:00', gioKetThuc: '08:30', buoi: 'Sáng' },
            { gioBatDau: '08:30', gioKetThuc: '09:00', buoi: 'Sáng' },
            { gioBatDau: '09:00', gioKetThuc: '09:30', buoi: 'Sáng' },
            { gioBatDau: '09:30', gioKetThuc: '10:00', buoi: 'Sáng' },
            { gioBatDau: '10:00', gioKetThuc: '10:30', buoi: 'Sáng' },
            { gioBatDau: '10:30', gioKetThuc: '11:00', buoi: 'Sáng' },
            // Ca chiều
            { gioBatDau: '14:00', gioKetThuc: '14:30', buoi: 'Chiều' },
            { gioBatDau: '14:30', gioKetThuc: '15:00', buoi: 'Chiều' },
            { gioBatDau: '15:00', gioKetThuc: '15:30', buoi: 'Chiều' },
            { gioBatDau: '15:30', gioKetThuc: '16:00', buoi: 'Chiều' },
            { gioBatDau: '16:00', gioKetThuc: '16:30', buoi: 'Chiều' },
            { gioBatDau: '16:30', gioKetThuc: '17:00', buoi: 'Chiều' },
        ];

        const booked = ClsLichHenTuVan.layLichDaDatTrongNgay(ngayHen);
        const bookedTimes = new Set(booked.map(b => b.gioBatDau));

        return allSlots.map(slot => ({
            ...slot,
            ngayHen,
            thoiLuong: 30,
            trangThai: bookedTimes.has(slot.gioBatDau) ? 'Đã kín' : 'Còn trống'
        }));
    }

    // Tạo mới lịch hẹn tư vấn (Đặt lịch thành công)
    // INSERT INTO LichHenTuVan (maLichHen, maKhachHang, ngayHen, gioBatDau, thoiLuong, trangThai) VALUES ...
    static xacNhanDatLich(data) {
        // 1. Concurrency check
        if (ClsLichHenTuVan.kiemTraXungDot(data.ngayHen, data.gioBatDau)) {
            throw new Error('Khung giờ này vừa được đặt bởi người khác, vui lòng chọn khung giờ khác!');
        }

        // 2. Tra cứu khách hàng
        let khachHang = ClsKhachHang.kiemTraTonTai(data.soDienThoai, data.email);
        if (!khachHang) {
            khachHang = ClsKhachHang.taoKhachHangMoi({
                hoTen: data.hoTen,
                soDienThoai: data.soDienThoai,
                email: data.email,
                noiDungTraoDoi: data.noiDungTraoDoi
            });
        } else {
            // Cập nhật thông tin nếu có thay đổi
            const khObj = new ClsKhachHang(khachHang);
            khObj.capNhatThongTin({
                hoTen: data.hoTen || khachHang.hoTen,
                email: data.email || khachHang.email,
                noiDungTraoDoi: data.noiDungTraoDoi || khachHang.noiDungTraoDoi
            });
        }

        // 3. Tạo mã lịch hẹn
        const maLichHen = data.maLichHen || `LH${Date.now().toString().slice(-8)}`;

        const stmt = db.prepare(`
            INSERT INTO LichHenTuVan (maLichHen, ngayHen, gioBatDau, thoiLuong, trangThai, maKhachHang)
            VALUES (?, ?, ?, ?, ?, ?);
        `);
        stmt.run(maLichHen, data.ngayHen, data.gioBatDau, 30, 'Đã xác nhận', khachHang.maKhachHang);

        return ClsLichHenTuVan.layChiTietLichHen(maLichHen);
    }

    // Lấy thông tin chi tiết lịch hẹn để hiển thị & gửi email xác nhận
    // SELECT lh.maLichHen, kh.hoTen, kh.dienThoai, kh.email, kh.noiDungTraoDoi, lh.ngayHen, lh.gioBatDau, lh.thoiLuong, lh.trangThai
    // FROM LichHenTuVan lh JOIN KhachHang kh ON lh.maKhachHang = kh.maKhachHang WHERE lh.maLichHen = @maLichHen;
    static layChiTietLichHen(maLichHen) {
        const stmt = db.prepare(`
            SELECT lh.maLichHen, kh.hoTen, kh.soDienThoai, kh.email, kh.noiDungTraoDoi,
                   lh.ngayHen, lh.gioBatDau, lh.thoiLuong, lh.trangThai, lh.maKhachHang
            FROM LichHenTuVan lh
            JOIN KhachHang kh ON lh.maKhachHang = kh.maKhachHang
            WHERE lh.maLichHen = ?;
        `);
        return stmt.get(maLichHen);
    }

    // Hủy lịch hẹn tư vấn
    static huyLichHen(maLichHen) {
        const stmt = db.prepare(`
            UPDATE LichHenTuVan
            SET trangThai = 'Đã hủy'
            WHERE maLichHen = ?;
        `);
        stmt.run(maLichHen);
        return true;
    }

    // Lấy tất cả lịch hẹn tư vấn để quản lý
    static layTatCaLichHen() {
        const stmt = db.prepare(`
            SELECT lh.maLichHen, kh.hoTen, kh.soDienThoai, kh.email, kh.noiDungTraoDoi,
                   lh.ngayHen, lh.gioBatDau, lh.thoiLuong, lh.trangThai
            FROM LichHenTuVan lh
            JOIN KhachHang kh ON lh.maKhachHang = kh.maKhachHang
            ORDER BY lh.ngayHen DESC, lh.gioBatDau DESC;
        `);
        return stmt.all();
    }
}

module.exports = ClsLichHenTuVan;
