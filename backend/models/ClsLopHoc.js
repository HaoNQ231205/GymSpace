const db = require('../database/db');

class ClsLopHoc {
    constructor(data = {}) {
        this.maLop = data.maLop || '';
        this.tenLop = data.tenLop || '';
        this.ngayHoc = data.ngayHoc || '';
        this.gioBatDau = data.gioBatDau || '';
        this.gioKetThuc = data.gioKetThuc || '';
        this.hlv = data.hlv || '';
        this.phongTap = data.phongTap || '';
        this.soChoToiDa = data.soChoToiDa || 20;
        this.soChoDat = data.soChoDat || 0;
        this.maNhanVien = data.maNhanVien || 'NV005';
    }

    // Kiểm tra trùng lịch phòng tập
    static kiemTraTrungLichPhong(phongTap, ngayHoc, gioBatDau, gioKetThuc, excludeMaLop = '') {
        const stmt = db.prepare(`
            SELECT COUNT(*) AS count
            FROM LopHoc
            WHERE phongTap = ? AND ngayHoc = ?
              AND maLop <> ?
              AND (
                  (gioBatDau < ? AND gioKetThuc > ?) OR
                  (gioBatDau >= ? AND gioBatDau < ?)
              );
        `);
        const result = stmt.get(phongTap, ngayHoc, excludeMaLop, gioKetThuc, gioBatDau, gioBatDau, gioKetThuc);
        return result.count > 0;
    }

    // Kiểm tra trùng lịch huấn luyện viên
    static kiemTraTrungLichHLV(hlv, ngayHoc, gioBatDau, gioKetThuc, excludeMaLop = '') {
        const stmt = db.prepare(`
            SELECT COUNT(*) AS count
            FROM LopHoc
            WHERE hlv = ? AND ngayHoc = ?
              AND maLop <> ?
              AND (
                  (gioBatDau < ? AND gioKetThuc > ?) OR
                  (gioBatDau >= ? AND gioBatDau < ?)
              );
        `);
        const result = stmt.get(hlv, ngayHoc, excludeMaLop, gioKetThuc, gioBatDau, gioBatDau, gioKetThuc);
        return result.count > 0;
    }

    // Kiểm tra còn chỗ trống
    conChoTrong() {
        return this.soChoDat < this.soChoToiDa;
    }

    // Lấy danh sách lớp học
    static layDanhSach() {
        const stmt = db.prepare(`
            SELECT maLop, tenLop, ngayHoc, gioBatDau, gioKetThuc, hlv, phongTap, soChoToiDa, soChoDat, maNhanVien
            FROM LopHoc
            ORDER BY ngayHoc ASC, gioBatDau ASC;
        `);
        return stmt.all().map(l => new ClsLopHoc(l));
    }

    // Cập nhật lớp học
    static capNhatLichHoc(maLop, data) {
        if (ClsLopHoc.kiemTraTrungLichPhong(data.phongTap, data.ngayHoc, data.gioBatDau, data.gioKetThuc, maLop)) {
            throw new Error(`Phòng tập ${data.phongTap} đã bị trùng lịch trong khoảng thời gian này!`);
        }
        if (ClsLopHoc.kiemTraTrungLichHLV(data.hlv, data.ngayHoc, data.gioBatDau, data.gioKetThuc, maLop)) {
            throw new Error(`Huấn luyện viên ${data.hlv} đã có lịch dạy ca khác trong khung giờ này!`);
        }

        const stmt = db.prepare(`
            UPDATE LopHoc
            SET tenLop = ?, ngayHoc = ?, gioBatDau = ?, gioKetThuc = ?, hlv = ?, phongTap = ?, soChoToiDa = ?
            WHERE maLop = ?;
        `);
        stmt.run(data.tenLop, data.ngayHoc, data.gioBatDau, data.gioKetThuc, data.hlv, data.phongTap, data.soChoToiDa, maLop);
        return true;
    }
}

module.exports = ClsLopHoc;
