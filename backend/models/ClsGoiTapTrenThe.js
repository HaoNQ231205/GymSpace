const db = require('../database/db');

class ClsGoiTapTrenThe {
    constructor(data = {}) {
        this.maThe = data.maThe || '';
        this.maHoiVien = data.maHoiVien || '';
        this.maGoiTap = data.maGoiTap || '';
        this.tenGoiTap = data.tenGoiTap || '';
        this.hinhThucTap = data.hinhThucTap || 'Trực tiếp';
        this.ngayKichHoat = data.ngayKichHoat || '';
        this.ngayHetHan = data.ngayHetHan || '';
        this.trangThai = data.trangThai || 'Hoạt động';
    }

    // Kiểm tra hiệu lực gói tập
    kiemTraHieuLuc() {
        if (this.trangThai !== 'Hoạt động') return false;
        const today = new Date().toISOString().split('T')[0];
        return this.ngayHetHan >= today;
    }

    // Kiểm tra điều kiện gia hạn (Hoạt động hoặc Hết hạn)
    kiemTraDieuKienGiaHan() {
        return this.trangThai === 'Hoạt động' || this.trangThai === 'Hết hạn';
    }

    // Gia hạn gói tập
    // UPDATE TheHoiVien SET ngayHetHan = @ngayHetHanMoi, trangThai = CASE WHEN ...
    static giaHan(maThe, soKyGiaHan, maNhanVien, phuongThucThanhToan) {
        if (!soKyGiaHan || soKyGiaHan <= 0) {
            throw new Error('Số kỳ gia hạn phải là số nguyên lớn hơn 0!');
        }

        // 1. Lấy thông tin thẻ & gói
        const stmt = db.prepare(`
            SELECT th.maThe, th.maHoiVien, th.ngayHetHan, th.trangThai,
                   gt.maGoiTap, gt.tenGoiTap, gt.donGia, gt.soNgayMacDinh
            FROM TheHoiVien th
            JOIN GoiTap gt ON th.maGoiTap = gt.maGoiTap
            WHERE th.maThe = ?;
        `);
        const item = stmt.get(maThe);
        if (!item) {
            throw new Error('Không tìm thấy thông tin thẻ hội viên!');
        }

        if (item.trangThai === 'Đã kết thúc' || item.trangThai === 'Khóa') {
            throw new Error('Trạng thái hiện tại không cho phép gia hạn!');
        }

        const soNgayGiaHan = soKyGiaHan * item.soNgayMacDinh;
        const oldExpiry = new Date(item.ngayHetHan);
        const newExpiry = new Date(oldExpiry.getTime() + soNgayGiaHan * 24 * 60 * 60 * 1000);
        const ngayHetHanMoi = newExpiry.toISOString().split('T')[0];

        const today = new Date().toISOString().split('T')[0];
        const trangThaiMoi = ngayHetHanMoi >= today ? 'Hoạt động' : 'Hết hạn';
        const tongTien = soKyGiaHan * item.donGia;

        // Transaction: Cập nhật TheHoiVien + Tạo HoaDon + Tạo ChiTietHoaDon + Ghi Log
        const maHoaDon = `HD${Date.now().toString().slice(-8)}`;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        // Update TheHoiVien
        const updateThe = db.prepare(`
            UPDATE TheHoiVien
            SET ngayHetHan = ?, trangThai = ?
            WHERE maThe = ?;
        `);
        updateThe.run(ngayHetHanMoi, trangThaiMoi, maThe);

        // Tạo HoaDon
        const insertHD = db.prepare(`
            INSERT INTO HoaDon (maHoaDon, maHoiVien, ngayThanhToan, tongTien, phuongThucThanhToan, trangThai, maNhanVien)
            VALUES (?, ?, ?, ?, ?, 1, ?);
        `);
        insertHD.run(maHoaDon, item.maHoiVien, now, tongTien, phuongThucThanhToan || 'Tiền mặt', maNhanVien || 'NV005');

        // Tạo ChiTietHoaDon
        const insertCT = db.prepare(`
            INSERT INTO ChiTietHoaDon (maHoaDon, maGoiTap, soLuong, thanhTien)
            VALUES (?, ?, ?, ?);
        `);
        insertCT.run(maHoaDon, item.maGoiTap, soKyGiaHan, tongTien);

        return {
            maHoaDon,
            maThe,
            ngayHetHanCu: item.ngayHetHan,
            ngayHetHanMoi,
            soKyGiaHan,
            soNgayGiaHan,
            tongTien,
            trangThaiMoi
        };
    }

