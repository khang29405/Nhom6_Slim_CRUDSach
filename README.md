
## Hợp đồng API (cả nhóm phải tuân theo)

### Quy ước chung

- Dự án chạy tại `http://localhost/book-slim/public`. Trong HTML và JS luôn dùng **đường dẫn tuyệt đối**:
  - API: `/book-slim/public/api/...`
  - File tĩnh: `/book-slim/public/assets/css/style.css`, `/book-slim/public/assets/js/...`
  - Trang: `/book-slim/public/books`, `/book-slim/public/books/create`, `/book-slim/public/books/5`, `/book-slim/public/books/5/edit`
- Dữ liệu gửi lên và phản hồi đều là **JSON, UTF-8**. Thông báo lỗi viết bằng tiếng Việt.
- Lỗi không tìm thấy: mã 404, `{"error":"Không tìm thấy sách"}`.
- Lỗi dữ liệu: mã 422, `{"errors":{"ten_truong":"thông báo"}}`.

### Một cuốn sách

Các trường: `ma_dau_sach`, `nhan_de`, `tac_gia`, `nha_xuat_ban`, `mo_ta`, `hinh_anh`, `so_trang`, `gia_bia`, `so_luong`, `ma_loai`. Khi lấy danh sách hoặc chi tiết có thêm `ten_loai` (lấy bằng JOIN với bảng `loai_sach`).
Các trường tùy chọn (có thể để trống, lưu NULL): `nha_xuat_ban`, `mo_ta`, `hinh_anh`, `so_trang`. Bắt buộc: `nhan_de`, `tac_gia`, `gia_bia`, `ma_loai`; `so_luong` mặc định 0. Lưu ý `gia_bia` trả về dạng chuỗi (ví dụ `"45000.00"`), frontend dùng `Number(...)` khi cần tính toán hoặc định dạng.

### Các endpoint

| Phương thức | Đường dẫn | Thành công | Lỗi | Người làm |
|---|---|---|---|---|
| POST | `/api/books` | 201 `{"message":"...","id":5}` | 422 | Khang (đã xong) |
| PUT | `/api/books/{id}` | 200 `{"message":"..."}` | 404, 422 | Cang |
| DELETE | `/api/books/{id}` | 200 `{"message":"..."}` | 404 | Sơn |
| GET | `/api/books/{id}` | 200 `{"data":{...}}` | 404 | Cang |
| GET | `/api/books?q=từ khóa` | 200 `{"data":[{...},{...}]}` | | Minh Tân |
| GET | `/api/categories` | 200 `{"data":[{"ma_loai":"VANHO","ten_loai":"Văn học"}]}` | | Sơn |

- `q` tìm theo nhan đề, tác giả hoặc tên loại; không có `q` thì trả tất cả sách.
- `PUT` dùng lại hai hàm `normalize()` và `validate()` có sẵn trong `BookController` (gọi `normalize` trước rồi `validate`) và trả lỗi 422 cùng dạng với `POST`.
- Body của `POST` và `PUT` gồm các trường: `nhan_de`, `tac_gia`, `nha_xuat_ban`, `mo_ta`, `hinh_anh`, `so_trang`, `gia_bia`, `so_luong`, `ma_loai`.

### Hàm trong BookRepository (tên cố định)

| Hàm | Người viết |
|---|---|
| `create(array $d): int` | Khang (đã xong) |
| `getById(int $id): ?array`, `update(int $id, array $d): void` | Cang |
| `delete(int $id): bool`, `getCategories(): array` | Sơn |
| `getAll(): array`, `search(string $keyword): array` | Minh Tân |

### Frontend

- Mỗi trang HTML nạp theo thứ tự: `style.css`, rồi `api.js`, rồi file JS của trang đó (`list.js`, `detail.js` hoặc `form.js`).
- `api.js` (Thông) có các hàm, mỗi hàm trả về `{ status, ok, body }` (`body` là JSON đã đọc ra). Hàm **không ném lỗi** khi gặp 4xx, trang tự xử lý theo `status`:
  - `getBooks(q)`, `getBook(id)`, `getCategories()`
  - `createBook(data)`, `updateBook(id, data)`, `deleteBook(id)`
  - `renderHeader()`: vẽ thanh menu chung (liên kết "Danh sách sách" và "Thêm sách") vào thẻ `<div id="header"></div>`; trang nào cũng đặt thẻ này ở đầu `<body>` và gọi hàm này khi tải xong.
- Lấy `id` từ đường dẫn bằng `location.pathname`, ví dụ `/books/5` hoặc `/books/5/edit`. Trang `form.html` đang ở chế độ **thêm** nếu đường dẫn kết thúc bằng `/create`, và **sửa** nếu kết thúc bằng `/edit`.
- Trong form, thuộc tính `name` của mỗi ô nhập trùng với tên trường của sách (ví dụ `name="nhan_de"`), riêng ô chọn loại sách có `name="ma_loai"`.
- Chưa có API thật thì dùng dữ liệu giả đúng theo hợp đồng này để làm trước.