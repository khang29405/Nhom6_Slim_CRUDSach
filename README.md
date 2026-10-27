# Book Slim – Demo quản lý sách bằng Slim PHP (MVC)

Website demo xây dựng bằng framework **Slim 4** theo mô hình **MVC**, quản lý bảng **SÁCH** với đầy đủ các chức năng thêm, xem, sửa, xóa và tìm kiếm. Backend trả các trang HTML và cung cấp API JSON; frontend là HTML, CSS, JavaScript thuần gọi API bằng `fetch`.

> Hợp đồng API (định dạng JSON, mã lỗi, tên hàm, quy ước frontend) xem tại **[API.md](API.md)**.

## Mục lục

- [Chức năng](#chức-năng)
- [Công nghệ](#công-nghệ)
- [Vai trò của Slim trong dự án](#vai-trò-của-slim-trong-dự-án)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [Cài đặt và chạy](#cài-đặt-và-chạy)
- [Các route](#các-route)
- [Luồng xử lý một yêu cầu](#luồng-xử-lý-một-yêu-cầu)
- [Cấu hình](#cấu-hình)
- [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)
- [Thành viên và phân công](#thành-viên-và-phân-công)

## Chức năng

| Chức năng | Mô tả | Trang |
|---|---|---|
| **Xem danh sách** | Bảng sách có ảnh bìa, nhan đề, tác giả, loại, giá, số lượng (hiện nhãn "Hết hàng" khi bằng 0); phân trang 10 cuốn/trang | `/books` |
| **Tìm kiếm** | Tìm theo nhan đề, tác giả hoặc tên loại sách; từ khóa và số trang được giữ trên thanh địa chỉ (`?q=...&page=...`) | `/books` |
| **Xem chi tiết** | Ảnh bìa, thông tin đầy đủ, mô tả, tình trạng còn/hết hàng, nút sửa | `/books/{id}` |
| **Thêm sách** | Form có ô chọn loại sách, báo lỗi ngay dưới từng ô khi dữ liệu sai | `/books/create` |
| **Sửa sách** | Dùng chung form với trang thêm, tự điền dữ liệu cũ | `/books/{id}/edit` |
| **Xóa sách** | Nút xóa trên từng dòng của danh sách, hiện hộp thoại xác nhận trước khi xóa | `/books` |

Loại sách được nhập sẵn trong CSDL (`database/seed.sql`), không có chức năng quản lý loại sách trong giao diện.

## Công nghệ

- **Backend:** PHP 8 (≥ 8.0), Slim 4, Slim PSR-7, PHP-DI 7, MySQL qua PDO
- **Frontend:** HTML, CSS, JavaScript thuần (`fetch`), không dùng Twig hay Bootstrap
- **Công cụ:** XAMPP (Apache, MySQL, phpMyAdmin), Composer, Git

Phiên bản thư viện được khóa trong `composer.lock`: `slim/slim` 4.15, `slim/psr7` 1.8, `php-di/php-di` 7.1.

## Vai trò của Slim trong dự án

Mọi yêu cầu từ trình duyệt đều đi qua Slim (`public/index.php`) trước khi tới Model hay CSDL. Slim đảm nhận:

- **Routing:** định tuyến đường dẫn tới đúng hàm xử lý (route trang và route API, tham số `{id}`, các phương thức GET, POST, PUT, DELETE) – khai báo trong `routes/web.php`.
- **Controller với request/response PSR-7:** `PageController` trả trang HTML, `BookController` trả JSON.
- **Middleware:**
  - `addBodyParsingMiddleware()` – đọc body JSON của `POST`/`PUT`.
  - `addRoutingMiddleware()` – tìm route khớp với yêu cầu.
  - `addErrorMiddleware()` + `App\Middleware\ErrorHandler` – bắt lỗi 404, 405, 500; đường dẫn `/api/...` trả JSON, các trang khác trả HTML.
- **DI container (PHP-DI):** tạo kết nối `PDO` từ `settings.php`, tự động tiêm `PDO` vào `BookRepository` và `BookRepository` vào `BookController` (autowiring).
- **Phục vụ trang:** trả các file HTML trong `app/Views`.

## Cấu trúc thư mục

```text
book-slim/                      # đặt trong htdocs của XAMPP
├── public/                     # thư mục gốc web, chỉ thư mục này được truy cập trực tiếp
│   ├── index.php               # điểm vào: tạo container, app Slim, middleware, nạp route
│   ├── .htaccess               # chuyển mọi yêu cầu không phải file tĩnh về index.php
│   └── assets/
│       ├── css/style.css       # giao diện dùng chung
│       └── js/
│           ├── api.js          # hàm gọi API dùng chung + renderHeader() + dữ liệu giả
│           ├── modal.js        # hộp thoại xác nhận / thông báo
│           ├── list.js         # trang danh sách, tìm kiếm, phân trang, xóa
│           ├── detail.js       # trang chi tiết
│           └── form.js         # trang thêm / sửa
├── app/
│   ├── Config/
│   │   ├── settings.php        # base_path và thông tin kết nối MySQL
│   │   └── container.php       # khai báo PHP-DI (settings, PDO)
│   ├── Controllers/
│   │   ├── PageController.php  # trả các trang HTML
│   │   └── BookController.php  # API CRUD, kiểm tra dữ liệu, trả JSON
│   ├── Middleware/
│   │   └── ErrorHandler.php    # xử lý lỗi chung (JSON cho API, HTML cho trang)
│   ├── Models/
│   │   ├── Book.php            # lớp mô tả một cuốn sách
│   │   └── BookRepository.php  # truy vấn MySQL bằng PDO (prepared statement)
│   └── Views/                  # HTML thuần
│       ├── index.html          # danh sách + tìm kiếm
│       ├── detail.html         # chi tiết
│       └── form.html           # thêm / sửa dùng chung
├── routes/web.php              # khai báo toàn bộ route
├── database/
│   ├── schema.sql              # tạo CSDL bookstore và các bảng
│   └── seed.sql                # dữ liệu mẫu: 3 loại sách, 31 đầu sách
├── composer.json
├── composer.lock
├── API.md                      # hợp đồng API
└── README.md
```

### Mô hình MVC

| Thành phần | Vị trí | Nhiệm vụ |
|---|---|---|
| **Model** | `app/Models` | `BookRepository` chứa toàn bộ câu SQL; controller không viết SQL trực tiếp |
| **View** | `app/Views`, `public/assets` | Trang HTML thuần; JS gọi API rồi tự vẽ dữ liệu lên trang |
| **Controller** | `app/Controllers` | Nhận request từ Slim, gọi Model, trả response HTML hoặc JSON |

## Cơ sở dữ liệu

CSDL tên **`bookstore`** (utf8mb4). Demo chỉ dùng hai bảng:

**`loai_sach`**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `ma_loai` | `CHAR(5)` | Khóa chính |
| `ten_loai` | `VARCHAR(100)` | |

**`sach`**

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `ma_dau_sach` | `INT` | Khóa chính, tự tăng |
| `nhan_de` | `VARCHAR(255)` | Bắt buộc |
| `tac_gia` | `VARCHAR(150)` | Bắt buộc |
| `nha_xuat_ban` | `VARCHAR(150)` | Có thể NULL |
| `mo_ta` | `TEXT` | Có thể NULL |
| `hinh_anh` | `VARCHAR(255)` | Có thể NULL (đường dẫn / URL ảnh bìa) |
| `so_trang` | `INT` | Có thể NULL |
| `gia_bia` | `DECIMAL(12,2)` | Bắt buộc |
| `so_luong` | `INT` | Mặc định 0 |
| `ma_loai` | `CHAR(5)` | Khóa ngoại → `loai_sach.ma_loai` |

`schema.sql` còn tạo thêm các bảng `thanh_vien`, `quan_tri_vien`, `gio_hang`, `chua` theo mô hình đầy đủ của hệ thống bán sách. Code demo không dùng các bảng này, nhưng vì `chua` có khóa ngoại tới `sach` nên **không xóa được sách đã có trong giỏ hàng** (API trả 409).

Dữ liệu mẫu trong `seed.sql`: 3 loại (`KINHT` – Kinh tế, `THIEU` – Thiếu nhi, `VANHO` – Văn học) và 31 đầu sách có ảnh bìa từ Open Library. File seed có thể import lại nhiều lần mà không làm mất sách do người dùng tự thêm.

## Cài đặt và chạy

### Yêu cầu

- XAMPP có **PHP 8.0 trở lên** (khuyến nghị 8.1+)
- Composer
- Git

Kiểm tra bằng:

```bash
php -v
composer -V
git --version
```

### Cài Composer (nếu máy chưa có)

XAMPP không kèm Composer. Nếu lệnh `composer -V` báo không nhận ra:

1. Tải `Composer-Setup.exe` tại [getcomposer.org](https://getcomposer.org) và chạy.
2. Khi được hỏi đường dẫn PHP, chọn `php.exe` của XAMPP (ví dụ `C:\xampp\php\php.exe`).
3. Giữ các tùy chọn mặc định (để trình cài tự thêm vào PATH) rồi cài đặt.
4. Mở terminal **mới**, gõ `composer -V` để kiểm tra. Nếu `php -v` vẫn lỗi, thêm thư mục `C:\xampp\php` vào biến môi trường PATH rồi mở lại terminal.

### Các bước chạy dự án

1. **Lấy mã nguồn** – mở terminal tại thư mục `htdocs` của XAMPP:

   ```bash
   git clone <địa chỉ repo> book-slim
   cd book-slim
   ```

   Tên thư mục phải là `book-slim` vì đường dẫn gốc đã được cấu hình là `/book-slim/public` (xem [Cấu hình](#cấu-hình)).

2. **Cài thư viện** đúng phiên bản trong `composer.lock`:

   ```bash
   composer install
   ```

3. **Bật Apache và MySQL** trong XAMPP Control Panel.

4. **Tạo CSDL** – vào phpMyAdmin (<http://localhost/phpmyadmin>), tab *Import*, lần lượt import:
   1. `database/schema.sql`
   2. `database/seed.sql`

   Hoặc dùng dòng lệnh:

   ```bash
   mysql -u root < database/schema.sql
   mysql -u root < database/seed.sql
   ```

5. **Mở trang web:** <http://localhost/book-slim/public/books>

   Kiểm tra nhanh API: <http://localhost/book-slim/public/api/books>

## Các route

Tất cả route khai báo trong `routes/web.php`, có tiền tố `/book-slim/public`.

### Route trang (trả HTML)

| Phương thức | Đường dẫn | Xử lý | View | Chức năng |
|---|---|---|---|---|
| GET | `/books` | `PageController::index` | `index.html` | Danh sách + tìm kiếm + xóa |
| GET | `/books/create` | `PageController::create` | `form.html` | Thêm sách |
| GET | `/books/{id}/edit` | `PageController::edit` | `form.html` | Sửa sách |
| GET | `/books/{id}` | `PageController::show` | `detail.html` | Chi tiết sách |

> `/books/create` được khai báo **trước** `/books/{id}` để chữ `create` không bị hiểu là `{id}`.

### Route API (trả JSON)

| Phương thức | Đường dẫn | Xử lý | Chức năng |
|---|---|---|---|
| GET | `/api/books` | `BookController::index` | Danh sách sách |
| GET | `/api/books?q=từ khóa` | `BookController::index` | Tìm kiếm theo nhan đề, tác giả, tên loại |
| GET | `/api/books/{id}` | `BookController::show` | Chi tiết một cuốn |
| GET | `/api/categories` | `BookController::categories` | Danh sách loại sách cho ô chọn |
| POST | `/api/books` | `BookController::store` | Thêm sách |
| PUT | `/api/books/{id}` | `BookController::update` | Sửa sách |
| DELETE | `/api/books/{id}` | `BookController::delete` | Xóa sách |

Body, phản hồi và mã lỗi của từng endpoint: xem [API.md](API.md).

## Luồng xử lý một yêu cầu

Ví dụ người dùng bấm **Lưu** trên trang thêm sách:

```text
Trình duyệt (form.js)
  └─ createBook(data) trong api.js ──► POST /book-slim/public/api/books  (JSON)
        │
Apache (.htaccess) ──► public/index.php
        │
Slim: BodyParsingMiddleware (đọc JSON) ► RoutingMiddleware (tìm route)
        │
BookController::store  ── normalize() + validate()
        │                    └─ sai ► 422 {"errors":{...}}
        ▼
BookRepository::create  ── INSERT bằng PDO
        │
◄── 201 {"message":"Thêm sách thành công","id":32}
        │
form.js hiện thông báo rồi chuyển về /books
```

Nếu có lỗi ngoài dự kiến ở bất kỳ bước nào, `ErrorMiddleware` chuyển cho `ErrorHandler` để trả JSON `{"error": "..."}`.

## Cấu hình

File `app/Config/settings.php`:

```php
return [
    'base_path' => '/book-slim/public',   // đường dẫn gốc trong htdocs
    'db' => [
        'host'    => 'localhost',
        'name'    => 'bookstore',
        'user'    => 'root',
        'pass'    => '',                   // mặc định XAMPP không có mật khẩu
        'charset' => 'utf8mb4',
    ],
];
```

- Nếu MySQL có mật khẩu hoặc tên CSDL khác, sửa phần `db`.
- Nếu đổi tên thư mục dự án, phải sửa `base_path` **và** các hằng `PAGE_BASE` / `API_BASE` trong `public/assets/js/*.js` cùng các đường dẫn `/book-slim/public/assets/...` trong `app/Views/*.html`.
- `addErrorMiddleware(true, true, true)` trong `public/index.php` đang bật hiển thị chi tiết lỗi để tiện phát triển; khi triển khai thật nên đổi tham số đầu thành `false`.
- `USE_MOCK` trong `public/assets/js/api.js`: bật thì khi API trả 501 sẽ dùng dữ liệu giả. Khi mọi API đã xong có thể đổi thành `false`.

## Xử lý sự cố thường gặp

| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| `vendor/autoload.php` not found | Chưa chạy `composer install` |
| Trang 404 của Apache (không phải của Slim) | Apache chưa bật `mod_rewrite`, hoặc thư mục không tên `book-slim` |
| 404 "Không tìm thấy" cho mọi đường dẫn | Sai `base_path` trong `settings.php` so với vị trí thư mục |
| `SQLSTATE[HY000] [1049] Unknown database 'bookstore'` | Chưa import `schema.sql` |
| `SQLSTATE[HY000] [2002]` | MySQL chưa bật trong XAMPP |
| Danh sách trống | Chưa import `seed.sql` |
| Lỗi cú pháp PHP khi chạy | Phiên bản PHP thấp hơn 8.0 |
| Xóa sách báo 409 | Sách đang nằm trong bảng `chua` (chi tiết giỏ hàng) |

## Thành viên và phân công

| Thành viên | MSSV | Phần | Công việc chính |
|---|---|---|---|
| Huỳnh Thiên Sơn | 110123235 | CSDL, Backend | Script tạo bảng và dữ liệu mẫu, API loại sách, API xóa sách, `PageController` |
| Vương Hào Khang | 110123018 | Backend | Khởi tạo repo, cài Slim, dựng cấu trúc MVC, kết nối CSDL, khai báo route, middleware xử lý lỗi, API thêm sách |
| Nguyễn Trương Minh Cang | 110123005 | Backend | API sửa sách, API xem chi tiết |
| Lê Nguyễn Minh Tân | 110123043 | Backend | API danh sách sách, API tìm kiếm |
| Nguyễn Hoàn Thông | 110123050 | Frontend | Trang danh sách (`index.html`), ô tìm kiếm |
| Nguyễn Duy Tân | 110123044 | Frontend | Trang thêm / sửa sách (`form.html`), ô chọn loại sách |
| Trần Công Hậu | 110122073 | Frontend | Nút xóa sách có hộp thoại xác nhận, trang chi tiết (`detail.html`) |
| Lâm Minh Thiện | 110123047 | Frontend | Khung giao diện chung (HTML, CSS), hàm gọi API dùng chung (`api.js`) |