    // Kết thúc gói tập trước hạn (Nghiệp vụ Use Case Kết thúc gói tập)
    // UPDATE TheHoiVien SET trangThai = 'Đã kết thúc' WHERE maThe = @maThe AND maHoiVien = @maHoiVien AND trangThai = 'Hoạt động'
    static ketThucGoi(maThe, maHoiVien, maNhanVien = 'NV005') {
        const stmt = db.prepare(`
            SELECT th.maThe, th.maHoiVien, th.ngayKichHoat, th.ngayHetHan, th.trangThai, gt.tenGoiTap
            FROM TheHoiVien th
            JOIN GoiTap gt ON th.maGoiTap = gt.maGoiTap
            WHERE th.maThe = ? AND th.maHoiVien = ? AND th.trangThai = 'Hoạt động';
        `);
        const item = stmt.get(maThe, maHoiVien);
        if (!item) {
            throw new Error('Gói tập không còn ở trạng thái Hoạt động hoặc không thuộc về hội viên này!');
        }

        // Cập nhật trạng thái
        const updateThe = db.prepare(`
            UPDATE TheHoiVien
            SET trangThai = 'Đã kết thúc'
            WHERE maThe = ? AND maHoiVien = ? AND trangThai = 'Hoạt động';
        `);
        updateThe.run(maThe, maHoiVien);

        // Kiểm tra xem hội viên còn gói nào đang "Hoạt động" nữa không
        const checkActive = db.prepare(`
            SELECT COUNT(*) AS soGoiHoatDong
            FROM TheHoiVien
            WHERE maHoiVien = ? AND trangThai = 'Hoạt động';
        `);
        const remaining = checkActive.get(maHoiVien).soGoiHoatDong;

        let biHuyDatCho = 0;
        // Nếu không còn gói hoạt động nào khác, hủy các lượt đặt chỗ của các lớp chưa diễn ra
        if (remaining === 0) {
            const today = new Date().toISOString().split('T')[0];

            // Giảm số chỗ đặt trong LopHoc
            const updateLop = db.prepare(`
                UPDATE LopHoc
                SET soChoDat = MAX(0, soChoDat - (
                    SELECT COUNT(*) FROM DatCho dc
                    WHERE dc.maLop = LopHoc.maLop AND dc.maHoiVien = ? AND dc.trangThaiDat = 'Đã đặt'
                ))
                WHERE maLop IN (
                    SELECT dc.maLop FROM DatCho dc
                    JOIN LopHoc l ON l.maLop = dc.maLop
                    WHERE dc.maHoiVien = ? AND dc.trangThaiDat = 'Đã đặt' AND l.ngayHoc >= ?
                );
            `);
            updateLop.run(maHoiVien, maHoiVien, today);

            // Cập nhật trạng thái các lượt đặt chỗ thành 'Đã hủy'
            const updateDatCho = db.prepare(`
                UPDATE DatCho
                SET trangThaiDat = 'Đã hủy'
                WHERE maHoiVien = ? AND trangThaiDat = 'Đã đặt'
                  AND maLop IN (SELECT maLop FROM LopHoc WHERE ngayHoc >= ?);
            `);
            const info = updateDatCho.run(maHoiVien, today);
            biHuyDatCho = info.changes;
        }

        return {
            success: true,
            maThe,
            tenGoiTap: item.tenGoiTap,
            conGoiHoatDongKhac: remaining > 0,
            soLopBiHuy: biHuyDatCho
        };
    }

    // Sửa thông tin gói tập (Hình thức tập trên thẻ)
    static capNhatHinhThucTap(maThe, hinhThucMoi, maNhanVien = 'NV005') {
        const stmt = db.prepare(`
            SELECT th.maThe, th.maHoiVien, th.trangThai, gt.hinhThucTap, gt.tenGoiTap
            FROM TheHoiVien th
            JOIN GoiTap gt ON th.maGoiTap = gt.maGoiTap
            WHERE th.maThe = ?;
        `);
        const item = stmt.get(maThe);
        if (!item) {
            throw new Error('Không tìm thấy thông tin gói tập trên thẻ!');
        }

        if (item.hinhThucTap === hinhThucMoi) {
            throw new Error('Thông tin chưa có thay đổi!');
        }

        const validForms = ['Trực tiếp', 'Trực tuyến', 'Kèm 1-1', 'Toàn diện', 'Linh hoạt'];
        if (!validForms.includes(hinhThucMoi)) {
            throw new Error('Vui lòng chọn hình thức tập hợp lệ!');
        }

        // Cập nhật bảng GoiTap hoặc cập nhật cấu hình
        const updateGoi = db.prepare(`UPDATE GoiTap SET hinhThucTap = ? WHERE maGoiTap = (SELECT maGoiTap FROM TheHoiVien WHERE maThe = ?);`);
        updateGoi.run(hinhThucMoi, maThe);

        return {
            success: true,
            maThe,
            tenGoiTap: item.tenGoiTap,
            hinhThucCu: item.hinhThucTap,
            hinhThucMoi
        };
    }
}

module.exports = ClsGoiTapTrenThe;
