// form.js - Trang thêm và sửa sách (Duy Tân)
// form.js - Trang thêm và sửa sách (Duy Tân)
//
// Dùng chung cho hai trang:
//   /book-slim/public/books/create     -> chế độ THÊM  (gọi createBook)
//   /book-slim/public/books/{id}/edit  -> chế độ SỬA   (gọi getBook rồi updateBook)
// Chế độ được nhận biết từ location.pathname, theo đúng Hợp đồng API trong README.md.
//
// Sau khi lưu thành công: hiện thông báo 1 giây rồi chuyển trang
//   - thêm xong -> về trang danh sách
//   - sửa xong  -> về trang chi tiết cuốn sách vừa sửa
// Muốn đổi nơi chuyển đến thì sửa dòng nextUrl (có chú thích "NƠI CHUYỂN ĐẾN") bên dưới.
//
// Toàn bộ code nằm trong một hàm bọc để không trùng tên với api.js, list.js, detail.js.
(function () {
    const PAGE_BASE = '/book-slim/public';

    // Các trường của sách, trùng với thuộc tính name của ô nhập trong form.html
    const FIELDS = ['nhan_de', 'tac_gia', 'nha_xuat_ban', 'mo_ta', 'hinh_anh',
                    'so_trang', 'gia_bia', 'so_luong', 'ma_loai'];

    const form      = document.getElementById('book-form');
    const message   = document.getElementById('message');
    const pageTitle = document.getElementById('page-title');
    const btnSave   = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const select    = document.getElementById('ma_loai');

    // ===== Xác định chế độ thêm hay sửa từ đường dẫn =====
    const path      = location.pathname.replace(/\/+$/, '');
    const editMatch = path.match(/\/books\/(\d+)\/edit$/);
    const isEdit    = editMatch !== null;
    const isCreate  = /\/books\/create$/.test(path);
    const bookId    = isEdit ? editMatch[1] : null;

    // Địa chỉ trang danh sách, và trang chuyển đến sau khi lưu thành công / khi bấm Hủy
    const listUrl   = PAGE_BASE + '/books';
    const nextUrl   = isEdit ? PAGE_BASE + '/books/' + bookId : listUrl;   // NƠI CHUYỂN ĐẾN

    // ===== Thông báo =====

    // type: 'info' | 'success' | 'error'
    function showMessage(type, text) {
        message.className = 'alert alert-' + type;
        message.textContent = text;
    }

    function hideMessage() {
        message.className = 'alert hidden';
        message.textContent = '';
    }

    // ===== Lỗi theo từng ô =====

    function clearFieldErrors() {
        form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
        form.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
    }

    // errors: { ten_truong: 'thông báo' }. Trả về danh sách thông báo không gắn được vào ô nào.
    function showFieldErrors(errors) {
        const others = [];
        let firstInput = null;

        Object.keys(errors).forEach(function (name) {
            const input = FIELDS.indexOf(name) === -1 ? null : form.elements[name];
            if (!input) {
                others.push(String(errors[name]));
                return;
            }
            input.classList.add('input-error');
            const div = document.createElement('div');
            div.className = 'field-error';
            div.textContent = errors[name];
            input.insertAdjacentElement('afterend', div);
            if (!firstInput) firstInput = input;
        });

        if (firstInput) firstInput.focus();
        return others;
    }

    // ===== Đọc và điền dữ liệu form =====

    // Lấy giá trị các ô, cắt khoảng trắng hai đầu. Ô tùy chọn để trống thì gửi chuỗi rỗng,
    // BookController::normalize() sẽ đổi thành NULL.
    function readForm() {
        const data = {};
        FIELDS.forEach(function (name) {
            data[name] = form.elements[name].value.trim();
        });
        return data;
    }

    // Điền dữ liệu một cuốn sách vào form (chế độ sửa)
    function fillForm(book) {
        FIELDS.forEach(function (name) {
            let v = book[name];
            if (v === null || v === undefined) {
                v = '';
            } else if (name === 'gia_bia') {
                v = Number(v);          // API trả "45000.00" -> hiện 45000
            }
            form.elements[name].value = String(v);
        });
    }

    function fillCategories(list) {
        list.forEach(function (c) {
            const option = document.createElement('option');
            option.value = c.ma_loai;
            option.textContent = c.ten_loai;
            select.appendChild(option);
        });
    }

    function setBusy(busy) {
        btnSave.disabled = busy;
        btnSave.textContent = busy ? 'Đang lưu...' : 'Lưu';
    }

    // ===== Gửi form =====

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearFieldErrors();
        hideMessage();
        setBusy(true);

        const data = readForm();
        const res = isEdit ? await updateBook(bookId, data) : await createBook(data);

        if (res.ok) {
            // Giữ nút Lưu bị khóa để không bấm trùng trong lúc chờ chuyển trang
            btnSave.textContent = 'Đã lưu';
            showMessage('success', (res.body && res.body.message) || 'Lưu sách thành công');
            setTimeout(function () { location.href = nextUrl; }, 1000);
            return;
        }

        setBusy(false);

        if (res.status === 422 && res.body && res.body.errors) {
            const errors = res.body.errors;
            // Chưa chọn loại sách: thay thông báo của máy chủ bằng câu dễ hiểu hơn
            if (errors.ma_loai && data.ma_loai === '') {
                errors.ma_loai = 'Vui lòng chọn loại sách';
            }
            const others = showFieldErrors(errors);
            if (others.length) showMessage('error', others.join(' '));
            return;
        }

        // 404 (sách đã bị xóa), 500, mất kết nối...
        showMessage('error', (res.body && res.body.error) || 'Có lỗi xảy ra, vui lòng thử lại');
    });

    // ===== Khởi động trang =====

    async function init() {
        renderHeader();

        if (!isCreate && !isEdit) {
            showMessage('error', 'Không xác định được là thêm hay sửa sách. ' +
                'Hãy mở trang qua đường dẫn /books/create hoặc /books/{id}/edit.');
            return;
        }

        pageTitle.textContent = isEdit ? 'Sửa sách' : 'Thêm sách';
        document.title = pageTitle.textContent;
        btnCancel.href = nextUrl;
        showMessage('info', 'Đang tải dữ liệu...');

        // Lấy danh sách loại sách (và thông tin cuốn sách khi sửa) cùng lúc
        const requests = [getCategories()];
        if (isEdit) requests.push(getBook(bookId));
        const results = await Promise.all(requests);

        const catRes = results[0];
        if (!catRes.ok) {
            showMessage('error', (catRes.body && catRes.body.error) || 'Không tải được danh sách loại sách');
            return;
        }
        fillCategories(Array.isArray(catRes.body.data) ? catRes.body.data : []);

        if (isEdit) {
            const bookRes = results[1];
            if (!bookRes.ok) {
                // Thường là 404: {"error":"Không tìm thấy sách"}
                showMessage('error', (bookRes.body && bookRes.body.error) || 'Không tải được thông tin sách');
                return;
            }
            fillForm(bookRes.body.data);   // gọi sau fillCategories để chọn đúng loại sách
        }

        hideMessage();
        form.classList.remove('hidden');
    }

    init();
})();