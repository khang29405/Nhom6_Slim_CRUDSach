// api.js - Các hàm gọi API dùng chung (Thông)
// api.js - Các hàm gọi API dùng chung (Thông)
//
// Mỗi hàm gọi API trả về một Promise cho { status, ok, body }:
//   status: mã HTTP (200, 201, 404, 422...). Không kết nối được máy chủ thì status = 0.
//   ok:     true khi status từ 200 đến 299
//   body:   JSON đã đọc ra, ví dụ { data: [...] }, { error: '...' }, { errors: { nhan_de: '...' } }
// Các hàm KHÔNG ném lỗi khi gặp 4xx, trang tự xử lý theo status.
//
// Dữ liệu giả: khi một API của người khác chưa làm xong (server trả 501 "Chưa làm")
// thì hàm tự trả dữ liệu giả đúng theo "Hợp đồng API" trong README.md.
// API thật xong thì không còn 501 nữa, dữ liệu giả tự không chạy.
// Khi cả nhóm đã xong hết, đổi USE_MOCK bên dưới thành false (hoặc xóa phần "DỮ LIỆU GIẢ").
//
// Toàn bộ code nằm trong một hàm bọc, chỉ đưa ra ngoài đúng 7 hàm của hợp đồng
// (getBooks, getBook, getCategories, createBook, updateBook, deleteBook, renderHeader)
// để không trùng tên với biến trong list.js, detail.js, form.js.
(function () {
    const API_BASE  = '/book-slim/public/api';
    const PAGE_BASE = '/book-slim/public';
    const USE_MOCK  = true;

    // ===== Gọi API =====

    // method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: ví dụ '/books/5'
    // data: đối tượng gửi lên (chỉ POST, PUT); mock: hàm trả { status, body } khi API chưa làm
    async function request(method, path, data, mock) {
        const options = { method, headers: { Accept: 'application/json' } };
        if (data !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }

        let res;
        try {
            res = await fetch(API_BASE + path, options);
        } catch (e) {
            return { status: 0, ok: false, body: { error: 'Không kết nối được máy chủ' } };
        }

        if (USE_MOCK && res.status === 501 && mock) {
            const m = mock();
            return { status: m.status, ok: m.status >= 200 && m.status < 300, body: m.body };
        }

        let body;
        try {
            body = await res.json();
        } catch (e) {
            body = { error: 'Phản hồi từ máy chủ không hợp lệ' };
        }
        return { status: res.status, ok: res.ok, body };
    }

    // GET /api/books (?q=)  -> { data: [ ... ] }
    function getBooks(q) {
        const keyword = String(q ?? '').trim();
        const query = keyword === '' ? '' : '?q=' + encodeURIComponent(keyword);
        return request('GET', '/books' + query, undefined, () => mockGetBooks(keyword));
    }

    // GET /api/books/{id}  -> { data: {...} } hoặc 404
    function getBook(id) {
        return request('GET', '/books/' + encodeURIComponent(id), undefined, () => mockGetBook(id));
    }

    // GET /api/categories  -> { data: [ { ma_loai, ten_loai } ] }
    function getCategories() {
        return request('GET', '/categories', undefined, () => mockGetCategories());
    }

    // POST /api/books  -> 201 { message, id } hoặc 422 { errors }
    function createBook(data) {
        return request('POST', '/books', data, () => mockCreateBook(data));
    }

    // PUT /api/books/{id}  -> 200 { message } hoặc 404, 422
    function updateBook(id, data) {
        return request('PUT', '/books/' + encodeURIComponent(id), data, () => mockUpdateBook(id, data));
    }

    // DELETE /api/books/{id}  -> 200 { message } hoặc 404
    function deleteBook(id) {
        return request('DELETE', '/books/' + encodeURIComponent(id), undefined, () => mockDeleteBook(id));
    }

    // ===== Thanh menu chung =====

    // Vẽ thanh menu vào <div id="header"></div>. Trang nào cũng gọi hàm này khi tải xong.
    function renderHeader() {
        const el = document.getElementById('header');
        if (!el) return;

        const path = location.pathname.replace(/\/+$/, '');
        const onCreate = path === PAGE_BASE + '/books/create';

        el.innerHTML =
            '<header class="site-header">' +
                '<div class="container header-inner">' +
                    '<a class="brand" href="' + PAGE_BASE + '/books">Quản lý sách</a>' +
                    '<nav class="nav">' +
                        '<a class="nav-link' + (onCreate ? '' : ' active') + '" href="' + PAGE_BASE + '/books"' +
                            (onCreate ? '' : ' aria-current="page"') + '>Danh sách sách</a>' +
                        '<a class="nav-link' + (onCreate ? ' active' : '') + '" href="' + PAGE_BASE + '/books/create"' +
                            (onCreate ? ' aria-current="page"' : '') + '>Thêm sách</a>' +
                    '</nav>' +
                '</div>' +
            '</header>';
    }

    // ===== DỮ LIỆU GIẢ (đúng theo Hợp đồng API, chỉ dùng khi server trả 501) =====

    const MOCK_CATEGORIES = [
        { ma_loai: 'KINHT', ten_loai: 'Kinh tế' },
        { ma_loai: 'THIEU', ten_loai: 'Thiếu nhi' },
        { ma_loai: 'VANHO', ten_loai: 'Văn học' },
    ];

    // gia_bia là chuỗi như API thật; sách số 5 để trống các trường tùy chọn
    const MOCK_BOOKS = [
        { ma_dau_sach: 1, nhan_de: 'Dế Mèn phiêu lưu ký', tac_gia: 'Tô Hoài', nha_xuat_ban: 'NXB Kim Đồng',
          mo_ta: 'Hành trình phiêu lưu của chú dế Mèn qua thế giới loài vật.', hinh_anh: null,
          so_trang: 144, gia_bia: '45000.00', so_luong: 12, ma_loai: 'VANHO' },
        { ma_dau_sach: 2, nhan_de: 'Nhà giả kim', tac_gia: 'Paulo Coelho', nha_xuat_ban: 'NXB Hội Nhà Văn',
          mo_ta: 'Câu chuyện về chàng chăn cừu đi tìm kho báu của đời mình.', hinh_anh: null,
          so_trang: 228, gia_bia: '79000.00', so_luong: 8, ma_loai: 'VANHO' },
        { ma_dau_sach: 3, nhan_de: 'Đắc nhân tâm', tac_gia: 'Dale Carnegie', nha_xuat_ban: 'NXB Tổng hợp TP.HCM',
          mo_ta: 'Những nguyên tắc ứng xử và giao tiếp với mọi người.', hinh_anh: null,
          so_trang: 320, gia_bia: '86000.00', so_luong: 25, ma_loai: 'KINHT' },
        { ma_dau_sach: 4, nhan_de: 'Doraemon tập 1', tac_gia: 'Fujiko F. Fujio', nha_xuat_ban: 'NXB Kim Đồng',
          mo_ta: 'Chú mèo máy đến từ tương lai giúp đỡ cậu bé Nobita.', hinh_anh: null,
          so_trang: 192, gia_bia: '22000.00', so_luong: 0, ma_loai: 'THIEU' },
        { ma_dau_sach: 5, nhan_de: 'Sách mẫu để trống trường tùy chọn', tac_gia: 'Nguyễn Văn A', nha_xuat_ban: null,
          mo_ta: null, hinh_anh: null,
          so_trang: null, gia_bia: '100000.00', so_luong: 3, ma_loai: 'KINHT' },
    ];

    function tenLoai(maLoai) {
        const c = MOCK_CATEGORIES.find(function (x) { return x.ma_loai === maLoai; });
        return c ? c.ten_loai : '';
    }

    // Thêm ten_loai (giống JOIN) và trả bản sao để trang sửa thoải mái không ảnh hưởng dữ liệu gốc
    function withLoai(b) {
        return Object.assign({}, b, { ten_loai: tenLoai(b.ma_loai) });
    }

    function findMockBook(id) {
        return MOCK_BOOKS.find(function (b) { return b.ma_dau_sach === Number(id); });
    }

    function mockNotFound() {
        return { status: 404, body: { error: 'Không tìm thấy sách' } };
    }

    // Kiểm tra các trường bắt buộc, cùng dạng thông báo với BookController::validate()
    function mockValidate(d) {
        d = d || {};
        const e = {};
        if (String(d.nhan_de ?? '').trim() === '') e.nhan_de = 'Nhan đề không được để trống';
        if (String(d.tac_gia ?? '').trim() === '') e.tac_gia = 'Tác giả không được để trống';
        const gia = String(d.gia_bia ?? '').trim();
        if (gia === '' || isNaN(Number(gia)) || Number(gia) < 0) e.gia_bia = 'Giá bìa phải là số không âm';
        if (String(d.ma_loai ?? '').trim().length !== 5) e.ma_loai = 'Mã loại gồm đúng 5 ký tự';
        return e;
    }

    function mockGetBooks(q) {
        const k = q.toLowerCase();
        const list = MOCK_BOOKS.map(withLoai).filter(function (b) {
            return k === '' ||
                b.nhan_de.toLowerCase().includes(k) ||
                b.tac_gia.toLowerCase().includes(k) ||
                b.ten_loai.toLowerCase().includes(k);
        });
        list.sort(function (a, b) { return b.ma_dau_sach - a.ma_dau_sach; });   // mới nhất trước
        return { status: 200, body: { data: list } };
    }

    function mockGetBook(id) {
        const b = findMockBook(id);
        return b ? { status: 200, body: { data: withLoai(b) } } : mockNotFound();
    }

    function mockGetCategories() {
        return { status: 200, body: { data: MOCK_CATEGORIES.map(function (c) { return Object.assign({}, c); }) } };
    }

    function mockCreateBook(data) {
        const errors = mockValidate(data);
        if (Object.keys(errors).length) return { status: 422, body: { errors } };
        return { status: 201, body: { message: 'Thêm sách thành công', id: MOCK_BOOKS.length + 1 } };
    }

    function mockUpdateBook(id, data) {
        if (!findMockBook(id)) return mockNotFound();
        const errors = mockValidate(data);
        if (Object.keys(errors).length) return { status: 422, body: { errors } };
        return { status: 200, body: { message: 'Cập nhật sách thành công' } };
    }

    function mockDeleteBook(id) {
        if (!findMockBook(id)) return mockNotFound();
        return { status: 200, body: { message: 'Xóa sách thành công' } };
    }

    // ===== Đưa 7 hàm của hợp đồng ra dùng chung =====
    window.getBooks      = getBooks;
    window.getBook       = getBook;
    window.getCategories = getCategories;
    window.createBook    = createBook;
    window.updateBook    = updateBook;
    window.deleteBook    = deleteBook;
    window.renderHeader  = renderHeader;
})();