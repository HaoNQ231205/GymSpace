const db = require('../database/db');
const ClsKhachHang = require('./ClsKhachHang');

class ClsHoiVien {
    constructor(data = {}) {
        this.maHoiVien = data.maHoiVien || '';
        this.tenDangNhap = data.tenDangNhap || '';
        this.matKhau = data.matKhau || '';
        this.hoTen = data.hoTen || '';
        this.soDienThoai = data.soDienThoai || '';
        this.trangThai = data.trangThai || 'Hoạt động';
        this.maKhachHang = data.maKhachHang || null;
    }

    // Đăng nhập hệ thống
    static dangNhap(tenDangNhap, matKhau) {
        const stmt = db.prepare(`
            SELECT maHoiVien, tenDangNhap, hoTen, soDienThoai, trangThai, maKhachHang
            FROM HoiVien
            WHERE tenDangNhap = ? AND matKhau = ?;
        `);
        return stmt.get(tenDangNhap, matKhau) || null;
    }

    // Kiểm tra tên đăng nhập đã tồn tại trong bảng HoiVien hay chưa (Ngoại lệ 4b)
    // SELECT COUNT(*) AS SoLuong FROM HoiVien WHERE tenDangNhap = @tenDangNhap;
    static kiemTraTenDangNhap(tenDangNhap) {
        const stmt = db.prepare(`
            SELECT COUNT(*) AS soLuong
            FROM HoiVien
            WHERE tenDangNhap = ?;
        `);
        const result = stmt.get(tenDangNhap.trim());
        return result.soLuong > 0;
    }

    // Tự động phát sinh mã hội viên duy nhất (VD: HV00123)
    static phatSinhMaHoiVien() {
        const stmt = db.prepare(`SELECT maHoiVien FROM HoiVien ORDER BY ROWID DESC LIMIT 1;`);
        const last = stmt.get();
        if (!last || !last.maHoiVien.startsWith('HV')) {
            return 'HV00101';
        }
        const numPart = parseInt(last.maHoiVien.replace('HV', ''), 10);
        const nextNum = isNaN(numPart) ? 101 : numPart + 1;
        return `HV${String(nextNum).padStart(5, '0')}`;
    }

    // Tìm kiếm hội viên theo từ khóa (Mã hoặc SĐT)
    // SELECT maHoiVien, hoTen, soDienThoai, trangThai FROM HoiVien WHERE maHoiVien = @tuKhoa OR soDienThoai = @tuKhoa;
    static timKiemTheoTuKhoa(tuKhoa) {
        const kw = `%${(tuKhoa || '').trim()}%`;
        const stmt = db.prepare(`
            SELECT hv.maHoiVien, hv.tenDangNhap, hv.hoTen, hv.soDienThoai, hv.trangThai, hv.maKhachHang
            FROM HoiVien hv
            WHERE hv.maHoiVien LIKE ? OR hv.soDienThoai LIKE ? OR hv.hoTen LIKE ?
            ORDER BY hv.maHoiVien ASC;
        `);
        return stmt.all(kw, kw, kw);
    }

    // Lấy thông tin chi tiết hội viên
    // SELECT maHoiVien, tenDangNhap, hoTen, soDienThoai, trangThai, maKhachHang FROM HoiVien WHERE maHoiVien = @maHoiVien;
    static layThongTin(maHoiVien) {
        const stmt = db.prepare(`
            SELECT maHoiVien, tenDangNhap, hoTen, soDienThoai, trangThai, maKhachHang
            FROM HoiVien
            WHERE maHoiVien = ?;
        `);
        const row = stmt.get(maHoiVien);
        return row ? new ClsHoiVien(row) : null;
    }

    // Tạo mới tài khoản hội viên và hồ sơ khách hàng tương ứng trong cùng Transaction
    static luuHoiVienMoi(data) {
        // Kiểm tra bắt buộc
        if (!data.hoTen || !data.soDienThoai || !data.tenDangNhap || !data.matKhau) {
            throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc!');
        }

        // Kiểm tra trùng tên đăng nhập
        if (ClsHoiVien.kiemTraTenDangNhap(data.tenDangNhap)) {
            throw new Error(`Tên đăng nhập "${data.tenDangNhap}" đã tồn tại! Vui lòng chọn tên khác.`);
        }

        // Kiểm tra định dạng số điện thoại (10 chữ số)
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(data.soDienThoai.trim())) {
            throw new Error('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng 0).');
        }

        // Tạo khách hàng trước nếu chưa có
        let khachHang = ClsKhachHang.kiemTraTonTai(data.soDienThoai, data.email || '');
        if (!khachHang) {
            khachHang = ClsKhachHang.taoKhachHangMoi({
                hoTen: data.hoTen,
                soDienThoai: data.soDienThoai,
                email: data.email || '',
                ngaySinh: data.ngaySinh || null,
                gioiTinh: data.gioiTinh || 'Nam',
                noiDungTraoDoi: 'Tạo tài khoản hội viên mới'
            });
        }

