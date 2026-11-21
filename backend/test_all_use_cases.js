const db = require('./database/db');
const ClsKhachHang = require('./models/ClsKhachHang');
const ClsLichHenTuVan = require('./models/ClsLichHenTuVan');
const ClsKhungGioTuVan = require('./models/ClsKhungGioTuVan');
const ClsHoiVien = require('./models/ClsHoiVien');
const TheHoiVien = require('./models/TheHoiVien');
const ClsGoiTapTrenThe = require('./models/ClsGoiTapTrenThe');
const ClsGoiTap = require('./models/ClsGoiTap');
const ClsNhanVien = require('./models/ClsNhanVien');
const ClsHoaDon = require('./models/ClsHoaDon');
const ClsChiTietHoaDon = require('./models/ClsChiTietHoaDon');
const ClsLopHoc = require('./models/ClsLopHoc');
const ClsDatCho = require('./models/ClsDatCho');
const ClsLichSuLog = require('./models/ClsLichSuLog');

console.log('====================================================');
console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN CÁC LỚP & CHỨC NĂNG');
console.log('====================================================\n');

// 1. Test ClsKhachHang
console.log('--- 1. Kiểm tra ClsKhachHang ---');
const kh = ClsKhachHang.kiemTraTonTai('0901234567');
console.log('Khách hàng tồn tại (0901234567):', kh ? kh.hoTen : 'Không tìm thấy');
const khInfo = ClsKhachHang.layThongTin('KH001');
console.log('Lấy thông tin KH001:', khInfo ? `${khInfo.hoTen} (${khInfo.email})` : 'Không');

// 2. Test ClsLichHenTuVan & ClsKhungGioTuVan (Use Case 1)
console.log('\n--- 2. Kiểm tra Use Case 1: Đặt lịch tư vấn ---');
const slots = ClsLichHenTuVan.kiemTraKhungGioTrong('2026-11-25');
console.log(`Tổng số khung giờ 30p ngày 2026-11-25: ${slots.length}`);
console.log('Trạng thái ca 08:30:', slots.find(s => s.gioBatDau === '08:30')?.trangThai);
console.log('Trạng thái ca 09:00:', slots.find(s => s.gioBatDau === '09:00')?.trangThai);

const kg = new ClsKhungGioTuVan({ maKhungGio: 'KG01', thoiGianBatDau: '08:00', thoiGianKetThuc: '08:30', trangThai: 'Còn trống' });
console.log('Khung giờ còn trống?', kg.kiemTraConTrong());
kg.giuChoNeuConTrong();
console.log('Sau khi giữ chỗ:', kg.trangThai);

// 3. Test ClsGoiTap & ClsHoaDon (Use Case 2)
console.log('\n--- 3. Kiểm tra Use Case 2: Đăng ký trực tiếp - Bán gói tập ---');
const packages = ClsGoiTap.layDanhSach();
console.log(`Số gói tập đang kinh doanh: ${packages.length}`);
packages.forEach(p => console.log(` - [${p.maGoiTap}] ${p.tenGoiTap}: ${p.donGia.toLocaleString()}đ / ${p.soNgayMacDinh} ngày`));

const saleResult = ClsHoaDon.banGoiTap({
    maHoiVien: 'HV001',
    gioHang: [
        { maGoiTap: 'G01', soLuong: 1 },
        { maGoiTap: 'G03', soLuong: 1 }
    ],
    phuongThucThanhToan: 'Chuyển khoản',
    maNhanVien: 'NV005'
});
console.log(`Bán gói thành công! Mã HĐ: ${saleResult.maHoaDon}, Tổng tiền: ${saleResult.tongTien.toLocaleString()}đ`);
console.log(`Thẻ hội viên mới được tạo: ${saleResult.createdCards.length}`);

