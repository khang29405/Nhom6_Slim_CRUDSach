# Hợp đồng API – Book Slim

Tài liệu này là "hợp đồng" chung giữa backend (Slim, PHP) và frontend (HTML, JS thuần). Cả nhóm phải tuân theo khi thêm hoặc sửa code. Phần giới thiệu dự án và cách chạy xem ở [README.md](README.md).

## 1. Quy ước chung

- Dự án chạy tại `http://localhost/book-slim/public`. Trong HTML và JS luôn dùng **đường dẫn tuyệt đối**:
  - API: `/book-slim/public/api/...`
  - File tĩnh: `/book-slim/public/assets/css/style.css`, `/book-slim/public/assets/js/...`
  - Trang: `/book-slim/public/books`, `/book-slim/public/books/create`, `/book-slim/public/books/5`, `/book-slim/public/books/5/edit`
- Dữ liệu gửi lên và phản hồi đều là **JSON, UTF-8** (`Content-Type: application/json; charset=utf-8`). Thông báo viết bằng tiếng Việt.
- Khi gửi dữ liệu (`POST`, `PUT`) phải có header `Content-Type: application/json` để middleware `addBodyParsingMiddleware()` của Slim đọc được body.

### Định dạng phản hồi

| Trường hợp | Mã | Body |
|---|---|---|
| Lấy dữ liệu thành công | 200 | `{"data": ...}` |
| Thêm thành công | 201 | `{"message":"Thêm sách thành công","id":5}` |
| Sửa / xóa thành công | 200 | `{"message":"..."}` |
| Không tìm thấy sách | 404 | `{"error":"Không tìm thấy sách"}` |
| Dữ liệu không hợp lệ | 422 | `{"errors":{"ten_truong":"thông báo"}}` |
| Không xóa được vì sách đang nằm trong giỏ hàng | 409 | `{"error":"Không thể xóa sách đã có trong giỏ hàng"}` |
| Sai đường dẫn API | 404 | `{"error":"Không tìm thấy"}` |
| Sai phương thức | 405 | `{"error":"Phương thức không được hỗ trợ"}` |
| Lỗi máy chủ | 500 | `{"error":"..."}` |

Ba dòng cuối do middleware `App\Middleware\ErrorHandler` trả về cho mọi đường dẫn có `/api/`.

## 2. Một cuốn sách

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `ma_dau_sach` | số nguyên | (tự tăng) | Khóa chính, chỉ có trong phản hồi |
| `nhan_de` | chuỗi | Có | Tối đa 255 ký tự |
| `tac_gia` | chuỗi | Có | Tối đa 150 ký tự |
| `nha_xuat_ban` | chuỗi / `null` | Không | Tối đa 150 ký tự |
| `mo_ta` | chuỗi / `null` | Không | |
| `hinh_anh` | chuỗi / `null` | Không | Đường dẫn hoặc URL ảnh, tối đa 255 ký tự |
| `so_trang` | số nguyên / `null` | Không | Từ 1 trở lên |
| `gia_bia` | số | Có | Không âm. **Phản hồi trả dạng chuỗi**, ví dụ `"45000.00"` |
| `so_luong` | số nguyên | Không | Không âm, để trống thì mặc định `0` |
| `ma_loai` | chuỗi | Có | Đúng 5 ký tự, phải có trong bảng `loai_sach` |
| `ten_loai` | chuỗi | — | Chỉ có trong phản hồi (JOIN với `loai_sach`) |

- Các trường tùy chọn gửi chuỗi rỗng `""` sẽ được `BookController::normalize()` đổi thành `NULL`.
- Frontend dùng `Number(book.gia_bia)` khi cần tính toán hoặc định dạng giá.

Ví dụ:

```json
{
  "ma_dau_sach": 5,
  "nhan_de": "The Alchemist",
  "tac_gia": "Paulo Coelho",
  "nha_xuat_ban": "HarperOne",
  "mo_ta": "Hành trình của chàng chăn cừu Santiago...",
  "hinh_anh": "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
  "so_trang": 208,
  "gia_bia": "109000.00",
  "so_luong": 18,
  "ma_loai": "VANHO",
  "ten_loai": "Văn học"
}
```

## 3. Các endpoint

| Phương thức | Đường dẫn | Thành công | Lỗi | Xử lý | Người làm |
|---|---|---|---|---|---|
| GET | `/api/books` | 200 `{"data":[{...},{...}]}` | | `BookController::index` | Minh Tân |
| GET | `/api/books?q=từ khóa` | 200 `{"data":[{...}]}` | | `BookController::index` | Minh Tân |
| GET | `/api/books/{id}` | 200 `{"data":{...}}` | 404 | `BookController::show` | Cang |
| GET | `/api/categories` | 200 `{"data":[{"ma_loai":"VANHO","ten_loai":"Văn học"}]}` | | `BookController::categories` | Sơn |
| POST | `/api/books` | 201 `{"message":"Thêm sách thành công","id":5}` | 422 | `BookController::store` | Khang |
| PUT | `/api/books/{id}` | 200 `{"message":"Cập nhật sách thành công"}` | 404, 422 | `BookController::update` | Cang |
| DELETE | `/api/books/{id}` | 200 `{"message":"Xóa sách thành công"}` | 404, 409 | `BookController::delete` | Sơn |

### GET `/api/books`