        const maHV = data.maHoiVien || ClsHoiVien.phatSinhMaHoiVien();

        const insertStmt = db.prepare(`
            INSERT INTO HoiVien (maHoiVien, tenDangNhap, matKhau, hoTen, soDienThoai, trangThai, maKhachHang)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `);
        insertStmt.run(
            maHV,
            data.tenDangNhap.trim(),
            data.matKhau.trim(),
            data.hoTen.trim(),
            data.soDienThoai.trim(),
            'Hoạt động',
            khachHang.maKhachHang
        );

        // Nếu có mã hóa đơn vừa thanh toán (Theo quy trình Use Case 2: Thanh toán xong mới tạo tài khoản)
        // Tiến hành cập nhật mã hội viên vào hóa đơn và tự động cấp Thẻ Hội Viên tương ứng với các gói đã mua
        const createdCards = [];
        if (data.maHoaDon) {
            const updateHd = db.prepare(`UPDATE HoaDon SET maHoiVien = ? WHERE maHoaDon = ?;`);
            updateHd.run(maHV, data.maHoaDon);

            const ctStmt = db.prepare(`
                SELECT ct.maGoiTap, ct.soLuong, gt.tenGoiTap, gt.soNgayMacDinh
                FROM ChiTietHoaDon ct
                JOIN GoiTap gt ON ct.maGoiTap = gt.maGoiTap
                WHERE ct.maHoaDon = ?;
            `);
            const chiTietList = ctStmt.all(data.maHoaDon);
            const todayStr = new Date().toISOString().split('T')[0];

            const insertThe = db.prepare(`
                INSERT INTO TheHoiVien (maThe, maHoiVien, maGoiTap, ngayKichHoat, ngayHetHan, trangThai)
                VALUES (?, ?, ?, ?, ?, 'Hoạt động');
            `);

            for (let i = 0; i < chiTietList.length; i++) {
                const ct = chiTietList[i];
                const maThe = `THE-${Date.now().toString().slice(-4)}${i + 1}`;
                const totalDays = ct.soNgayMacDinh * ct.soLuong;
                const expiryDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                insertThe.run(maThe, maHV, ct.maGoiTap, todayStr, expiryDate);
                createdCards.push({ maThe, maGoiTap: ct.maGoiTap, tenGoiTap: ct.tenGoiTap, ngayKichHoat: todayStr, ngayHetHan: expiryDate });
            }
        }

        const hvResult = ClsHoiVien.layThongTin(maHV);
        return {
            ...hvResult,
            createdCards
        };
    }

    // Xem danh sách gói tập trên thẻ của hội viên
    xemGoiTap() {
        const stmt = db.prepare(`
            SELECT th.maThe, gt.maGoiTap, gt.tenGoiTap, gt.soNgayMacDinh, gt.donGia, gt.hinhThucTap,
                   th.ngayKichHoat, th.ngayHetHan, th.trangThai
            FROM TheHoiVien th
            JOIN GoiTap gt ON th.maGoiTap = gt.maGoiTap
            WHERE th.maHoiVien = ?
            ORDER BY CASE WHEN th.trangThai = 'Hoạt động' THEN 0 ELSE 1 END, th.ngayKichHoat DESC;
        `);
        return stmt.all(this.maHoiVien);
    }

    // Cập nhật thông tin hội viên (Sửa thông tin)
    // UPDATE HoiVien SET hoTen = @hoTenMoi, soDienThoai = @soDienThoaiMoi WHERE maHoiVien = @maHoiVien;
    static capNhatThongTin(maHoiVien, hoTenMoi, soDienThoaiMoi) {
        // Kiểm tra regex SĐT
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(soDienThoaiMoi.trim())) {
            throw new Error('Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng 10 chữ số (Ví dụ: 0987654321).');
        }

        if (!hoTenMoi || hoTenMoi.trim() === '') {
            throw new Error('Họ tên không được để trống!');
        }

        const current = ClsHoiVien.layThongTin(maHoiVien);
        if (!current) {
            throw new Error(`Không tìm thấy hội viên với mã ${maHoiVien}`);
        }

        const stmt = db.prepare(`
            UPDATE HoiVien
            SET hoTen = ?, soDienThoai = ?
            WHERE maHoiVien = ?;
        `);
        stmt.run(hoTenMoi.trim(), soDienThoaiMoi.trim(), maHoiVien);

        // Đồng bộ cập nhật sang KhachHang nếu có liên kết
        if (current.maKhachHang) {
            const khStmt = db.prepare(`
                UPDATE KhachHang
                SET hoTen = ?, soDienThoai = ?
                WHERE maKhachHang = ?;
            `);
            khStmt.run(hoTenMoi.trim(), soDienThoaiMoi.trim(), current.maKhachHang);
        }

        return ClsHoiVien.layThongTin(maHoiVien);
    }
}

module.exports = ClsHoiVien;
