class ClsChiTietHoaDon {
    constructor(data = {}) {
        this.maHoaDon = data.maHoaDon || '';
        this.maGoiTap = data.maGoiTap || '';
        this.soLuong = data.soLuong || 1;
        this.thanhTien = data.thanhTien || 0;
    }

    // Tính thành tiền = soLuong * donGia
    static tinhThanhTien(soLuong, donGia) {
        return (parseInt(soLuong, 10) || 1) * (parseInt(donGia, 10) || 0);
    }

    // Kiểm tra dữ liệu hợp lệ
    kiemTraDuLieu() {
        return this.soLuong > 0 && this.thanhTien >= 0;
    }
}

module.exports = ClsChiTietHoaDon;
