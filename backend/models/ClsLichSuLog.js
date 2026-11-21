const db = require('../database/db');

class ClsLichSuLog {
    constructor(data = {}) {
        this.maLog = data.maLog || '';
        this.maNhanVien = data.maNhanVien || '';
        this.maHoiVien = data.maHoiVien || null;
        this.thoiGian = data.thoiGian || '';
        this.hanhDong = data.hanhDong || '';
        this.truongThayDoi = data.truongThayDoi || '';
        this.giaTriCu = data.giaTriCu || '';
        this.giaTriMoi = data.giaTriMoi || '';
    }

    // Ghi nhật ký vào bảng LichSuLog
    // INSERT INTO LichSuLog (maLog, maNhanVien, maHoiVien, thoiGian, hanhDong, truongThayDoi, giaTriCu, giaTriMoi) VALUES ...
    static ghiNhanLog(maNhanVien, maHoiVien, hanhDong, truongThayDoi, giaTriCu, giaTriMoi) {
        const maLog = `LOG${Date.now().toString().slice(-6)}`;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const stmt = db.prepare(`
            INSERT INTO LichSuLog (maLog, maNhanVien, maHoiVien, thoiGian, hanhDong, truongThayDoi, giaTriCu, giaTriMoi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `);
        stmt.run(
            maLog,
            maNhanVien || 'NV005',
            maHoiVien || null,
            now,
            hanhDong,
            truongThayDoi || '',
            String(giaTriCu || ''),
            String(giaTriMoi || '')
        );
        return true;
    }

    // Lấy toàn bộ danh sách lịch sử thao tác
    static layLichSu(limit = 100) {
        const stmt = db.prepare(`
            SELECT l.maLog, l.maNhanVien, l.maHoiVien, l.thoiGian, l.hanhDong,
                   l.truongThayDoi, l.giaTriCu, l.giaTriMoi,
                   nv.hoTen AS tenNhanVien, hv.hoTen AS tenHoiVien
            FROM LichSuLog l
            LEFT JOIN NhanVien nv ON l.maNhanVien = nv.maNhanVien
            LEFT JOIN HoiVien hv ON l.maHoiVien = hv.maHoiVien
            ORDER BY l.thoiGian DESC
            LIMIT ?;
        `);
        return stmt.all(limit);
    }
}

module.exports = ClsLichSuLog;
