<?php
namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Exception\HttpException;
use Slim\Psr7\Response as SlimResponse;
use Throwable;

// Xử lý lỗi chung: đường dẫn /api/... trả JSON, các trang khác trả HTML đơn giản
class ErrorHandler
{
    public function __invoke(Request $request, Throwable $exception, bool $displayErrorDetails): Response
    {
        $status  = $exception instanceof HttpException ? $exception->getCode() : 500;
        $message = match ($status) {
            404     => 'Không tìm thấy',
            405     => 'Phương thức không được hỗ trợ',
            default => $displayErrorDetails ? $exception->getMessage() : 'Lỗi máy chủ',
        };

        $response = new SlimResponse($status);
        if (str_contains($request->getUri()->getPath(), '/api/')) {
            $response->getBody()->write(json_encode(['error' => $message], JSON_UNESCAPED_UNICODE));
            return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
        }

        $response->getBody()->write("<h1>{$status}</h1><p>{$message}</p>");
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8');
    }
}
