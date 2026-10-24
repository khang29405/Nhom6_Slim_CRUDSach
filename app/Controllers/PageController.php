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
        return $this->notReady($response);
    }

    // GET /books/{id} -> app/Views/detail.html
    public function show(Request $request, Response $response, array $args): Response
    {
        return $this->notReady($response);
    }

    // GET /books/create -> app/Views/form.html
    public function create(Request $request, Response $response): Response
    {
        return $this->notReady($response);
    }

    // GET /books/{id}/edit -> app/Views/form.html
    public function edit(Request $request, Response $response, array $args): Response
    {
        return $this->notReady($response);
    }

    private function notReady(Response $response): Response
    {
        $response->getBody()->write('<p>Chưa làm</p>');
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8')->withStatus(501);
    }
}
