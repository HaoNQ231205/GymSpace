const BASE_URL = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Đã có lỗi xảy ra!');
    }
    return data;
}

export const api = {
    // 0. Xác thực & Đăng nhập
    login: (tenDangNhap, matKhau) => request('/auth/login', { method: 'POST', body: JSON.stringify({ tenDangNhap, matKhau }) }),

    // 1. Đặt lịch tư vấn
    getSlots: (ngayHen) => request(`/tu-van/khung-gio?ngayHen=${encodeURIComponent(ngayHen)}`),
    bookConsultation: (body) => request('/tu-van/dat-lich', { method: 'POST', body: JSON.stringify(body) }),
    getConsultations: () => request('/tu-van/danh-sach'),
    cancelConsultation: (maLichHen) => request(`/tu-van/huy-lich/${maLichHen}`, { method: 'PUT' }),

    // 2. Bán gói tập & Hóa đơn
    getPackages: () => request('/goi-tap'),
    processSale: (body) => request('/ban-goi/thanh-toan', { method: 'POST', body: JSON.stringify(body) }),
    getInvoices: () => request('/hoa-don'),
    getInvoiceDetail: (maHoaDon) => request(`/hoa-don/${maHoaDon}`),

    // 3. Hội viên & Khách hàng
    checkUsername: (tenDangNhap) => request(`/hoi-vien/check-username?tenDangNhap=${encodeURIComponent(tenDangNhap)}`),
    createMember: (body) => request('/hoi-vien/tao-tai-khoan', { method: 'POST', body: JSON.stringify(body) }),
    searchMembers: (tuKhoa) => request(`/hoi-vien/tim-kiem?tuKhoa=${encodeURIComponent(tuKhoa || '')}`),
    getMemberDetail: (maHoiVien) => request(`/hoi-vien/${maHoiVien}`),
    updateMember: (maHoiVien, body) => request(`/hoi-vien/${maHoiVien}`, { method: 'PUT', body: JSON.stringify(body) }),
    searchCustomers: (tuKhoa) => request(`/khach-hang/tim-kiem?tuKhoa=${encodeURIComponent(tuKhoa || '')}`),
    updateCustomer: (maKhachHang, body) => request(`/khach-hang/${maKhachHang}`, { method: 'PUT', body: JSON.stringify(body) }),

    // 4. Gia hạn & Kết thúc & Sửa gói
    getMemberCards: (maHoiVien) => request(`/gia-han/the-goi/${maHoiVien}`),
    getMemberBookings: (maHoiVien) => request(`/hoi-vien/${maHoiVien}/dat-cho`),
    getMemberInvoices: (maHoiVien) => request(`/hoi-vien/${maHoiVien}/hoa-don`),
    renewPackage: (body) => request('/gia-han/thuc-hien', { method: 'POST', body: JSON.stringify(body) }),
    terminatePackage: (body) => request('/ket-thuc-goi/thuc-hien', { method: 'POST', body: JSON.stringify(body) }),
    updatePackageFormat: (body) => request('/sua-goi-tap', { method: 'PUT', body: JSON.stringify(body) }),

    // 5. Lớp học & Đặt chỗ
    getClasses: () => request('/lop-hoc'),
    updateClass: (maLop, body) => request(`/lop-hoc/${maLop}`, { method: 'PUT', body: JSON.stringify(body) }),
    bookClass: (body) => request('/dat-cho', { method: 'POST', body: JSON.stringify(body) }),
    getClassBookings: (maLop) => request(`/dat-cho/lop/${maLop}`),
    cancelBooking: (maDatCho) => request(`/dat-cho/huy/${maDatCho}`, { method: 'PUT' }),

    // 6. Hoạt động & Dashboard
    getDashboardStats: () => request('/dashboard/stats'),
    getEmployees: () => request('/nhan-vien'),
    runRawQuery: (sql) => request('/db/query', { method: 'POST', body: JSON.stringify({ sql }) })
};
