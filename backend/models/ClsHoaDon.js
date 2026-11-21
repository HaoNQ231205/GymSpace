const db = require('../database/db');
const ClsGoiTap = require('./ClsGoiTap');

class ClsHoaDon {
    constructor(data = {}) {
        this.maHoaDon = data.maHoaDon || '';
        this.maHoiVien = data.maHoiVien || null;
        this.ngayThanhToan = data.ngayThanhToan || '';
        this.tongTien = data.tongTien || 0;
        this.phuongThucThanhToan = data.phuongThucThanhToan || 'Tiền mặt';
        this.trangThai = data.trangThai !== undefined ? data.trangThai : 1;
        this.maNhanVien = data.maNhanVien || 'NV005';
    }

    // Tính tổng tiền toàn bộ giỏ hàng tạm (TinhTongTienHoaDon)
    static tinhTongTien(danhSachGoi = []) {
        return danhSachGoi.reduce((sum, item) => sum + (item.soLuong * item.donGia), 0);
    }

    tinhTongTien() {
        return this.danhSachGoi ? ClsHoaDon.tinhTongTien(this.danhSachGoi) : this.tongTien;
    }

    themGoi(goi) {
        if (!this.danhSachGoi) this.danhSachGoi = [];
        const existing = this.danhSachGoi.find(g => g.maGoiTap === (goi.maGoiTap || goi.maGoi));
        if (existing) {
            existing.soLuong += (goi.soLuong || 1);
        } else {
            this.danhSachGoi.push({
                maGoiTap: goi.maGoiTap || goi.maGoi,
                tenGoiTap: goi.tenGoiTap || goi.tenGoi,
                donGia: goi.donGia,
                soLuong: goi.soLuong || 1,
                soNgayMacDinh: goi.soNgayMacDinh || 30,
                hinhThucTap: goi.hinhThucTap || 'Trực tiếp'
            });
        }
    }

    xoaGoi(maGoi) {
        if (!this.danhSachGoi) return;
        this.danhSachGoi = this.danhSachGoi.filter(g => g.maGoiTap !== maGoi);
    }

    thanhToan() {
        return this.trangThai === 1 || this.trangThai === true;
    }

    kiemTraThanhToan() {
        return this.tongTien > 0 && (this.trangThai === 1 || this.trangThai === true);
    }

    static taoHoaDonMoi(data) {
        return ClsHoaDon.banGoiTap(data);
    }

    // Thực hiện thanh toán và bán gói tập trực tiếp (Đăng ký trực tiếp - Bán gói tập)
    // Ghi nhận HoaDon, ChiTietHoaDon, tạo TheHoiVien tương ứng và ghi log
    static banGoiTap(data) {
        const { maHoiVien, gioHang, phuongThucThanhToan, maNhanVien } = data;

        if (!gioHang || gioHang.length === 0) {
            throw new Error('Giỏ hàng trống! Vui lòng chọn ít nhất 1 gói tập.');
        }

        const nv = maNhanVien || 'NV005';
        const pttt = phuongThucThanhToan || 'Tiền mặt';
        const maHoaDon = `HD${Date.now().toString().slice(-8)}`;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        // 1. Tính tổng tiền
        let tongTien = 0;
        const chiTietList = [];

        for (const item of gioHang) {
            const goi = ClsGoiTap.layThongTin(item.maGoiTap);
            if (!goi) {
                throw new Error(`Gói tập ${item.maGoiTap} không tồn tại hoặc đã ngừng kinh doanh!`);
            }
            const soLuong = parseInt(item.soLuong, 10) || 1;
            const thanhTien = soLuong * goi.donGia;
            tongTien += thanhTien;
            chiTietList.push({
                maGoiTap: goi.maGoiTap,
                tenGoiTap: goi.tenGoiTap,
                soLuong,
                donGia: goi.donGia,
                thanhTien,
                soNgayMacDinh: goi.soNgayMacDinh,
                hinhThucTap: item.hinhThucTap || goi.hinhThucTap
            });
        }

        // 2. Chèn HoaDon
        const insertHD = db.prepare(`
            INSERT INTO HoaDon (maHoaDon, maHoiVien, ngayThanhToan, tongTien, phuongThucThanhToan, trangThai, maNhanVien)
            VALUES (?, ?, ?, ?, ?, 1, ?);
        `);
        insertHD.run(maHoaDon, maHoiVien || null, now, tongTien, pttt, nv);

        // 3. Chèn ChiTietHoaDon & Tạo Thẻ Hội Viên nếu đã có hội viên
        const insertCT = db.prepare(`
            INSERT INTO ChiTietHoaDon (maHoaDon, maGoiTap, soLuong, thanhTien)
            VALUES (?, ?, ?, ?);
        `);

        const insertThe = db.prepare(`
            INSERT INTO TheHoiVien (maThe, maHoiVien, maGoiTap, ngayKichHoat, ngayHetHan, trangThai)
            VALUES (?, ?, ?, ?, ?, 'Hoạt động');
        `);

        const createdCards = [];
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < chiTietList.length; i++) {
            const ct = chiTietList[i];
            insertCT.run(maHoaDon, ct.maGoiTap, ct.soLuong, ct.thanhTien);

            if (maHoiVien) {
                const maThe = `THE-${Date.now().toString().slice(-4)}${i + 1}`;
                const totalDays = ct.soNgayMacDinh * ct.soLuong;
                const expiryDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                insertThe.run(maThe, maHoiVien, ct.maGoiTap, todayStr, expiryDate);
                createdCards.push({ maThe, maGoiTap: ct.maGoiTap, tenGoiTap: ct.tenGoiTap, ngayKichHoat: todayStr, ngayHetHan: expiryDate });
            }
        }

