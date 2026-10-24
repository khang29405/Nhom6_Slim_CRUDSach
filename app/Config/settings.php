<?php
return [
    // Đường dẫn gốc khi chạy trong thư mục con của htdocs (XAMPP)
    'base_path' => '/book-slim/public',

    // Cấu hình MySQL mặc định của XAMPP
    'db' => [
        'host'    => 'localhost',
        'name'    => 'bookstore',
        'user'    => 'root',
        'pass'    => '',
        'charset' => 'utf8mb4',
    ],
];
