<?php

$cwdPublicIndex = getcwd().DIRECTORY_SEPARATOR.'index.php';
$projectPublicPath = __DIR__.DIRECTORY_SEPARATOR.'public';

$publicPath = file_exists($cwdPublicIndex)
    ? getcwd()
    : $projectPublicPath;

header_register_callback(static function (): void {
    if (headers_sent()) {
        return;
    }

    header('X-Content-Type-Options: nosniff', true);
    header_remove('X-Powered-By');
});

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

$assetPath = $publicPath.$uri;

if ($uri !== '/' && file_exists($assetPath) && is_file($assetPath)) {
    $extension = strtolower(pathinfo($assetPath, PATHINFO_EXTENSION));

    $mimeTypes = [
        'js' => 'application/javascript',
        'css' => 'text/css; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'map' => 'application/json; charset=UTF-8',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject',
        'txt' => 'text/plain; charset=UTF-8',
        'xml' => 'application/xml; charset=UTF-8',
    ];

    if (isset($mimeTypes[$extension])) {
        header('Content-Type: '.$mimeTypes[$extension]);
    }

    header('X-Content-Type-Options: nosniff', true);
    header_remove('X-Powered-By');
    header('Content-Length: '.filesize($assetPath));

    readfile($assetPath);

    return true;
}

$formattedDateTime = date('D M j H:i:s Y');
$requestMethod = $_SERVER['REQUEST_METHOD'];
$remoteAddress = $_SERVER['REMOTE_ADDR'].':'.$_SERVER['REMOTE_PORT'];

file_put_contents('php://stdout', "[$formattedDateTime] $remoteAddress [$requestMethod] URI: $uri\n");

header_remove('X-Powered-By');
header('X-Content-Type-Options: nosniff', true);

require_once $publicPath.'/index.php';
