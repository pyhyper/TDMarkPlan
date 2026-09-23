<?php
// Local preview: php -S 127.0.0.1:8088 router.php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/(data|lib|tests)(/|$)#', $path)) { http_response_code(403); exit; }
if ($path !== '/' && is_file(__DIR__ . $path)) return false;
if ($path !== '/' && !preg_match('#^/[a-zA-Z0-9_-]{1,64}/?$#', $path)) { http_response_code(404); exit; }
$_SERVER['SCRIPT_NAME'] = '/index.php';
require __DIR__ . '/index.php';
