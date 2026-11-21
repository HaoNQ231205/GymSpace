const db = require('../database/db');

class TheHoiVien {
    constructor(data = {}) {
        this.maThe = data.maThe || '';
        this.maHoiVien = data.maHoiVien || '';
        this.maGoiTap = data.maGoiTap || '';
        this.ngayKichHoat = data.ngayKichHoat || '';
        this.ngayHetHan = data.ngayHetHan || '';
        this.trangThai = data.trangThai || 'Hoạt động'; // 'Hoạt động' | 'Hết hạn' | 'Đã kết thúc' | 'Khóa'
    }

    // Kiểm tra điều kiện gia hạn: chỉ cho phép thẻ "Hoạt động" hoặc "Hết hạn", không cho phép thẻ bị khóa hoặc đã kết thúc
    kiemTraDieuKienGiaHan() {
        return this.trangThai === 'Hoạt động' || this.trangThai === 'Hết hạn';
    }

    // Tính ngày hết hạn mới:
    // Số ngày gia hạn = Số kỳ gia hạn * soNgayMacDinh
    // Ngày hết hạn mới = Ngày hết hạn cũ + Số ngày gia hạn
    tinhNgayHetHanMoi(soKyGiaHan, soNgayMacDinh) {
        const soNgayGiaHan = soKyGiaHan * soNgayMacDinh;
        const oldExpiry = new Date(this.ngayHetHan);
        const newExpiry = new Date(oldExpiry.getTime() + soNgayGiaHan * 24 * 60 * 60 * 1000);
        return newExpiry.toISOString().split('T')[0];
    }

    // Phát hành thẻ hội viên mới
    // INSERT INTO TheHoiVien (maThe, maHoiVien, maGoiTap, ngayKichHoat, ngayHetHan, trangThai) VALUES ...
    static phatHanhThe(data) {
        const maThe = data.maThe || `THE-${Date.now().toString().slice(-4)}`;
        const stmt = db.prepare(`
            INSERT INTO TheHoiVien (maThe, maHoiVien, maGoiTap, ngayKichHoat, ngayHetHan, trangThai)
            VALUES (?, ?, ?, ?, ?, ?);
        `);
        stmt.run(maThe, data.maHoiVien, data.maGoiTap, data.ngayKichHoat, data.ngayHetHan, data.trangThai || 'Hoạt động');
        return TheHoiVien.layThongTin(maThe);
    }

    // Lấy thông tin thẻ theo mã
    static layThongTin(maThe) {
        const stmt = db.prepare(`
            SELECT th.maThe, th.maHoiVien, th.maGoiTap, th.ngayKichHoat, th.ngayHetHan, th.trangThai,
                   gt.tenGoiTap, gt.donGia, gt.soNgayMacDinh, gt.hinhThucTap
            FROM TheHoiVien th
            JOIN GoiTap gt ON th.maGoiTap = gt.maGoiTap
            WHERE th.maThe = ?;
        `);
        const row = stmt.get(maThe);
        return row ? new TheHoiVien(row) : null;
    }

    // Lấy danh sách thẻ và gói của một hội viên
    // SELECT th.maThe, gt.maGoiTap, gt.tenGoiTap, gt.soNgayMacDinh, gt.donGia, th.ngayHetHan, th.trangThai FROM TheHoiVien th JOIN GoiTap gt ON th.maGoiTap = gt.maGoiTap WHERE th.maHoiVien = @maHoiVien;
    static layDanhSachGoi(maHoiVien) {
        const stmt = db.prepare(`
            SELECT th.maThe, gt.maGoiTap, gt.tenGoiTap, gt.soNgayMacDinh, gt.donGia, gt.hinhThucTap,
                   th.ngayKichHoat, th.ngayHetHan, th.trangThai
            FROM TheHoiVien th
            JOIN GoiTap gt ON th.maGoiTap = gt.maGoiTap
            WHERE th.maHoiVien = ?
            ORDER BY CASE WHEN th.trangThai = 'Hoạt động' THEN 0 ELSE 1 END, th.ngayKichHoat DESC;
        `);
        return stmt.all(maHoiVien);
    }

    // Kiểm tra trạng thái thẻ
    kiemTraTrangThai() {
        return this.trangThai === 'Hoạt động';
    }

    // Cập nhật hình thức tập theo Biểu đồ lớp (doc2_image9.png)
    capNhatHinhThucTap(hinhThucMoi, maNhanVien = 'NV005') {
        const ClsGoiTapTrenThe = require('./ClsGoiTapTrenThe');
        return ClsGoiTapTrenThe.capNhatHinhThucTap(this.maThe, hinhThucMoi, maNhanVien);
    }

    // Tích hợp gói mới vào thẻ theo Biểu đồ lớp (doc1_image51.png)
    tichHopGoi(goi) {
        const ClsGoiTap = require('./ClsGoiTap');
        const ClsGoiTapTrenThe = require('./ClsGoiTapTrenThe');
        const maTheMoi = `THE-${Date.now().toString().slice(-4)}`;
        const todayStr = new Date().toISOString().split('T')[0];
        const days = goi.soNgayMacDinh || 30;
        const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        TheHoiVien.phatHanhThe({
            maThe: maTheMoi,
            maHoiVien: this.maHoiVien,
            maGoiTap: goi.maGoiTap,
            ngayKichHoat: todayStr,
            ngayHetHan: expiryDate,
            trangThai: 'Hoạt động'
        });

        return new ClsGoiTapTrenThe({
            maThe: maTheMoi,
            maHoiVien: this.maHoiVien,
            maGoiTap: goi.maGoiTap,
            tenGoiTap: goi.tenGoiTap,
            ngayKichHoat: todayStr,
            ngayHetHan: expiryDate,
            trangThai: 'Hoạt động'
        });
    }

    // Cập nhật trạng thái thẻ
    static capNhatTrangThai(maThe, trangThaiMoi) {
        const stmt = db.prepare(`
            UPDATE TheHoiVien
            SET trangThai = ?
            WHERE maThe = ?;
        `);
        stmt.run(trangThaiMoi, maThe);
        return true;
    }
}

module.exports = TheHoiVien;
