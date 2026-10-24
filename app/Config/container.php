<?php
use DI\ContainerBuilder;

// PHP-DI: tạo và cung cấp các đối tượng dùng chung (cấu hình, kết nối PDO)
$builder = new ContainerBuilder();
$builder->addDefinitions([
    'settings' => require __DIR__ . '/settings.php',

    PDO::class => function ($c) {
        $db  = $c->get('settings')['db'];
        $dsn = "mysql:host={$db['host']};dbname={$db['name']};charset={$db['charset']}";
        return new PDO($dsn, $db['user'], $db['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    },
]);

return $builder->build();
