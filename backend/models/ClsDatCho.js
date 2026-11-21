const db = require('../database/db');

class ClsDatCho {
    constructor(data = {}) {
        this.maDatCho = data.maDatCho || '';
        this.maLop = data.maLop || '';
        this.maHoiVien = data.maHoiVien || '';
        this.trangThaiDat = data.trangThaiDat || 'Đã đặt';
    }

    // Kiểm tra quyền đặt chỗ của hội viên (Phải sở hữu ít nhất 1 gói tập còn hiệu lực)
    static kiemTraQuyenDatCho(maHoiVien) {
        const today = new Date().toISOString().split('T')[0];
        const stmt = db.prepare(`
            SELECT COUNT(*) AS count
            FROM TheHoiVien
            WHERE maHoiVien = ? AND trangThai = 'Hoạt động' AND ngayHetHan >= ?;
        `);
        const result = stmt.get(maHoiVien, today);
        return result.count > 0;
    }

    // Đặt chỗ lớp học
    static datChoLopHoc(maLop, maHoiVien) {
        if (!ClsDatCho.kiemTraQuyenDatCho(maHoiVien)) {
            throw new Error('Hội viên không có gói tập đang hoạt động hoặc gói đã hết hạn!');
        }

        // Kiểm tra xem đã đặt chỗ chưa
        const checkStmt = db.prepare(`
            SELECT maDatCho, trangThaiDat FROM DatCho
            WHERE maLop = ? AND maHoiVien = ?;
        `);
        const existing = checkStmt.get(maLop, maHoiVien);
        if (existing && existing.trangThaiDat === 'Đã đặt') {
            throw new Error('Hội viên đã đặt chỗ cho lớp học này rồi!');
        }

        // Kiểm tra sĩ số lớp
        const lopStmt = db.prepare(`SELECT soChoToiDa, soChoDat FROM LopHoc WHERE maLop = ?;`);
        const lop = lopStmt.get(maLop);
        if (!lop) throw new Error('Không tìm thấy lớp học!');
        if (lop.soChoDat >= lop.soChoToiDa) {
            throw new Error('Lớp học đã đủ sĩ số tối đa!');
        }

        const maDatCho = existing ? existing.maDatCho : `DC${Date.now().toString().slice(-6)}`;

        if (existing) {
            db.prepare(`UPDATE DatCho SET trangThaiDat = 'Đã đặt' WHERE maDatCho = ?;`).run(maDatCho);
        } else {
            db.prepare(`INSERT INTO DatCho (maDatCho, maLop, maHoiVien, trangThaiDat) VALUES (?, ?, ?, 'Đã đặt');`).run(maDatCho, maLop, maHoiVien);
        }

        // Tăng sĩ số
        db.prepare(`UPDATE LopHoc SET soChoDat = soChoDat + 1 WHERE maLop = ?;`).run(maLop);

        return { success: true, maDatCho };
    }

    // Hủy đặt chỗ
    static huyDatCho(maDatCho) {
        const stmt = db.prepare(`SELECT maDatCho, maLop, trangThaiDat FROM DatCho WHERE maDatCho = ?;`);
        const dc = stmt.get(maDatCho);
        if (!dc) throw new Error('Không tìm thấy lượt đặt chỗ!');

        if (dc.trangThaiDat === 'Đã đặt') {
            db.prepare(`UPDATE DatCho SET trangThaiDat = 'Đã hủy' WHERE maDatCho = ?;`).run(maDatCho);
            db.prepare(`UPDATE LopHoc SET soChoDat = MAX(0, soChoDat - 1) WHERE maLop = ?;`).run(dc.maLop);
        }
        return true;
    }

    // Lấy danh sách hội viên đã đặt chỗ của một lớp
    static layHoiVienDaDat(maLop) {
        const stmt = db.prepare(`
            SELECT dc.maDatCho, dc.trangThaiDat, hv.maHoiVien, hv.hoTen, hv.soDienThoai
            FROM DatCho dc
            JOIN HoiVien hv ON dc.maHoiVien = hv.maHoiVien
            WHERE dc.maLop = ?
            ORDER BY dc.maDatCho ASC;
        `);
        return stmt.all(maLop);
    }

    // Lấy danh sách các lớp học mà 1 hội viên cụ thể đã đặt
    static layDanhSachDatChoCuaHoiVien(maHoiVien) {
        const stmt = db.prepare(`
            SELECT dc.maDatCho, dc.maLop, dc.trangThaiDat,
                   lh.tenLop, lh.phongTap, lh.gioBatDau, lh.gioKetThuc, lh.hlv, lh.ngayHoc, lh.soChoToiDa, lh.soChoDat
            FROM DatCho dc
            JOIN LopHoc lh ON dc.maLop = lh.maLop
            WHERE dc.maHoiVien = ?
            ORDER BY lh.gioBatDau ASC;
        `);
        return stmt.all(maHoiVien);
    }
}

module.exports = ClsDatCho;
