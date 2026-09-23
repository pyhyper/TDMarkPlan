<?php
/**
 * AI Plan Executor — Configuration & Helper Utilities
 * Designed for standard Shared Hosting (cPanel, Apache, Nginx) with zero external dependencies.
 */

// Define directory constants
define('ROOT_DIR', __DIR__);
define('DATA_DIR', ROOT_DIR . '/data');
define('PLANS_DIR', DATA_DIR . '/plans');
define('EXEC_DIR', DATA_DIR . '/executions');
define('EXAMPLES_DIR', ROOT_DIR . '/examples');

// Default Timezone
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Ensure data storage directories exist
if (!is_dir(DATA_DIR)) {
    @mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(PLANS_DIR)) {
    @mkdir(PLANS_DIR, 0755, true);
}
if (!is_dir(EXEC_DIR)) {
    @mkdir(EXEC_DIR, 0755, true);
}

// Ensure .htaccess inside data folder to prevent direct HTTP file browsing
$dataHtaccess = DATA_DIR . '/.htaccess';
if (!file_exists($dataHtaccess)) {
    @file_put_contents($dataHtaccess, "Deny from all\n");
}

/**
 * Return JSON response and terminate
 */
function json_response($data, int $statusCode = 200): void {
    if (isset($GLOBALS['workspaceResponse'])) $data = ($GLOBALS['workspaceResponse'])($data);
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Sanitize plan ID / slug to prevent directory traversal
 */
function sanitize_plan_id(?string $id): string {
    if (!$id) return '';
    // Allow only lowercase alphanumerics, hyphens, and underscores
    $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $id);
    return strtolower(substr($clean, 0, 64));
}

/**
 * Generate a clean dynamic link ID (e.g. ielts-6-5-7k2m)
 */
function generate_dynamic_id(string $title = ''): string {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    $slug = substr($slug, 0, 20);
    if (empty($slug)) {
        $slug = 'plan';
    }
    $random = substr(str_shuffle('23456789abcdefghjkmnpqrstuvwxyz'), 0, 4);
    return $slug . '-' . $random;
}
