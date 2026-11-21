const db = require('../database/db');

class ClsGoiTap {
    constructor(data = {}) {
        this.maGoiTap = data.maGoiTap || '';
        this.tenGoiTap = data.tenGoiTap || '';
        this.donGia = data.donGia || 0;
        this.soNgayMacDinh = data.soNgayMacDinh || 30;
        this.thoiHan = data.thoiHan || 1;
        this.hinhThucTap = data.hinhThucTap || 'Trực tiếp';
    }

    // Lấy danh mục gói tập có sẵn lên form FrmDangKyTrucTiep
    // SELECT maGoiTap, tenGoiTap, donGia, soNgayMacDinh, thoiHan, hinhThucTap FROM GoiTap;
    static layDanhSach() {
        const stmt = db.prepare(`
            SELECT maGoiTap, tenGoiTap, donGia, soNgayMacDinh, thoiHan, hinhThucTap
            FROM GoiTap
            ORDER BY maGoiTap ASC;
        `);
        return stmt.all().map(g => new ClsGoiTap(g));
    }

    // Lấy thông tin chi tiết một gói tập
    // SELECT maGoiTap, tenGoiTap, donGia, soNgayMacDinh FROM GoiTap WHERE maGoiTap = @maGoiTap;
    static layThongTin(maGoiTap) {
        const stmt = db.prepare(`
            SELECT maGoiTap, tenGoiTap, donGia, soNgayMacDinh, thoiHan, hinhThucTap
            FROM GoiTap
            WHERE maGoiTap = ?;
        `);
        const row = stmt.get(maGoiTap);
        return row ? new ClsGoiTap(row) : null;
    }

    // Kiểm tra tính hợp lệ của gói tập
    kiemTraHieuLuc() {
        return this.donGia > 0 && this.soNgayMacDinh > 0;
    }

    // Tính ngày hết hạn theo ngày bắt đầu và số lượng kỳ
    tinhNgayHetHan(ngayBatDau = new Date(), soLuong = 1) {
        const start = new Date(ngayBatDau);
        const totalDays = this.soNgayMacDinh * soLuong;
        const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
        return end.toISOString().split('T')[0];
    }
}

module.exports = ClsGoiTap;
