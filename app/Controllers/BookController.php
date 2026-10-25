<?php
namespace App\Controllers;

use App\Models\BookRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// API CRUD, trả về JSON
class BookController
{
    public function __construct(private BookRepository $books) {}

    // GET /api/books (?q=) -> Minh Tân
    public function index(Request $request, Response $response): Response
    {
        return $this->json($response, ['error' => 'Chưa làm'], 501);
    }

    // GET /api/books/{id} -> Cang
        public function show(Request $request, Response $response, array $args): Response
    {
        $book = $this->books->getById((int) $args['id']);
        if ($book === null) {
            return $this->json($response, ['error' => 'Không tìm thấy sách'], 404);
        }
        return $this->json($response, ['data' => $book]);
    }

    // GET /api/categories -> Sơn
    public function categories(Request $request, Response $response): Response
    {
        return $this->json($response, ['error' => 'Chưa làm'], 501);
    }

    // POST /api/books -> Khang
    public function store(Request $request, Response $response): Response
    {
        $data   = $this->normalize((array) $request->getParsedBody());
        $errors = $this->validate($data);
        if ($errors) {
            return $this->json($response, ['errors' => $errors], 422);
        }
        try {
            $id = $this->books->create($data);
        } catch (\PDOException $e) {
            // 23000 = vi phạm khóa ngoại: mã loại không tồn tại trong bảng loai_sach
            if ($e->getCode() === '23000') {
                return $this->json($response, ['errors' => ['ma_loai' => 'Mã loại không tồn tại']], 422);
            }
            throw $e;
        }
        return $this->json($response, ['message' => 'Thêm sách thành công', 'id' => $id], 201);
    }

    // PUT /api/books/{id} -> Cang
        public function update(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        if ($this->books->getById($id) === null) {
            return $this->json($response, ['error' => 'Không tìm thấy sách'], 404);
        }

        $data   = $this->normalize((array) $request->getParsedBody());
        $errors = $this->validate($data);
        if ($errors) {
            return $this->json($response, ['errors' => $errors], 422);
        }
        try {
            $this->books->update($id, $data);
        } catch (\PDOException $e) {
            // 23000 = vi phạm khóa ngoại: mã loại không tồn tại trong bảng loai_sach
            if ($e->getCode() === '23000') {
                return $this->json($response, ['errors' => ['ma_loai' => 'Mã loại không tồn tại']], 422);
            }
            throw $e;
        }
        return $this->json($response, ['message' => 'Cập nhật sách thành công']);
    }

    // DELETE /api/books/{id} -> Sơn
    public function delete(Request $request, Response $response, array $args): Response
    {
        return $this->json($response, ['error' => 'Chưa làm'], 501);
    }

    // Đổi chuỗi rỗng thành null cho các cột cho phép NULL; số lượng mặc định 0
    private function normalize(array $d): array
    {
        foreach (['nha_xuat_ban', 'mo_ta', 'hinh_anh', 'so_trang'] as $key) {
            $v = $d[$key] ?? null;
            $d[$key] = ($v === null || trim((string) $v) === '') ? null : trim((string) $v);
        }
        $d['so_luong'] = (isset($d['so_luong']) && trim((string) $d['so_luong']) !== '') ? $d['so_luong'] : 0;
        return $d;
    }

    // Kiểm tra dữ liệu theo đúng bảng sach (chạy sau normalize)
    private function validate(array $d): array
    {
        $e = [];

        $nhanDe = trim((string) ($d['nhan_de'] ?? ''));
        if ($nhanDe === '') {
            $e['nhan_de'] = 'Nhan đề không được để trống';
        } elseif (mb_strlen($nhanDe) > 255) {
            $e['nhan_de'] = 'Nhan đề tối đa 255 ký tự';
        }

        $tacGia = trim((string) ($d['tac_gia'] ?? ''));
        if ($tacGia === '') {
            $e['tac_gia'] = 'Tác giả không được để trống';
        } elseif (mb_strlen($tacGia) > 150) {
            $e['tac_gia'] = 'Tác giả tối đa 150 ký tự';
        }

        if (($d['nha_xuat_ban'] ?? null) !== null && mb_strlen((string) $d['nha_xuat_ban']) > 150) {
            $e['nha_xuat_ban'] = 'Nhà xuất bản tối đa 150 ký tự';
        }
        if (($d['hinh_anh'] ?? null) !== null && mb_strlen((string) $d['hinh_anh']) > 255) {
            $e['hinh_anh'] = 'Đường dẫn hình ảnh tối đa 255 ký tự';
        }

        $soTrang = $d['so_trang'] ?? null;
        if ($soTrang !== null && (!ctype_digit((string) $soTrang) || (int) $soTrang < 1)) {
            $e['so_trang'] = 'Số trang phải là số nguyên từ 1 trở lên';
        }

        if (!is_numeric($d['gia_bia'] ?? null) || $d['gia_bia'] < 0 || $d['gia_bia'] > 9999999999.99) {
            $e['gia_bia'] = 'Giá bìa phải là số không âm';
        }

        if (!ctype_digit((string) ($d['so_luong'] ?? 0))) {
            $e['so_luong'] = 'Số lượng phải là số nguyên không âm';
        }

        if (mb_strlen(trim((string) ($d['ma_loai'] ?? ''))) !== 5) {
            $e['ma_loai'] = 'Mã loại gồm đúng 5 ký tự';
        }

        return $e;
    }

    private function json(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8')
                        ->withStatus($status);
    }
}