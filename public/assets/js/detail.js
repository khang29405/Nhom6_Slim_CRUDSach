// detail.js - Trang chi tiết một cuốn sách
//
// Trang: /book-slim/public/books/{id}
// Gọi getBook(id) trong api.js, theo đúng Hợp đồng API trong API.md:
//   GET /api/books/{id}  -> 200 { data: { ma_dau_sach, nhan_de, tac_gia, ten_loai, gia_bia, ... } } hoặc 404 { error }
//
// Trong lúc tải hiện khung chờ; không tìm thấy sách hoặc lỗi thì hiện khối thông báo lỗi kèm nút về danh sách.
// (Nút xóa sách nằm ở trang danh sách, xem list.js.)
//
// Toàn bộ code nằm trong một hàm bọc để không trùng tên với api.js, list.js, form.js.
(function () {
    const PAGE_BASE = '/book-slim/public';

    const loadingBox   = document.getElementById('detail-loading');
    const errorBox     = document.getElementById('detail-error');
    const errorTitle   = document.getElementById('error-title');
    const errorMessage = document.getElementById('error-message');
    const detail       = document.getElementById('book-detail');
    const crumbTitle   = document.getElementById('crumb-title');
    const coverBox     = document.getElementById('detail-cover');
    const categoryEl   = document.getElementById('book-category');
    const titleEl      = document.getElementById('book-title');
    const authorEl     = document.getElementById('book-author');
    const priceEl      = document.getElementById('book-price');
    const statusEl     = document.getElementById('book-status');
    const publisherEl  = document.getElementById('book-publisher');
    const pagesEl      = document.getElementById('book-pages');
    const stockEl      = document.getElementById('book-stock');
    const idEl         = document.getElementById('book-id');
    const descEl       = document.getElementById('book-desc');
    const btnEdit      = document.getElementById('btn-edit');

    // ===== Lấy id từ đường dẫn: /books/5 -> "5" =====
    const path   = location.pathname.replace(/\/+$/, '');
    const match  = path.match(/\/books\/(\d+)$/);
    const bookId = match ? match[1] : null;

    // ===== Các trạng thái của trang =====

    function showError(title, text) {
        loadingBox.classList.add('hidden');
        detail.classList.add('hidden');
        errorTitle.textContent = title;
        errorMessage.textContent = text;
        errorBox.classList.remove('hidden');
    }

    // ===== Vẽ trang =====

    // "45000.00" -> "45.000 ₫" (dùng khoảng trắng không ngắt dòng để số tiền không bị tách hai dòng)
    function formatPrice(value) {
        const n = Number(value);
        if (isNaN(n)) return '';
        return n.toLocaleString('vi-VN') + '\u00a0₫';
    }

    // Ghi chữ vào một phần tử; giá trị trống (null, "") thì hiện chữ nhạt emptyText
    function setText(el, value, emptyText) {
        const text = value === null || value === undefined ? '' : String(value).trim();
        if (text === '') {
            el.textContent = emptyText || 'Chưa có thông tin';
            el.classList.add('is-empty');
        } else {
            el.textContent = text;
            el.classList.remove('is-empty');
        }
    }

    // Ô trống có biểu tượng cuốn sách, dùng khi sách chưa có ảnh hoặc ảnh không tải được
    function createCoverPlaceholder() {
        const div = document.createElement('div');
        div.className = 'detail-cover-empty';
        div.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
            '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
        const label = document.createElement('span');
        label.textContent = 'Chưa có ảnh bìa';
        div.appendChild(label);
        return div;
    }

    // Ảnh bìa lấy từ hinh_anh (đường dẫn hoặc địa chỉ ảnh); để trống hoặc ảnh lỗi thì hiện ô trống
    function createCover(book) {
        const url = book.hinh_anh === null || book.hinh_anh === undefined ? '' : String(book.hinh_anh).trim();
        if (url === '') return createCoverPlaceholder();

        const img = document.createElement('img');
        img.alt = 'Bìa sách ' + book.nhan_de;
        img.src = url;
        img.addEventListener('error', function () {
            img.replaceWith(createCoverPlaceholder());
        });
        return img;
    }

    function renderBook(book) {
        document.title = book.nhan_de + ' - Chi tiết sách';
        crumbTitle.textContent = book.nhan_de;

        coverBox.replaceChildren(createCover(book));

        setText(categoryEl, book.ten_loai || book.ma_loai, 'Chưa phân loại');
        titleEl.textContent = book.nhan_de;
        setText(authorEl, book.tac_gia);
        setText(priceEl, formatPrice(book.gia_bia));

        // Số lượng bằng 0 thì ghi "Hết hàng"
        const soldOut = Number(book.so_luong) === 0;
        statusEl.textContent = soldOut ? 'Hết hàng' : 'Còn hàng';
        statusEl.className = 'detail-status ' + (soldOut ? 'out-of-stock' : 'in-stock');

        setText(publisherEl, book.nha_xuat_ban);
        setText(pagesEl, book.so_trang === null || book.so_trang === undefined ? '' : book.so_trang + ' trang');
        stockEl.textContent = soldOut ? '0 cuốn' : book.so_luong + ' cuốn';
        idEl.textContent = '#' + book.ma_dau_sach;
        setText(descEl, book.mo_ta, 'Chưa có phần giới thiệu cho cuốn sách này.');

        btnEdit.href = PAGE_BASE + '/books/' + encodeURIComponent(book.ma_dau_sach) + '/edit';

        loadingBox.classList.add('hidden');
        errorBox.classList.add('hidden');
        detail.classList.remove('hidden');
    }

    // ===== Khởi động trang =====

    async function init() {
        renderHeader();

        if (bookId === null) {
            showError('Đường dẫn không hợp lệ', 'Hãy mở trang qua /books/{id}, ví dụ /books/5.');
            return;
        }

        const res = await getBook(bookId);
        if (!res.ok || !res.body || !res.body.data) {
            // Thường là 404: {"error":"Không tìm thấy sách"}
            const notFound = res.status === 404;
            showError(
                notFound ? 'Không tìm thấy sách' : 'Không tải được thông tin sách',
                notFound
                    ? 'Cuốn sách này không tồn tại hoặc đã bị xóa.'
                    : (res.body && res.body.error) || 'Có lỗi xảy ra, vui lòng thử lại.'
            );
            return;
        }

        renderBook(res.body.data);
    }

    init();
})();