- Không có `q` (hoặc `q` rỗng): trả tất cả sách.
- Có `q`: tìm theo **nhan đề, tác giả hoặc tên loại** (chứa từ khóa, không phân biệt hoa thường). Ký tự `%` và `_` được hiểu đúng nghĩa đen.
- Kết quả sắp xếp sách mới nhất trước (`ma_dau_sach` giảm dần), mỗi phần tử có thêm `ten_loai`.

### GET `/api/categories`

Trả danh sách loại sách sắp theo `ten_loai`, dùng cho ô chọn loại trong form.

### POST `/api/books` và PUT `/api/books/{id}`

Body gồm các trường: `nhan_de`, `tac_gia`, `nha_xuat_ban`, `mo_ta`, `hinh_anh`, `so_trang`, `gia_bia`, `so_luong`, `ma_loai`.

```json
{
  "nhan_de": "Dế Mèn phiêu lưu ký",
  "tac_gia": "Tô Hoài",
  "nha_xuat_ban": "NXB Kim Đồng",
  "mo_ta": "",
  "hinh_anh": "",
  "so_trang": "144",
  "gia_bia": "45000",
  "so_luong": "12",
  "ma_loai": "VANHO"
}
```

- Cả hai đều gọi `normalize()` trước rồi `validate()` (hai hàm private trong `BookController`), nên lỗi 422 có cùng dạng.
- `ma_loai` đúng 5 ký tự nhưng không có trong bảng `loai_sach` → 422 `{"errors":{"ma_loai":"Mã loại không tồn tại"}}`.
- `PUT` kiểm tra sách tồn tại trước, không có thì trả 404.

Ví dụ lỗi 422:

```json
{
  "errors": {
    "nhan_de": "Nhan đề không được để trống",
    "gia_bia": "Giá bìa phải là số không âm",
    "ma_loai": "Mã loại gồm đúng 5 ký tự"
  }
}
```

### DELETE `/api/books/{id}`

- Không có sách → 404.
- Sách đang được tham chiếu trong bảng `chua` (chi tiết giỏ hàng) → 409, vì khóa ngoại `ON DELETE RESTRICT`.

### Thử nhanh bằng curl

```bash
curl http://localhost/book-slim/public/api/books?q=harry
curl http://localhost/book-slim/public/api/books/1
curl http://localhost/book-slim/public/api/categories
curl -X POST http://localhost/book-slim/public/api/books \
     -H "Content-Type: application/json" \
     -d '{"nhan_de":"Sách thử","tac_gia":"Nhóm","gia_bia":"50000","ma_loai":"VANHO"}'
curl -X PUT http://localhost/book-slim/public/api/books/1 \
     -H "Content-Type: application/json" \
     -d '{"nhan_de":"Sách đã sửa","tac_gia":"Nhóm","gia_bia":"60000","ma_loai":"VANHO"}'
curl -X DELETE http://localhost/book-slim/public/api/books/1
```

## 4. Hàm trong BookRepository (tên cố định)

| Hàm | Chức năng | Người viết |
|---|---|---|
| `create(array $d): int` | Thêm sách, trả mã vừa tạo | Khang |
| `getById(int $id): ?array` | Lấy một cuốn (kèm `ten_loai`), không có trả `null` | Cang |
| `update(int $id, array $d): void` | Cập nhật sách | Cang |
| `delete(int $id): bool` | Xóa sách, trả `true` nếu có dòng bị xóa | Sơn |
| `getCategories(): array` | Lấy tất cả loại sách | Sơn |
| `getAll(): array` | Lấy tất cả sách (kèm `ten_loai`) | Minh Tân |
| `search(string $keyword): array` | Tìm sách theo nhan đề, tác giả, tên loại | Minh Tân |

## 5. Frontend

- Mỗi trang HTML nạp theo thứ tự: `style.css`, rồi `api.js`, rồi file JS của trang đó (`list.js`, `detail.js` hoặc `form.js`). Trang danh sách nạp thêm `modal.js` giữa `api.js` và `list.js`.
- `api.js` có các hàm sau, mỗi hàm gọi API trả về Promise cho `{ status, ok, body }` (`body` là JSON đã đọc ra). Hàm **không ném lỗi** khi gặp 4xx, trang tự xử lý theo `status`. Mất kết nối thì `status = 0`.
  - `getBooks(q)`, `getBook(id)`, `getCategories()`
  - `createBook(data)`, `updateBook(id, data)`, `deleteBook(id)`
  - `renderHeader()`: vẽ thanh menu chung (liên kết "Danh sách sách" và "Thêm sách") vào thẻ `<div id="header"></div>`; trang nào cũng đặt thẻ này ở đầu `<body>` và gọi hàm này khi tải xong.
- `modal.js` cung cấp `Modal.confirm({...})` và `Modal.notice({...})` cho hộp thoại xác nhận xóa và thông báo kết quả.
- Lấy `id` từ đường dẫn bằng `location.pathname`, ví dụ `/books/5` hoặc `/books/5/edit`. Trang `form.html` ở chế độ **thêm** nếu đường dẫn kết thúc bằng `/create`, và **sửa** nếu kết thúc bằng `/edit`.
- Trong form, thuộc tính `name` của mỗi ô nhập trùng với tên trường của sách (ví dụ `name="nhan_de"`), riêng ô chọn loại sách có `name="ma_loai"`.

### Dữ liệu giả

Khi một API chưa làm xong (server trả 501) và `USE_MOCK = true` trong `api.js`, các hàm tự trả dữ liệu giả đúng theo hợp đồng này để frontend làm trước. Khi tất cả API đã xong, đổi `USE_MOCK` thành `false` hoặc xóa phần "DỮ LIỆU GIẢ".
