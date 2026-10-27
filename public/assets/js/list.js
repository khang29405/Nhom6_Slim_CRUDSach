// list.js - Trang danh sách và tìm kiếm (Thiện)
//
// Trang: /book-slim/public/books  (có thể kèm ?q=từ khóa)
// Gọi getBooks(q) trong api.js (GET /api/books?q=...), theo đúng Hợp đồng API trong API.md:
//   thành công: { data: [ { ma_dau_sach, nhan_de, tac_gia, ten_loai, gia_bia, so_luong, ... } ] }
//   không có q thì API trả tất cả sách; có q thì tìm theo nhan đề, tác giả hoặc tên loại.
//
// Tìm kiếm: gõ từ khóa rồi bấm "Tìm kiếm" hoặc nhấn Enter. Từ khóa được ghi lên thanh địa chỉ
// (?q=...) để tải lại trang hoặc bấm nút Quay lại vẫn giữ kết quả tìm kiếm.
//
// Phân trang: API trả cả danh sách một lần, trang này tự chia thành từng trang PAGE_SIZE cuốn
// (không cần sửa API). Số trang cũng được ghi lên thanh địa chỉ (?page=2).
//
// Toàn bộ code nằm trong một hàm bọc để không trùng tên với api.js, detail.js, form.js.
(function () {
    const PAGE_BASE = '/book-slim/public';
    const PAGE_SIZE = 10;   // số cuốn sách trên mỗi trang

    const form       = document.getElementById('search-form');
    const input      = document.getElementById('search-input');
    const btnClear   = document.getElementById('btn-clear');
    const message    = document.getElementById('message');
    const resultInfo = document.getElementById('result-info');
    const tableWrap  = document.getElementById('table-wrap');
    const tbody      = document.getElementById('book-list');
    const emptyBox   = document.getElementById('empty');
    const pagination = document.getElementById('pagination');
    const btnPrev    = document.getElementById('btn-prev');
    const btnNext    = document.getElementById('btn-next');
    const pageInfo   = document.getElementById('page-info');

    // Mỗi lần tải danh sách tăng số này lên 1. Nếu câu trả lời về muộn (đã có lần tìm mới hơn)
    // thì bỏ qua, tránh kết quả cũ ghi đè kết quả mới.
    let latestRequest = 0;

    // Danh sách đang xem (toàn bộ kết quả của lần tải gần nhất) và trang hiện tại
    let allBooks = [];
    let currentKeyword = '';
    let currentPage = 1;

    // ===== Thông báo =====

    // type: 'info' | 'error'
    function showMessage(type, text) {
        message.className = 'alert alert-' + type;
        message.textContent = text;
    }

    function hideMessage() {
        message.className = 'alert hidden';
        message.textContent = '';
    }

    // ===== Vẽ danh sách =====

    // "45000.00" -> "45.000 ₫" (dùng khoảng trắng không ngắt dòng để số tiền không bị tách hai dòng)
    function formatPrice(value) {
        const n = Number(value);
        if (isNaN(n)) return '';
        return n.toLocaleString('vi-VN') + '\u00a0₫';
    }

    function createCell(text, className) {
        const td = document.createElement('td');
        if (className) td.className = className;
        td.textContent = text === null || text === undefined ? '' : String(text);
        return td;
    }

    // Ô trống có chữ, dùng khi sách chưa có ảnh hoặc ảnh không tải được
    function createCoverPlaceholder() {
        const div = document.createElement('div');
        div.className = 'book-cover-empty';
        div.textContent = 'Chưa có ảnh';
        return div;
    }

    // Ảnh bìa lấy từ hinh_anh (đường dẫn hoặc địa chỉ ảnh); để trống hoặc ảnh lỗi thì hiện ô trống
    function createCover(book) {
        const url = book.hinh_anh === null || book.hinh_anh === undefined ? '' : String(book.hinh_anh).trim();
        if (url === '') return createCoverPlaceholder();

        const img = document.createElement('img');
        img.className = 'book-cover';
        img.loading = 'lazy';
        img.alt = 'Bìa sách ' + book.nhan_de;
        img.src = url;
        img.addEventListener('error', function () {
            img.replaceWith(createCoverPlaceholder());
        });
        return img;
    }

    // ===== Xóa sách =====

    // Bấm nút Xóa trên một dòng: hỏi xác nhận bằng modal, đồng ý mới gọi deleteBook, xong báo kết quả bằng modal
    async function confirmDelete(book) {
        const answer = await Modal.confirm({
            title: 'Xóa sách này?',
            message: 'Bạn sắp xóa cuốn "' + book.nhan_de + '".\nSách đã xóa không thể khôi phục.',
            confirmText: 'Xóa sách',
            cancelText: 'Hủy',
            danger: true,
            onConfirm: function () { return deleteBook(book.ma_dau_sach); }
        });
        if (!answer.confirmed) return;

        const res = answer.result;
        if (res.ok) {
            loadBooks(currentKeyword, currentPage);   // tải lại danh sách, giữ nguyên từ khóa và trang đang xem
            await Modal.notice({
                type: 'success',
                title: 'Đã xóa sách',
                message: (res.body && res.body.message) || 'Xóa sách thành công',
                autoClose: 2000
            });
            return;
        }

        if (res.status === 404) {
            loadBooks(currentKeyword, currentPage);   // sách đã bị xóa từ trước: làm mới danh sách
        }
        await Modal.notice({
            type: 'error',
            title: 'Không xóa được sách',
            message: (res.body && res.body.error) || 'Có lỗi xảy ra, vui lòng thử lại'
        });
    }

    function createRow(book) {
        const tr = document.createElement('tr');

        // Cả dòng bấm được để sang trang chi tiết: /books/{id}
        const detailUrl = PAGE_BASE + '/books/' + encodeURIComponent(book.ma_dau_sach);
        tr.className = 'book-row';
        tr.tabIndex = 0;   // cho phép dùng phím Tab để chọn dòng, nhấn Enter để mở
        tr.addEventListener('click', function () {
            location.href = detailUrl;
        });
        tr.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') location.href = detailUrl;
        });

        const tdCover = document.createElement('td');
        tdCover.appendChild(createCover(book));
        tr.appendChild(tdCover);

        tr.appendChild(createCell(book.nhan_de));
        tr.appendChild(createCell(book.tac_gia));
        tr.appendChild(createCell(book.ten_loai));
        tr.appendChild(createCell(formatPrice(book.gia_bia), 'text-right'));

        // Số lượng bằng 0 thì hiện nhãn "Hết hàng"
        const tdQty = document.createElement('td');
        tdQty.className = 'text-center';
        if (Number(book.so_luong) === 0) {
            const badge = document.createElement('span');
            badge.className = 'badge badge-warning';
            badge.textContent = 'Hết hàng';
            tdQty.appendChild(badge);
        } else {
            tdQty.textContent = String(book.so_luong);
        }
        tr.appendChild(tdQty);

                // Nút Xóa nằm cạnh cột số lượng. Chặn sự kiện nổi lên dòng để bấm Xóa không mở trang chi tiết.
        const tdAction = document.createElement('td');
        tdAction.className = 'text-center';
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btn btn-danger';
        btnDelete.textContent = 'Xóa';
        btnDelete.setAttribute('aria-label', 'Xóa sách ' + book.nhan_de);
        btnDelete.addEventListener('click', function (e) {
            e.stopPropagation();
            confirmDelete(book);
        });
        btnDelete.addEventListener('keydown', function (e) {
            e.stopPropagation();   // nhấn Enter trên nút Xóa không được mở trang chi tiết
        });
        tdAction.appendChild(btnDelete);
        tr.appendChild(tdAction);

        return tr;
    }

    function totalPages() {
        return Math.max(1, Math.ceil(allBooks.length / PAGE_SIZE));
    }

    // Vẽ các dòng của trang hiện tại và cập nhật thanh phân trang
    function renderPage() {
        tbody.replaceChildren();
        const start = (currentPage - 1) * PAGE_SIZE;
        allBooks.slice(start, start + PAGE_SIZE).forEach(function (book) {
            tbody.appendChild(createRow(book));
        });

        const total = totalPages();
        pageInfo.textContent = 'Trang ' + currentPage + ' / ' + total;
        btnPrev.disabled = currentPage <= 1;
        btnNext.disabled = currentPage >= total;
        pagination.classList.toggle('hidden', total <= 1);
    }

    // keyword: từ khóa đã dùng để tìm ('' nếu đang xem tất cả); page: trang muốn xem
    function renderBooks(books, keyword, page) {
        allBooks = books;
        currentKeyword = keyword;
        currentPage = 1;
        tbody.replaceChildren();

        if (books.length === 0) {
            tableWrap.classList.add('hidden');
            resultInfo.classList.add('hidden');
            pagination.classList.add('hidden');
            emptyBox.textContent = keyword === ''
                ? 'Chưa có cuốn sách nào.'
                : 'Không tìm thấy cuốn sách nào phù hợp với "' + keyword + '".';
            emptyBox.classList.remove('hidden');
            return;
        }

        // Số trang nằm ngoài phạm vi (ví dụ ?page=99) thì đưa về trang gần nhất
        currentPage = Math.min(Math.max(page, 1), totalPages());
        renderPage();

        resultInfo.textContent = keyword === ''
            ? 'Tổng cộng ' + books.length + ' cuốn sách.'
            : 'Tìm thấy ' + books.length + ' cuốn sách cho "' + keyword + '".';
        resultInfo.classList.remove('hidden');
        emptyBox.classList.add('hidden');
        tableWrap.classList.remove('hidden');
    }

    function goToPage(page) {
        currentPage = page;
        renderPage();
        updateUrl(currentKeyword, currentPage);
        window.scrollTo(0, 0);
    }

    // ===== Tải danh sách =====

    async function loadBooks(keyword, page) {
        const requestId = ++latestRequest;
        showMessage('info', 'Đang tải danh sách sách...');

        const res = await getBooks(keyword);
        if (requestId !== latestRequest) return;   // đã có lần tải mới hơn

        if (!res.ok) {
            // Mất kết nối, lỗi máy chủ...: ẩn danh sách cũ, chỉ hiện thông báo lỗi
            tableWrap.classList.add('hidden');
            resultInfo.classList.add('hidden');
            emptyBox.classList.add('hidden');
            pagination.classList.add('hidden');
            showMessage('error', (res.body && res.body.error) || 'Không tải được danh sách sách');
            return;
        }

        hideMessage();
        const books = res.body && Array.isArray(res.body.data) ? res.body.data : [];
        renderBooks(books, keyword, page);
        updateUrl(keyword, currentPage);
    }

    // ===== Tìm kiếm =====

    // Ghi từ khóa và số trang lên thanh địa chỉ mà không tải lại trang và không thêm mục vào lịch sử
    function updateUrl(keyword, page) {
        const params = new URLSearchParams();
        if (keyword !== '') params.set('q', keyword);
        if (page > 1) params.set('page', String(page));
        const query = params.toString();
        history.replaceState(null, '', location.pathname + (query === '' ? '' : '?' + query));
    }

    function search(keyword) {
        updateUrl(keyword, 1);
        btnClear.classList.toggle('hidden', keyword === '');
        return loadBooks(keyword, 1);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        search(input.value.trim());
    });

    btnClear.addEventListener('click', function () {
        input.value = '';
        search('');
        input.focus();
    });

    btnPrev.addEventListener('click', function () {
        if (currentPage > 1) goToPage(currentPage - 1);
    });

    btnNext.addEventListener('click', function () {
        if (currentPage < totalPages()) goToPage(currentPage + 1);
    });

    // ===== Khởi động trang =====

    function init() {
        renderHeader();

        // Mở trang kèm ?q=...&page=... (tải lại trang, bấm Quay lại) thì tìm luôn và mở đúng trang đó
        const params = new URLSearchParams(location.search);
        const keyword = (params.get('q') || '').trim();
        const page = parseInt(params.get('page'), 10) || 1;
        input.value = keyword;
        btnClear.classList.toggle('hidden', keyword === '');
        loadBooks(keyword, page);
    }

    init();
})();