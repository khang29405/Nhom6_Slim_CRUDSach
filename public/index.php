<?php
use Slim\Factory\AppFactory;
use App\Middleware\ErrorHandler;

require __DIR__ . '/../vendor/autoload.php';

$container = require __DIR__ . '/../app/Config/container.php';
AppFactory::setContainer($container);

$app = AppFactory::create();
$app->setBasePath($container->get('settings')['base_path']);

$app->addBodyParsingMiddleware();   // đọc dữ liệu JSON gửi lên
$app->addRoutingMiddleware();

$errorMiddleware = $app->addErrorMiddleware(true, true, true);
$errorMiddleware->setDefaultErrorHandler(new ErrorHandler());

(require __DIR__ . '/../routes/web.php')($app);

$app->run();
