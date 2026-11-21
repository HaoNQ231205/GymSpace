const db = require('../database/db');

class ClsKhachHang {
    constructor(data = {}) {
        this.maKhachHang = data.maKhachHang || '';
        this.hoTen = data.hoTen || '';
        this.soDienThoai = data.soDienThoai || '';
        this.email = data.email || '';
        this.noiDungTraoDoi = data.noiDungTraoDoi || '';
        this.ngaySinh = data.ngaySinh || null;
        this.gioiTinh = data.gioiTinh || 'Nam';
    }

    // Kiểm tra khách hàng tồn tại qua Số điện thoại hoặc Email
    // SELECT maKhachHang, hoTen, dienThoai, email FROM KhachHang WHERE dienThoai = @soDienThoai OR email = @email;
    static kiemTraTonTai(soDienThoai, email = '') {
        const stmt = db.prepare(`
            SELECT maKhachHang, hoTen, soDienThoai, email, noiDungTraoDoi, ngaySinh, gioiTinh
            FROM KhachHang
            WHERE soDienThoai = ? OR (email IS NOT NULL AND email = ? AND email <> '');
        `);
        return stmt.get(soDienThoai, email) || null;
    }

    // Lấy thông tin chi tiết khách hàng theo mã
    // SELECT maKhachHang, hoTen, ngaySinh, gioiTinh, soDienThoai, email FROM KhachHang WHERE maKhachHang = @maKhachHang;
    static layThongTin(maKhachHang) {
        const stmt = db.prepare(`
            SELECT maKhachHang, hoTen, ngaySinh, gioiTinh, soDienThoai, email, noiDungTraoDoi
            FROM KhachHang
            WHERE maKhachHang = ?;
        `);
        const row = stmt.get(maKhachHang);
        return row ? new ClsKhachHang(row) : null;
    }

    // Tìm kiếm khách hàng theo từ khóa (Mã hoặc SĐT)
    // SELECT maKhachHang, hoTen, ngaySinh, gioiTinh, soDienThoai, email FROM KhachHang WHERE maKhachHang LIKE ... OR soDienThoai LIKE ...
    static timKiem(tuKhoa = '') {
        const keyword = `%${tuKhoa.trim()}%`;
        const stmt = db.prepare(`
            SELECT maKhachHang, hoTen, ngaySinh, gioiTinh, soDienThoai, email, noiDungTraoDoi
            FROM KhachHang
            WHERE maKhachHang LIKE ? OR soDienThoai LIKE ? OR hoTen LIKE ?
            ORDER BY maKhachHang DESC;
        `);
        return stmt.all(keyword, keyword, keyword);
    }

    // Kiểm tra trùng SĐT / Email với khách hàng khác khi sửa
    static kiemTraTrungLapKhac(maKhachHang, soDienThoai, email) {
        const stmt = db.prepare(`
            SELECT maKhachHang,
                   CASE WHEN soDienThoai = ? THEN 1 ELSE 0 END AS trungSDT,
                   CASE WHEN email = ? AND email <> '' THEN 1 ELSE 0 END AS trungEmail
            FROM KhachHang
            WHERE maKhachHang <> ?
              AND (soDienThoai = ? OR (email IS NOT NULL AND email = ? AND email <> ''));
        `);
        return stmt.get(soDienThoai, email, maKhachHang, soDienThoai, email);
    }

    // Cập nhật thông tin khách hàng (Sửa thông tin khách hàng)
    capNhatThongTin(data = {}) {
        const stmt = db.prepare(`
            UPDATE KhachHang
            SET hoTen = ?,
                ngaySinh = ?,
                gioiTinh = ?,
                soDienThoai = ?,
                email = ?,
                noiDungTraoDoi = COALESCE(?, noiDungTraoDoi)
            WHERE maKhachHang = ?;
        `);
        stmt.run(
            (data.hoTen || this.hoTen).trim(),
            data.ngaySinh || this.ngaySinh,
            data.gioiTinh || this.gioiTinh,
            (data.soDienThoai || this.soDienThoai).trim(),
            (data.email || this.email).trim(),
            data.noiDungTraoDoi || this.noiDungTraoDoi,
            this.maKhachHang
        );

        // Đồng bộ cập nhật sang HoiVien nếu đã có tài khoản
        const syncStmt = db.prepare(`
            UPDATE HoiVien
            SET hoTen = ?, soDienThoai = ?
            WHERE maKhachHang = ?;
        `);
        syncStmt.run((data.hoTen || this.hoTen).trim(), (data.soDienThoai || this.soDienThoai).trim(), this.maKhachHang);

        return true;
    }

    // Lưu khách hàng mới vào CSDL
    // INSERT INTO KhachHang (maKhachHang, hoTen, soDienThoai, email, noiDungTraoDoi, ngaySinh, gioiTinh) VALUES ...
    static taoKhachHangMoi(data) {
        const maKH = data.maKhachHang || `KH${Date.now().toString().slice(-6)}`;
        const stmt = db.prepare(`
            INSERT INTO KhachHang (maKhachHang, hoTen, soDienThoai, email, noiDungTraoDoi, ngaySinh, gioiTinh)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `);
        stmt.run(
            maKH,
            data.hoTen.trim(),
            data.soDienThoai.trim(),
            (data.email || '').trim(),
            (data.noiDungTraoDoi || '').trim(),
            data.ngaySinh || null,
            data.gioiTinh || 'Nam'
        );
        return ClsKhachHang.layThongTin(maKH);
    }
}

module.exports = ClsKhachHang;
