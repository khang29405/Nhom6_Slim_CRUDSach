<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Trả về các trang HTML trong app/Views (Sơn)
class PageController
{
    // GET /books -> app/Views/index.html
    public function index(Request $request, Response $response): Response
    {
        return $this->render($response, 'index.html');
    }

    // GET /books/{id} -> app/Views/detail.html
    public function show(Request $request, Response $response, array $args): Response
    {
        return $this->render($response, 'detail.html');
    }

    // GET /books/create -> app/Views/form.html
    public function create(Request $request, Response $response): Response
    {
        return $this->render($response, 'form.html');
    }

    // GET /books/{id}/edit -> app/Views/form.html
    public function edit(Request $request, Response $response, array $args): Response
    {
        return $this->render($response, 'form.html');
    }

    // Đọc file HTML trong app/Views rồi trả về trình duyệt
    private function render(Response $response, string $file): Response
    {
        $path = __DIR__ . '/../Views/' . $file;
        if (!is_file($path)) {
            $response->getBody()->write('<h1>404</h1><p>Không tìm thấy trang</p>');
            return $response->withHeader('Content-Type', 'text/html; charset=utf-8')->withStatus(404);
        }

        $response->getBody()->write((string) file_get_contents($path));
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8');
    }
}