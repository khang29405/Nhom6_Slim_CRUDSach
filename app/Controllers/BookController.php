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
        return $this->json($response, ['error' => 'Chưa làm'], 501);
    }

    // GET /api/categories -> Sơn
    public function categories(Request $request, Response $response): Response
    {
        return $this->json($response, ['error' => 'Chưa làm'], 501);
    }

    // POST /api/books -> Khang
    public function store(Request $request, Response $response): Response
    {
        $data   = (array) $request->getParsedBody();
        $errors = $this->validate($data);
        if ($errors) {
            return $this->json($response, ['errors' => $errors], 422);
        }
        try {
            $id = $this->books->create($data);
        } catch (\PDOException $e) {
            // Mã loại không tồn tại trong bảng loại sách (vi phạm khóa ngoại)
            return $this->json($response, ['errors' => ['ma_loai' => 'Mã loại không tồn tại']], 422);
        }
        return $this->json($response, ['message' => 'Thêm sách thành công', 'id' => $id], 201);
    }

    // PUT /api/books/{id} -> Cang
    public function update(Request $request, Response $response, array $args): Response
    {
        return $this->json($response, ['error' => 'Chưa làm'], 501);
    }

    // DELETE /api/books/{id} -> Sơn
    public function delete(Request $request, Response $response, array $args): Response
    {
        return $this->json($response, ['error' => 'Chưa làm'], 501);
    }

    private function validate(array $d): array
    {
        $e = [];
        if (trim($d['nhan_de'] ?? '') === '') {
            $e['nhan_de'] = 'Nhan đề không được để trống';
        }
        if (trim($d['tac_gia'] ?? '') === '') {
            $e['tac_gia'] = 'Tác giả không được để trống';
        }
        if (strlen(trim($d['ma_loai'] ?? '')) !== 5) {
            $e['ma_loai'] = 'Mã loại gồm đúng 5 ký tự';
        }
        if (!is_numeric($d['gia_bia'] ?? null) || $d['gia_bia'] < 0) {
            $e['gia_bia'] = 'Giá bìa phải là số không âm';
        }
        if (!ctype_digit((string) ($d['so_trang'] ?? ''))) {
            $e['so_trang'] = 'Số trang phải là số nguyên';
        }
        if (!ctype_digit((string) ($d['so_luong'] ?? ''))) {
            $e['so_luong'] = 'Số lượng phải là số nguyên không âm';
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
