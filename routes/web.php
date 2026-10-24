<?php
use App\Controllers\BookController;
use App\Controllers\PageController;
use Slim\App;

return function (App $app) {
    // Trang (route /books/create phải đứng trước /books/{id})
    $app->get('/books', [PageController::class, 'index']);
    $app->get('/books/create', [PageController::class, 'create']);
    $app->get('/books/{id}/edit', [PageController::class, 'edit']);
    $app->get('/books/{id}', [PageController::class, 'show']);

    // API
    $app->group('/api', function ($group) {
        $group->get('/books', [BookController::class, 'index']);
        $group->get('/books/{id}', [BookController::class, 'show']);
        $group->get('/categories', [BookController::class, 'categories']);
        $group->post('/books', [BookController::class, 'store']);
        $group->put('/books/{id}', [BookController::class, 'update']);
        $group->delete('/books/{id}', [BookController::class, 'delete']);
    });
};
