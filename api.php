<?php
/**
 * api.php — Lightweight REST API for AI Plan Executor
 * Handles plan loading, validation, saving, task execution updates, password protection, and AI prompts.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/PlanParser.php';
require_once __DIR__ . '/lib/PlanValidator.php';
require_once __DIR__ . '/lib/PlanStorage.php';
require_once __DIR__ . '/lib/AiAdapter.php';
require_once __DIR__ . '/lib/Workspace.php';
header('Cache-Control: no-store, private');

// Allow standard CORS if needed, and JSON headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Plan-Token, X-Plan-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Support JSON POST body
$rawBody = file_get_contents('php://input');
$jsonBody = json_decode($rawBody, true) ?: [];

// Extract Authentication credentials (Token or Password)
$clientToken = $_SERVER['HTTP_X_PLAN_TOKEN'] ?? $_GET['token'] ?? $_POST['token'] ?? $jsonBody['token'] ?? null;
$clientPassword = $_SERVER['HTTP_X_PLAN_PASSWORD'] ?? $_POST['password'] ?? $jsonBody['password'] ?? null;

// Each public link owns exactly two slots. Slot 2 always authenticates against slot 1.
$slot = (string)($_GET['slot'] ?? '1');
if (!in_array($slot, ['1','2'], true)) json_response(['error'=>'Mỗi link có tối đa 2 plan.'], 422);
$root = sanitize_plan_id($_GET['p'] ?? $_GET['plan_id'] ?? $_POST['p'] ?? $jsonBody['p'] ?? $jsonBody['custom_id'] ?? $_GET['workspace'] ?? '');
foreach ([$root, $_GET['p'] ?? '', $_GET['plan_id'] ?? '', $_POST['p'] ?? '', $jsonBody['p'] ?? '', $jsonBody['custom_id'] ?? '', $jsonBody['new_id'] ?? ''] as $publicId) {
    if (str_starts_with(strtolower((string)$publicId), 'ws2-')) json_response(['error'=>'Link nội bộ không được truy cập trực tiếp.'], 403);
}
$rootFile = PLANS_DIR . '/' . $root . '.json';
$rootMeta = is_file($rootFile) ? json_decode(file_get_contents($rootFile), true) : null;
if ($rootMeta && !empty($rootMeta['redirect_to']) && $action === 'get_plan') json_response(['redirect_to'=>$rootMeta['redirect_to']]);
if ($rootMeta && !empty($rootMeta['redirect_to'])) json_response(['error'=>'Link đã đổi. Mở link mới trước khi lưu.'], 409);
$rootActions = ['verify_password','set_password','set_auto_delete','custom_link','load_example','validate_preview','list_plans','delete_plan'];
$scoped = $slot === '2' && !in_array($action, $rootActions, true);
if ($scoped && $root !== '') {
    if (!$rootMeta) json_response(['error'=>'Tạo plan đầu tiên trước khi thêm plan thứ hai.','root_missing'=>true], 409);
    if (PlanStorage::hasPassword($root) && !PlanStorage::isAuthorized($root, $clientToken, $clientPassword)) {
        json_response(['is_protected'=>true,'plan_id'=>$root,'title'=>$rootMeta['title'] ?? 'Kế hoạch được khóa'], 401);
    }
    if ($action !== 'get_plan' && !PlanStorage::verifyAuthToken($root, $clientToken ?? '')) json_response(['error'=>'Hãy mở link trước khi thay đổi plan.'], 401);
    $internal = Workspace::childId($root);
    foreach (['p','plan_id','custom_id'] as $key) {
        if (isset($_GET[$key])) $_GET[$key] = $internal;
        if (isset($_POST[$key])) $_POST[$key] = $internal;
        if (isset($jsonBody[$key])) $jsonBody[$key] = $internal;
    }
    // PIN belongs to the public link, not to an individual slot.
    unset($jsonBody['password'], $_POST['password']);
    $clientToken = PlanStorage::generateAuthToken($internal);
}
$GLOBALS['workspaceResponse'] = static function(array $data) use ($root, $scoped, $action): array {
    if (!$root || !empty($data['is_protected']) || !empty($data['redirect_to'])) return $data;
    if ($scoped) {
        if (isset($data['plan_id'])) $data['plan_id'] = $root;
        if (isset($data['token'])) $data['token'] = PlanStorage::generateAuthToken($root);
        if (isset($data['plan'])) { $data['plan']['plan_id'] = $root; $data['plan']['has_password'] = PlanStorage::hasPassword($root); }
        if (isset($data['markdown'])) $data['markdown'] = preg_replace('/^plan_id:.*$/m', 'plan_id: ' . $root, $data['markdown'], 1);
    }
    if ($action === 'get_plan' && (!empty($data['success']) || $scoped)) {
        $data['workspace'] = Workspace::summaries($root);
        if ($scoped) $data['token'] = PlanStorage::generateAuthToken($root);
    }
    return $data;
};

switch ($action) {
    case 'create_notebook':
        $id = sanitize_plan_id($jsonBody['p'] ?? '');
        $autoDeleteDays = isset($jsonBody['auto_delete_days']) ? (int)$jsonBody['auto_delete_days'] : 90;
        if (!$id || !Workspace::createNotebook($id, mb_substr((string)($jsonBody['title'] ?? ''), 0, 200), $jsonBody['password'] ?? null, $autoDeleteDays)) json_response(['error'=>'Link đã có plan. Chọn một ô plan còn trống.'], 409);
        json_response(['success'=>true,'plan_id'=>$id,'token'=>PlanStorage::generateAuthToken($id)]);
        break;
    case 'save_notebook':
        $id = sanitize_plan_id($jsonBody['p'] ?? '');
        if (!PlanStorage::verifyAuthToken($id, $clientToken ?? '')) json_response(['error'=>'Cần mở khóa trước khi lưu.'], 401);
        $notes = $jsonBody['notes'] ?? null;
        if (!is_array($notes) || !Workspace::saveNotebook($id, $notes)) json_response(['error'=>'Sổ ghi chú có tối đa 2 ghi chú dạng văn bản.'], 422);
        json_response(['success'=>true]);
        break;
    case 'create_finance':
        $id = sanitize_plan_id($jsonBody['p'] ?? '');
        $data = $jsonBody['finance'] ?? null;
        $password = $jsonBody['password'] ?? null;
        if ($id === '' || file_exists(PLANS_DIR . '/' . $id . '.json')) {
            json_response(['error' => 'Tên link đã được sử dụng hoặc không hợp lệ.'], 409);
        }
        if (!FinanceTracker::validate($data)) {
            json_response(['error' => 'Số liệu tài chính không hợp lệ.'], 422);
        }
        if (!FinanceTracker::create($id, $data, is_string($password) ? $password : null)) {
            json_response(['error' => 'Không tạo được bảng tài chính.'], 500);
        }
        json_response([
            'success' => true,
            'plan_id' => $id,
            'token' => PlanStorage::generateAuthToken($id)
        ]);
        break;

    case 'custom_link':
        $id = $jsonBody['new_id'] ?? '';
        $old = sanitize_plan_id($jsonBody['p'] ?? '');
        if (!is_string($id) || !preg_match('/^[a-z0-9][a-z0-9_-]{0,63}$/', $id) || in_array($id, ['api', 'index', 'assets', 'data', 'lib', 'tests', 'examples'], true)) json_response(['error' => 'Tên link không hợp lệ hoặc dành riêng cho hệ thống.'], 422);
        if ($id === $old) json_response(['success' => true]);
        if (file_exists(PLANS_DIR . '/' . $id . '.json') || is_dir(ROOT_DIR . '/' . $id)) json_response(['error' => 'Tên link đã được sử dụng. Hãy chọn tên khác.'], 409);
        if (!empty($jsonBody['rename'])) {
            if (!PlanStorage::verifyAuthToken($old, $clientToken ?? '')) json_response(['error' => 'Hãy mở lại kế hoạch để xác nhận quyền đổi link.'], 401);
            $source = PLANS_DIR . '/' . $old . '.json';
            if (!file_exists($source)) json_response(['error' => 'Không tìm thấy kế hoạch.'], 404);
            $plan = json_decode(file_get_contents($source), true);
            $plan['plan_id'] = $id;
            $isFinance = in_array($plan['domain'] ?? '', ['finance','notebook'], true);
            $md = $isFinance ? '' : PlanStorage::exportUpdatedMarkdown($old);
            if (!$isFinance) $md = preg_replace('/^plan_id:.*$/m', 'plan_id: ' . $id, $md, 1);
            $plan['raw_markdown'] = $md;
            $dest = fopen(PLANS_DIR . '/' . $id . '.json', 'x');
            if (!$dest) json_response(['error' => 'Tên link vừa được sử dụng.'], 409);
            fwrite($dest, json_encode($plan, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)); fclose($dest);
            if (!$isFinance) file_put_contents(PLANS_DIR . '/' . $id . '.md', $md);
            $exec = json_decode(file_get_contents(EXEC_DIR . '/' . $old . '.json'), true);
            $exec['plan_id'] = $id;
            file_put_contents(EXEC_DIR . '/' . $id . '.json', json_encode($exec, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            $oldChild = Workspace::childId($old); $newChild = Workspace::childId($id);
            if (is_file(PLANS_DIR . '/' . $oldChild . '.json')) {
                foreach ([PLANS_DIR . '/' . $oldChild . '.json' => PLANS_DIR . '/' . $newChild . '.json', EXEC_DIR . '/' . $oldChild . '.json' => EXEC_DIR . '/' . $newChild . '.json'] as $from => $to) {
                    $childData = json_decode(file_get_contents($from), true); $childData['plan_id'] = $newChild;
                    file_put_contents($to, json_encode($childData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                }
                if (is_file(PLANS_DIR . '/' . $oldChild . '.md')) copy(PLANS_DIR . '/' . $oldChild . '.md', PLANS_DIR . '/' . $newChild . '.md');
            }
            // Keep a redirect alias so bookmarks remain usable.
            file_put_contents(PLANS_DIR . '/' . $old . '.json', json_encode(['redirect_to' => $id]));
            json_response(['success' => true, 'token' => PlanStorage::generateAuthToken($id)]);
        }
        json_response(['success' => true]);
        break;

    case 'save_finance':
        $id = sanitize_plan_id($jsonBody['p'] ?? '');
        if (!PlanStorage::getPlan($id)) json_response(['error' => 'Plan not found'], 404);
        if (PlanStorage::hasPassword($id) && !PlanStorage::isAuthorized($id, $clientToken, $clientPassword)) json_response(['error' => 'Unauthorized'], 401);
        $data = $jsonBody['finance'] ?? null;
        if (!FinanceTracker::validate($data)) json_response(['error' => 'Số liệu không hợp lệ. Kiểm tra chi phí, tỷ lệ rút và nhật ký.'], 422);
        if (!FinanceTracker::save($id, $data)) json_response(['error' => 'Không lưu được dữ liệu'], 500);
        json_response(['success' => true, 'finance' => $data]);
        break;


    // 1. Get Plan with Execution & Stats (Password protected check)
    case 'get_plan':
        $planId = $_GET['p'] ?? $_GET['plan_id'] ?? $jsonBody['p'] ?? '';
        if (empty($planId)) {
            json_response(['error' => 'Missing plan ID parameter (?p=...)'], 400);
        }

        // Check if plan exists
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        if (!file_exists($jsonFile)) {
            if ($scoped) {
                json_response(['error' => 'Plan not found for ID: ' . htmlspecialchars($planId), 'is_empty' => true], 404);
            }
            $emptyPlan = [
                'plan_id' => $slug,
                'title' => $slug,
                'domain' => 'notebook',
                'start_date' => date('Y-m-d'),
                'duration_weeks' => 1,
                'weeks' => [],
                'task_count' => 0,
                'has_password' => false,
                'is_empty' => true,
                'notebook' => ['notes' => []],
                'auto_delete_days' => 90,
                'auto_delete_at' => date('c', time() + 90 * 86400)
            ];
            json_response([
                'success' => true,
                'is_empty' => true,
                'plan' => $emptyPlan,
                'token' => PlanStorage::generateAuthToken($slug)
            ]);
        }

        $routeMeta = json_decode(file_get_contents($jsonFile), true);
        if (!empty($routeMeta['redirect_to'])) json_response(['success' => true, 'redirect_to' => $routeMeta['redirect_to']]);

        // Check password protection
        if (PlanStorage::hasPassword($slug) && !PlanStorage::isAuthorized($slug, $clientToken, $clientPassword)) {
            $rawMeta = json_decode(file_get_contents($jsonFile), true);
            json_response([
                'success' => false,
                'is_protected' => true,
                'plan_id' => $slug,
                'title' => $rawMeta['title'] ?? 'Protected Plan',
                'message' => 'This plan is protected by a password. Please enter the passcode to view.'
            ]);
        }

        $plan = PlanStorage::getPlan($slug);
        if (!$plan) {
            json_response(['error' => 'Failed to load plan'], 500);
        }

        json_response([
            'success' => true,
            'plan' => $plan,
            'token' => PlanStorage::generateAuthToken($slug)
        ]);
        break;

    // 2. Verify Password and get Session Token
    case 'verify_password':
        $planId = $_POST['p'] ?? $jsonBody['p'] ?? '';
        $password = $_POST['password'] ?? $jsonBody['password'] ?? '';

        if (empty($planId)) {
            json_response(['error' => 'Missing plan ID'], 400);
        }

        if (PlanStorage::verifyPassword($planId, $password)) {
            $plan = PlanStorage::getPlan($planId);
            $token = PlanStorage::generateAuthToken($planId);
            json_response([
                'success' => true,
                'token' => $token,
                'plan' => $plan
            ]);
        } else {
            json_response([
                'success' => false,
                'error' => 'Incorrect password. Please try again.'
            ], 401);
        }
        break;

    // 3. Set, Update, or Remove Password for an Existing Plan
    case 'set_password':
        $planId = $_POST['p'] ?? $jsonBody['p'] ?? '';
        $newPassword = $_POST['new_password'] ?? $jsonBody['new_password'] ?? '';
        $currentPassword = $_POST['current_password'] ?? $jsonBody['current_password'] ?? null;

        if (empty($planId)) {
            json_response(['error' => 'Missing plan ID'], 400);
        }

        $res = PlanStorage::setPassword($planId, $newPassword, $currentPassword);
        if (!$res['success']) {
            json_response($res, 400);
        }
        json_response($res);
        break;

    case 'set_auto_delete':
        $planId = sanitize_plan_id($_POST['p'] ?? $jsonBody['p'] ?? '');
        $days = isset($_POST['days']) ? (int)$_POST['days'] : (isset($jsonBody['days']) ? (int)$jsonBody['days'] : 0);
        if (empty($planId)) {
            json_response(['error' => 'Missing plan ID'], 400);
        }
        if (PlanStorage::hasPassword($planId) && !PlanStorage::isAuthorized($planId, $clientToken, $clientPassword)) {
            json_response(['error' => 'Unauthorized: Password required'], 401);
        }
        $res = PlanStorage::setAutoDelete($planId, $days);
        json_response($res);
        break;

    case 'delete_plan':
        $delSlot = (string)($_POST['slot'] ?? $jsonBody['slot'] ?? '1');
        if (!in_array($delSlot, ['1', '2'], true)) {
            json_response(['error' => 'Slot không hợp lệ (chỉ hỗ trợ slot 1 hoặc 2)'], 422);
        }
        $targetId = $delSlot === '2' ? Workspace::childId($root) : $root;
        if (empty($targetId)) {
            json_response(['error' => 'Thiếu thông tin kế hoạch để xóa'], 400);
        }
        if (PlanStorage::hasPassword($root) && !PlanStorage::isAuthorized($root, $clientToken, $clientPassword)) {
            json_response(['error' => 'Cần mật khẩu xác thực để xóa kế hoạch'], 401);
        }
        $ok = PlanStorage::deletePlan($targetId);
        if (!$ok) {
            json_response(['error' => 'Kế hoạch không tồn tại hoặc đã được xóa trước đó.'], 404);
        }
        json_response(['success' => true, 'slot' => (int)$delSlot, 'message' => 'Đã xóa kế hoạch thành công.']);
        break;

    // 4. Validate / Preview without saving
    case 'validate_preview':
        $markdown = $_POST['markdown'] ?? $jsonBody['markdown'] ?? '';
        if (empty($markdown)) {
            json_response(['error' => 'Markdown content is empty'], 400);
        }
        $parsed = PlanParser::parse($markdown);
        $validation = PlanValidator::validate($parsed);
        json_response([
            'success' => true,
            'valid' => $validation['valid'],
            'errors' => $validation['errors'],
            'warnings' => $validation['warnings'],
            'plan_preview' => [
                'plan_id' => $parsed['plan_id'],
                'title' => $parsed['title'],
                'start_date' => $parsed['start_date'],
                'duration_weeks' => $parsed['duration_weeks'],
                'task_count' => $parsed['task_count'],
                'total_minutes' => $parsed['total_minutes'],
                'goal' => $parsed['goal']
            ]
        ]);
        break;

    // 5. Save / Import Plan (With optional password)
    case 'save_plan':
        $markdown = $_POST['markdown'] ?? $jsonBody['markdown'] ?? '';
        $customId = $_POST['custom_id'] ?? $jsonBody['custom_id'] ?? null;
        $password = $_POST['password'] ?? $jsonBody['password'] ?? null;

        // Check if file was uploaded
        if (isset($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
            $markdown = file_get_contents($_FILES['file']['tmp_name']);
        }

        if (empty(trim($markdown))) {
            json_response(['error' => 'No Markdown plan content provided'], 400);
        }

        $incoming = PlanParser::parse($markdown);
        $saveId = sanitize_plan_id($customId ?: $incoming['plan_id']);
        if (!$scoped && str_starts_with($saveId, 'ws2-')) json_response(['error'=>'ID nội bộ được dành riêng.'], 403);
        if (file_exists(PLANS_DIR . '/' . $saveId . '.json') && !PlanStorage::verifyAuthToken($saveId, $clientToken ?? '')) {
            json_response(['success' => false, 'errors' => ['Link này đã được bảo vệ. Hãy mở khóa hoặc tạo link mới.'], 'warnings' => []], 401);
        }
        $res = PlanStorage::savePlan($markdown, $customId, $password);
        if (!$res['success']) {
            json_response([
                'success' => false,
                'errors' => $res['errors'],
                'warnings' => $res['warnings']
            ], 422);
        }

        $planSlug = $res['plan_id'];
        $token = PlanStorage::generateAuthToken($planSlug);

        json_response([
            'success' => true,
            'plan_id' => $planSlug,
            'title' => $res['title'],
            'has_password' => !empty($password),
            'token' => $token,
            'dynamic_url' => $planSlug,
            'total_tasks' => $res['total_tasks'],
            'duration_weeks' => $res['duration_weeks'],
            'warnings' => $res['warnings']
        ]);
        break;

    // 6. Update Task Execution Status (Auth protected)
    case 'update_task':
        $planId = $_POST['p'] ?? $jsonBody['p'] ?? '';
        $taskId = $_POST['task_id'] ?? $jsonBody['task_id'] ?? '';
        $status = $_POST['status'] ?? $jsonBody['status'] ?? null;
        $subtasks = $jsonBody['subtasks'] ?? null;
        if ($subtasks !== null && !is_array($subtasks)) json_response(['error' => 'Invalid subtasks'], 422);
        $actualMin = isset($_POST['actual_minutes']) ? (int)$_POST['actual_minutes'] : ($jsonBody['actual_minutes'] ?? null);
        $notes = $_POST['notes'] ?? $jsonBody['notes'] ?? null;
        $description = $jsonBody['description'] ?? null;
        $noteCards = $jsonBody['note_cards'] ?? null;
        if (($description !== null && !is_string($description)) || ($noteCards !== null && !PlanValidator::validNoteCards($noteCards))) {
            json_response(['error' => 'Mỗi task có tối đa 2 ghi chú dạng văn bản.'], 422);
        }

        $title = isset($jsonBody['title']) ? (string)$jsonBody['title'] : (isset($_POST['title']) ? (string)$_POST['title'] : null);
        if ($title !== null && trim($title) === '') {
            json_response(['error' => 'Tên nhiệm vụ không được để trống'], 422);
        }

        if (empty($planId) || empty($taskId)) {
            json_response(['error' => 'Missing plan_id or task_id'], 400);
        }

        if (PlanStorage::hasPassword($planId) && !PlanStorage::isAuthorized($planId, $clientToken, $clientPassword)) {
            json_response(['error' => 'Unauthorized: Password required to update tasks'], 401);
        }

        $ok = PlanStorage::updateTask($planId, $taskId, $status, $actualMin, $notes, $subtasks, $description, $noteCards, $title);
        if (!$ok) {
            json_response(['error' => 'Failed to update task execution'], 500);
        }

        // Return updated stats
        $plan = PlanStorage::getPlan($planId);
        json_response([
            'success' => true,
            'task_id' => $taskId,
            'status' => $status,
            'stats' => $plan['stats'] ?? null
        ]);
        break;

    // 7. Export Updated Markdown (Auth protected)
    case 'export_markdown':
        $planId = $_GET['p'] ?? $_GET['plan_id'] ?? '';
        if (empty($planId)) {
            json_response(['error' => 'Missing plan ID'], 400);
        }

        if (PlanStorage::hasPassword($planId) && !PlanStorage::isAuthorized($planId, $clientToken, $clientPassword)) {
            json_response(['error' => 'Unauthorized: Password required'], 401);
        }

        $md = PlanStorage::exportUpdatedMarkdown($planId);
        if ($md === null) {
            json_response(['error' => 'Plan not found'], 404);
        }

        // Return as downloadable file if requested via browser
        if (isset($_GET['download'])) {
            header('Content-Type: text/markdown; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . sanitize_plan_id($planId) . '_updated.md"');
            echo $md;
            exit;
        }

        json_response(['success' => true, 'markdown' => $md]);
        break;

    // 8. Generate AI Adaptation Prompt (Auth protected)
    case 'get_adaptation_prompt':
        $planId = $_GET['p'] ?? $_GET['plan_id'] ?? '';
        if (empty($planId)) {
            json_response(['error' => 'Missing plan ID'], 400);
        }

        if (PlanStorage::hasPassword($planId) && !PlanStorage::isAuthorized($planId, $clientToken, $clientPassword)) {
            json_response(['error' => 'Unauthorized: Password required'], 401);
        }

        $plan = PlanStorage::getPlan($planId);
        if (!$plan) {
            json_response(['error' => 'Plan not found'], 404);
        }
        $prompt = AiAdapter::generateAdaptationPrompt($plan);
        json_response(['success' => true, 'prompt' => $prompt]);
        break;

    // 9. List Stored Plans
    case 'list_plans':
        $list = PlanStorage::listPlans();
        json_response(['success' => true, 'plans' => $list]);
        break;

    // 10. Load Built-in Example Plan
    case 'load_example':
        $name = sanitize_plan_id($_GET['name'] ?? 'ielts');
        $exampleFile = EXAMPLES_DIR . '/' . $name . '.md';
        if (!file_exists($exampleFile)) {
            json_response(['error' => 'Example not found: ' . htmlspecialchars($name)], 404);
        }
        $content = file_get_contents($exampleFile);
        json_response(['success' => true, 'markdown' => $content]);
        break;

    default:
        json_response([
            'app' => 'AI Plan Executor API',
            'version' => '1.1',
            'endpoints' => [
                'GET  ?action=get_plan&p=<id>',
                'POST ?action=verify_password',
                'POST ?action=set_password',
                'POST ?action=save_plan',
                'POST ?action=validate_preview',
                'POST ?action=update_task',
                'GET  ?action=export_markdown&p=<id>',
                'GET  ?action=get_adaptation_prompt&p=<id>',
                'GET  ?action=list_plans',
                'GET  ?action=load_example&name=<name>'
            ]
        ]);
        break;
}
