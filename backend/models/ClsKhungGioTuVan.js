// Lớp ClsKhungGioTuVan theo thiết kế hình 51 (N13 Nhóm 1)
class ClsKhungGioTuVan {
    constructor(data = {}) {
        this.maKhungGio = data.maKhungGio || '';
        this.thoiGianBatDau = data.thoiGianBatDau || '';
        this.thoiGianKetThuc = data.thoiGianKetThuc || '';
        this.trangThai = data.trangThai || 'Còn trống'; // 'Còn trống' | 'Đã đặt' | 'Đang giữ'
    }

    kiemTraConTrong() {
        return this.trangThai === 'Còn trống';
    }

    giuChoNeuConTrong() {
        if (this.kiemTraConTrong()) {
            this.trangThai = 'Đang giữ';
            return true;
        }
        return false;
    }

    giaiPhong() {
        this.trangThai = 'Còn trống';
    }
}

module.exports = ClsKhungGioTuVan;