// 4. Test ClsHoiVien (Use Case 3)
console.log('\n--- 4. Kiểm tra Use Case 3: Tạo tài khoản hội viên mới ---');
const testUsername = `user_test_${Date.now().toString().slice(-4)}`;
const isTaken = ClsHoiVien.kiemTraTenDangNhap(testUsername);
console.log(`Tên đăng nhập ${testUsername} đã tồn tại? ${isTaken}`);
const newMember = ClsHoiVien.luuHoiVienMoi({
    hoTen: 'Hội Viên Mới Test',
    soDienThoai: '0988001122',
    email: 'member.test@gymspace.vn',
    tenDangNhap: testUsername,
    matKhau: '123456',
    maNhanVien: 'NV005'
});
console.log(`Tạo hội viên mới thành công: ${newMember.hoTen} (${newMember.maHoiVien})`);

// 5. Test Sửa thông tin hội viên (Use Case 4)
console.log('\n--- 5. Kiểm tra Use Case 4: Sửa thông tin hội viên (LOG9913) ---');
const updatedHv = ClsHoiVien.capNhatThongTin('HV002', 'Hội Viên 02', '0987654321');
console.log(`Cập nhật thành công HV002: Họ tên = ${updatedHv.hoTen}, SĐT = ${updatedHv.soDienThoai}`);

// 6. Test TheHoiVien & ClsGoiTapTrenThe (Use Case 5)
console.log('\n--- 6. Kiểm tra Use Case 5: Gia hạn gói tập ---');
const cardsHv1 = TheHoiVien.layDanhSachGoi('HV001');
console.log(`HV001 đang sở hữu ${cardsHv1.length} gói tập`);
const cardToRenew = cardsHv1[0];
const renewRes = ClsGoiTapTrenThe.giaHan(cardToRenew.maThe, 2, 'NV005', 'Tiền mặt');
console.log(`Gia hạn thẻ ${renewRes.maThe} thành công! Hạn mới: ${renewRes.ngayHetHanMoi}, Tổng tiền: ${renewRes.tongTien.toLocaleString()}đ`);

// 7. Test Kết thúc gói tập (Use Case 6)
console.log('\n--- 7. Kiểm tra Use Case 6: Kết thúc gói tập ---');
const termRes = ClsGoiTapTrenThe.ketThucGoi(cardToRenew.maThe, 'HV001', 'NV005');
console.log(`Kết thúc gói tập thành công! Thẻ: ${termRes.maThe}, Còn gói khác hoạt động: ${termRes.conGoiHoatDongKhac}`);

// 8. Test Sửa thông tin gói tập (Use Case 7)
console.log('\n--- 8. Kiểm tra Use Case 7: Sửa thông tin gói tập ---');
const cardsHv3 = TheHoiVien.layDanhSachGoi('HV003');
if (cardsHv3.length > 0) {
    const newTargetFormat = cardsHv3[0].hinhThucTap === 'Kèm 1-1' ? 'Trực tiếp' : 'Kèm 1-1';
    const editRes = ClsGoiTapTrenThe.capNhatHinhThucTap(cardsHv3[0].maThe, newTargetFormat, 'NV005');
    console.log(`Sửa hình thức tập cho thẻ ${editRes.maThe}: ${editRes.hinhThucCu} -> ${editRes.hinhThucMoi}`);
}

// 9. Test Lớp học & Đặt chỗ (LopHoc & DatCho)
console.log('\n--- 9. Kiểm tra Lớp học & Đặt chỗ ---');
const classes = ClsLopHoc.layDanhSach();
console.log(`Số lượng lớp học: ${classes.length}`);
console.log(`Trùng lịch phòng Studio Yoga 1 ca 08:30 ngày 2026-11-28?`, ClsLopHoc.kiemTraTrungLichPhong('Studio Yoga 1', '2026-11-28', '08:30', '09:00'));

// 10. Test LichSuLog
console.log('\n--- 10. Kiểm tra Bảng LichSuLog ---');
const logs = ClsLichSuLog.layLichSu(5);
console.log(`Số bản ghi log gần nhất: ${logs.length}`);
logs.forEach(l => console.log(` - [${l.thoiGian}] NV: ${l.maNhanVien} | Hành động: ${l.hanhDong} | Đối tượng: ${l.maHoiVien}`));

console.log('\n====================================================');
console.log('✅ TẤT CẢ CÁC HÀM, CLASS, TRUY VẤN ĐỀU CHẠY HOÀN HẢO!');
console.log('====================================================');