        return {
            success: true,
            maHoaDon,
            maHoiVien,
            tongTien,
            phuongThucThanhToan: pttt,
            ngayThanhToan: now,
            chiTietList,
            createdCards
        };
    }

    // Lấy thông tin hóa đơn và các dòng chi tiết
    static layChiTietHoaDon(maHoaDon) {
        const hdStmt = db.prepare(`
            SELECT hd.maHoaDon, hd.maHoiVien, hd.ngayThanhToan, hd.tongTien,
                   hd.phuongThucThanhToan, hd.trangThai, hd.maNhanVien,
                   hv.hoTen AS tenHoiVien, nv.hoTen AS tenNhanVien
            FROM HoaDon hd
            LEFT JOIN HoiVien hv ON hd.maHoiVien = hv.maHoiVien
            LEFT JOIN NhanVien nv ON hd.maNhanVien = nv.maNhanVien
            WHERE hd.maHoaDon = ?;
        `);
        const hoaDon = hdStmt.get(maHoaDon);
        if (!hoaDon) return null;

        const ctStmt = db.prepare(`
            SELECT ct.maHoaDon, ct.maGoiTap, ct.soLuong, ct.thanhTien,
                   gt.tenGoiTap, gt.donGia, gt.soNgayMacDinh, gt.hinhThucTap
            FROM ChiTietHoaDon ct
            JOIN GoiTap gt ON ct.maGoiTap = gt.maGoiTap
            WHERE ct.maHoaDon = ?;
        `);
        hoaDon.chiTiet = ctStmt.all(maHoaDon);
        return hoaDon;
    }

    // Lấy danh sách tất cả hóa đơn
    static layDanhSach() {
        const stmt = db.prepare(`
            SELECT hd.maHoaDon, hd.maHoiVien, hd.ngayThanhToan, hd.tongTien,
                   hd.phuongThucThanhToan, hd.trangThai, hd.maNhanVien,
                   hv.hoTen AS tenHoiVien, nv.hoTen AS tenNhanVien
            FROM HoaDon hd
            LEFT JOIN HoiVien hv ON hd.maHoiVien = hv.maHoiVien
            LEFT JOIN NhanVien nv ON hd.maNhanVien = nv.maNhanVien
            ORDER BY hd.ngayThanhToan DESC;
        `);
        return stmt.all();
    }

    // Lấy lịch sử hóa đơn của 1 hội viên
    static layHoaDonCuaHoiVien(maHoiVien) {
        const stmt = db.prepare(`
            SELECT hd.maHoaDon, hd.maHoiVien, hd.ngayThanhToan, hd.tongTien,
                   hd.phuongThucThanhToan, hd.trangThai, hd.maNhanVien,
                   nv.hoTen AS tenNhanVien
            FROM HoaDon hd
            LEFT JOIN NhanVien nv ON hd.maNhanVien = nv.maNhanVien
            WHERE hd.maHoiVien = ?
            ORDER BY hd.ngayThanhToan DESC;
        `);
        const rows = stmt.all(maHoiVien);
        const ctStmt = db.prepare(`
            SELECT ct.maHoaDon, ct.maGoiTap, ct.soLuong, ct.thanhTien,
                   gt.tenGoiTap, gt.donGia, gt.soNgayMacDinh, gt.hinhThucTap
            FROM ChiTietHoaDon ct
            JOIN GoiTap gt ON ct.maGoiTap = gt.maGoiTap
            WHERE ct.maHoaDon = ?;
        `);
        return rows.map(r => ({
            ...r,
            chiTiet: ctStmt.all(r.maHoaDon)
        }));
    }
}

module.exports = ClsHoaDon;
