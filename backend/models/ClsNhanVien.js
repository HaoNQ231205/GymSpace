const db = require('../database/db');

class ClsNhanVien {
    constructor(data = {}) {
        this.maNhanVien = data.maNhanVien || '';
        this.hoTen = data.hoTen || '';
        this.tenDangNhap = data.tenDangNhap || '';
        this.matKhau = data.matKhau || '';
        this.vaiTro = data.vaiTro || 'Nhân viên';
    }

    // Đăng nhập hệ thống của nhân viên
    static dangNhap(tenDangNhap, matKhau) {
        const stmt = db.prepare(`
            SELECT maNhanVien, hoTen, tenDangNhap, vaiTro
            FROM NhanVien
            WHERE tenDangNhap = ? AND matKhau = ?;
        `);
        return stmt.get(tenDangNhap, matKhau) || null;
    }

    // Lấy thông tin nhân viên theo mã
    static layThongTin(maNhanVien) {
        const stmt = db.prepare(`
            SELECT maNhanVien, hoTen, tenDangNhap, vaiTro
            FROM NhanVien
            WHERE maNhanVien = ?;
        `);
        return stmt.get(maNhanVien) || null;
    }

    // Lấy danh sách nhân viên
    static layDanhSach() {
        const stmt = db.prepare(`
            SELECT maNhanVien, hoTen, tenDangNhap, vaiTro
            FROM NhanVien
            ORDER BY maNhanVien ASC;
        `);
        return stmt.all();
    }

    // Các nghiệp vụ nhân viên được đặc tả trong Biểu đồ lớp (UML Class Diagrams)
    taoHoiVien(data) {
        const ClsHoiVien = require('./ClsHoiVien');
        return ClsHoiVien.luuHoiVienMoi({ ...data, maNhanVien: this.maNhanVien });
    }

    suaThongTinHoiVien(maHoiVien, hoTen, soDienThoai) {
        const ClsHoiVien = require('./ClsHoiVien');
        return ClsHoiVien.capNhatThongTin(maHoiVien, hoTen, soDienThoai);
    }

    suaLichHoc(maLop, data) {
        const ClsLopHoc = require('./ClsLopHoc');
        return ClsLopHoc.capNhatLichHoc(maLop, data);
    }

    suaGoiTap(maThe, hinhThucTapMoi) {
        const ClsGoiTapTrenThe = require('./ClsGoiTapTrenThe');
        return ClsGoiTapTrenThe.capNhatHinhThucTap(maThe, hinhThucTapMoi, this.maNhanVien);
    }

    giaHanGoi(maThe, soKyGiaHan, phuongThucThanhToan) {
        const ClsGoiTapTrenThe = require('./ClsGoiTapTrenThe');
        return ClsGoiTapTrenThe.giaHan(maThe, soKyGiaHan, this.maNhanVien, phuongThucThanhToan);
    }

    ketThucGoi(maThe, maHoiVien) {
        const ClsGoiTapTrenThe = require('./ClsGoiTapTrenThe');
        return ClsGoiTapTrenThe.ketThucGoi(maThe, maHoiVien, this.maNhanVien);
    }

    layKhungGioTrong(ngayHen) {
        const ClsLichHenTuVan = require('./ClsLichHenTuVan');
        return ClsLichHenTuVan.kiemTraKhungGioTrong(ngayHen);
    }
}

module.exports = ClsNhanVien;
