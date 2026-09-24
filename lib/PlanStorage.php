<?php
/**
 * PlanStorage — JSON and Markdown file-based storage for shared hosting.
 * Handles dynamic links (?p=plan_id), execution tracking, statistics, and markdown export.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/PlanParser.php';
require_once __DIR__ . '/PlanValidator.php';
require_once __DIR__ . '/FinanceTracker.php';
require_once __DIR__ . '/Workspace.php';

class PlanStorage {

    /**
     * Save a plan from raw Markdown
     * Returns dynamic ID and validation info
     */
    public static function savePlan(string $markdown, ?string $customId = null, ?string $password = null): array {
        $parsed = PlanParser::parse($markdown);
        $validation = PlanValidator::validate($parsed);

        if (!$validation['valid']) {
            return [
                'success' => false,
                'errors' => $validation['errors'],
                'warnings' => $validation['warnings']
            ];
        }

        // Determine dynamic ID
        $slug = sanitize_plan_id($customId ?: ($parsed['plan_id'] ?: ''));
        if (empty($slug)) {
            $slug = generate_dynamic_id($parsed['title']);
        }
        $parsed['plan_id'] = $slug;
        $markdown = $parsed['raw_markdown'];
        foreach (['plan_id' => $slug, 'current_date' => date('Y-m-d')] as $key => $value) {
            if (preg_match('/^' . $key . ':.*$/m', $markdown)) {
                $markdown = preg_replace('/^' . $key . ':.*$/m', $key . ': ' . $value, $markdown, 1);
            } else {
                $markdown = preg_replace('/^---\n/', "---\n$key: $value\n", $markdown, 1);
            }
        }
        $parsed['raw_markdown'] = $markdown;
        $parsed['current_date'] = date('Y-m-d');

        $existingFile = PLANS_DIR . '/' . $slug . '.json';
        if (file_exists($existingFile)) {
            $existing = json_decode(file_get_contents($existingFile), true);
            if (!empty($existing['password_hash'])) $parsed['password_hash'] = $existing['password_hash'];
            if (!isset($parsed['auto_delete_days']) && isset($existing['auto_delete_days'])) {
                $parsed['auto_delete_days'] = (int)$existing['auto_delete_days'];
                if (!empty($existing['auto_delete_at'])) {
                    $parsed['auto_delete_at'] = $existing['auto_delete_at'];
                }
            }
        }
        if (!isset($parsed['auto_delete_days'])) {
            $parsed['auto_delete_days'] = 90;
            $parsed['auto_delete_at'] = date('c', time() + 90 * 86400);
        } elseif ($parsed['auto_delete_days'] === 0) {
            unset($parsed['auto_delete_at']);
        } elseif (empty($parsed['auto_delete_at'])) {
            $parsed['auto_delete_at'] = date('c', time() + $parsed['auto_delete_days'] * 86400);
        }
        // Save password hash if provided
        if (!empty($password)) {
            $parsed['password_hash'] = password_hash(trim($password), PASSWORD_DEFAULT);
        }

        // Save parsed JSON and original Markdown
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        $mdFile = PLANS_DIR . '/' . $slug . '.md';
        $execFile = EXEC_DIR . '/' . $slug . '.json';

        file_put_contents($jsonFile, json_encode($parsed, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        file_put_contents($mdFile, $markdown);

        // Initialize execution state if not already existing
        if (!file_exists($execFile)) {
            $initialExec = [
                'plan_id' => $slug,
                'created_at' => date('c'),
                'updated_at' => date('c'),
                'tasks' => [],
                'finance' => $parsed['finance'] ?? null
            ];

            // Restore the full journal from imported Markdown.
            foreach ($parsed['weeks'] as $w) {
                foreach ($w['days'] as $d) {
                    foreach ($d['tasks'] as $t) {
                        $initialExec['tasks'][$t['id']] = [
                            'status' => $t['status'],
                            'actual_minutes' => $t['actual_minutes'],
                            'completed_at' => $t['completed_at'],
                            'subtasks' => $t['subtasks'] ?? [],
                            'description' => $t['description'] ?? '',
                            'note_cards' => $t['note_cards'] ?? ($t['notes'] !== '' ? [$t['notes']] : []),
                            'notes' => $t['notes']
                        ];
                    }
                }
            }

            file_put_contents($execFile, json_encode($initialExec, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        }

        return [
            'success' => true,
            'plan_id' => $slug,
            'title' => $parsed['title'],
            'warnings' => $validation['warnings'],
            'total_tasks' => $validation['total_tasks'],
            'duration_weeks' => $parsed['duration_weeks']
        ];
    }

    /**
     * Get plan data merged with current execution states
     */
    public static function getPlan(string $planId): ?array {
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        $execFile = EXEC_DIR . '/' . $slug . '.json';

        if (!file_exists($jsonFile)) {
            return null;
        }

        $plan = json_decode(file_get_contents($jsonFile), true);
        if (!$plan || !empty($plan['redirect_to'])) return null;

        // Auto-delete expiration check
        if (!empty($plan['auto_delete_at']) && time() >= strtotime($plan['auto_delete_at'])) {
            @unlink($jsonFile);
            @unlink(PLANS_DIR . '/' . $slug . '.md');
            @unlink($execFile);
            return null;
        }

        if (!isset($plan['auto_delete_days'])) {
            $plan['auto_delete_days'] = 90;
            if (empty($plan['auto_delete_at'])) {
                $plan['auto_delete_at'] = date('c', time() + 90 * 86400);
            }
        }

        $executions = [];
        if (file_exists($execFile)) {
            $execData = json_decode(file_get_contents($execFile), true);
            $executions = $execData['tasks'] ?? [];
        }

        $plan['finance'] = $execData['finance'] ?? $plan['finance'] ?? null;
        $plan['notebook'] = $execData['notebook'] ?? $plan['notebook'] ?? null;

        // Merge execution state into each task
        foreach ($plan['weeks'] as &$w) {
            foreach ($w['days'] as &$d) {
                foreach ($d['tasks'] as &$t) {
                    $tid = $t['id'];
                    $exec = $executions[$tid] ?? null;
                    $t['status'] = $exec['status'] ?? 'pending';
                    $t['actual_minutes'] = $exec['actual_minutes'] ?? 0;
                    $t['completed_at'] = $exec['completed_at'] ?? null;
                    $t['notes'] = $exec['notes'] ?? $t['notes'] ?? '';
                    $t['description'] = $exec['description'] ?? $t['description'] ?? '';
                    $t['note_cards'] = $exec['note_cards'] ?? $t['note_cards'] ?? ($t['notes'] !== '' ? [$t['notes']] : []);
                    $t['subtasks'] = $exec['subtasks'] ?? $t['subtasks'] ?? [];
                    if (!empty($exec['title'])) $t['title'] = $exec['title'];
                }
            }
        }
        unset($w, $d, $t);

        // Attach calculated statistics
        $plan['stats'] = self::calculateStats($plan, $executions);

        // Indicate password protection without leaking the hash
        $plan['has_password'] = !empty($plan['password_hash']);
        unset($plan['password_hash']);

        return $plan;
    }

    /**
     * Update execution state for a specific task
     */
    public static function updateTask(string $planId, string $taskId, ?string $status, ?int $actualMinutes = null, ?string $notes = null, ?array $subtasks = null, ?string $description = null, ?array $noteCards = null, ?string $title = null): bool {
        if ($noteCards !== null && !PlanValidator::validNoteCards($noteCards)) return false;
        $slug = sanitize_plan_id($planId);
        $execFile = EXEC_DIR . '/' . $slug . '.json';
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';

        if (!file_exists($jsonFile)) {
            return false;
        }

        $execData = ['plan_id' => $slug, 'tasks' => []];
        if (file_exists($execFile)) {
            $execData = json_decode(file_get_contents($execFile), true) ?: $execData;
        }

        $plan = self::getPlan($slug);
        if (!$plan || ($plan['domain'] ?? '') === 'finance') return false;
        $found = null;
        foreach ($plan['weeks'] as $week) foreach ($week['days'] as $day) foreach ($day['tasks'] as $task) {
            if ($task['id'] === $taskId) $found = $task;
        }
        if (!$found) return false;
        if ($subtasks !== null) {
            $candidate = $plan;
            foreach ($candidate['weeks'] as &$week) foreach ($week['days'] as &$day) foreach ($day['tasks'] as &$task) {
                if ($task['id'] === $taskId) $task['subtasks'] = $subtasks;
            }
            unset($week, $day, $task);
            if (!PlanValidator::validate($candidate)['valid']) return false;
        }
        $status = $status ?? $found['status'];
        $validStatuses = ['pending', 'in_progress', 'completed', 'skipped', 'failed'];
        if (!in_array($status, $validStatuses, true)) {
            $status = 'pending';
        }

        $prev = $execData['tasks'][$taskId] ?? [];
        $cards = $noteCards ?? $prev['note_cards'] ?? $found['note_cards'];
        if ($notes !== null && $noteCards === null) {
            if ($notes !== '' || count($cards) > 0) $cards[0] = $notes;
        }

        $record = [
            'status' => $status,
            'actual_minutes' => $actualMinutes !== null ? (int)$actualMinutes : ($prev['actual_minutes'] ?? 0),
            'subtasks' => $subtasks ?? $prev['subtasks'] ?? $found['subtasks'] ?? [],
            'notes' => $cards[0] ?? '',
            'note_cards' => $cards,
            'description' => $description ?? $prev['description'] ?? $found['description'],
            'title' => $title !== null ? trim($title) : ($prev['title'] ?? $found['title'] ?? null),
            'updated_at' => date('c')
        ];

        if ($status === 'completed' && empty($prev['completed_at'])) {
            $record['completed_at'] = date('c');
        } elseif ($status !== 'completed') {
            $record['completed_at'] = null;
        } else {
            $record['completed_at'] = $prev['completed_at'] ?? date('c');
        }

        $execData['tasks'][$taskId] = $record;
        $execData['updated_at'] = date('c');

        file_put_contents($execFile, json_encode($execData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return true;
    }

    /**
     * Update plan title
     */
    public static function updatePlanTitle(string $planId, string $newTitle): bool {
        $cleanTitle = trim($newTitle);
        if ($cleanTitle === '' || mb_strlen($cleanTitle) > 200) {
            return false;
        }

        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        $mdFile = PLANS_DIR . '/' . $slug . '.md';

        if (!file_exists($jsonFile)) {
            return false;
        }

        $plan = json_decode(file_get_contents($jsonFile), true);
        if (!$plan) {
            return false;
        }

        $plan['title'] = $cleanTitle;

        if (!empty($plan['raw_markdown'])) {
            if (preg_match('/^title:.*$/m', $plan['raw_markdown'])) {
                $plan['raw_markdown'] = preg_replace('/^title:.*$/m', 'title: ' . $cleanTitle, $plan['raw_markdown'], 1);
            } else {
                $plan['raw_markdown'] = preg_replace('/^---\n/', "---\ntitle: " . $cleanTitle . "\n", $plan['raw_markdown'], 1);
            }
        }

        file_put_contents($jsonFile, json_encode($plan, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        if (file_exists($mdFile)) {
            $md = file_get_contents($mdFile);
            if (preg_match('/^title:.*$/m', $md)) {
                $md = preg_replace('/^title:.*$/m', 'title: ' . $cleanTitle, $md, 1);
            } else {
                $md = preg_replace('/^---\n/', "---\ntitle: " . $cleanTitle . "\n", $md, 1);
            }
            file_put_contents($mdFile, $md);
        }

        return true;
    }

    /**
     * Calculate comprehensive statistics:
     * - Completion rates (today, this week, overall)
     * - Time spent vs planned
     * - Streak
     * - Missed tasks
     * - Performance breakdown by task type
     */
    public static function calculateStats(array $plan, array $executions): array {
        $today = date('Y-m-d');
        $totalTasks = 0;
        $completedCount = 0;
        $skippedCount = 0;
        $failedCount = 0;
        $inProgressCount = 0;
        $pendingCount = 0;

        $plannedMinutesTotal = 0;
        $actualMinutesTotal = 0;

        $typeStats = [];
        $dayCompletions = []; // [date => ['total' => int, 'completed' => int]]
        $missedTasks = [];

        foreach ($plan['weeks'] as $weekNum => $week) {
            foreach ($week['days'] as $dayKey => $day) {
                $dayDate = $day['date'];
                if (!isset($dayCompletions[$dayDate])) {
                    $dayCompletions[$dayDate] = ['total' => 0, 'completed' => 0];
                }

                foreach ($day['tasks'] as $task) {
                    $totalTasks++;
                    $duration = (int)($task['duration'] ?? 0);
                    $plannedMinutesTotal += $duration;

                    $status = $task['status'] ?? 'pending';
                    $actualMin = (int)($task['actual_minutes'] ?? 0);
                    $actualMinutesTotal += ($status === 'completed' ? ($actualMin ?: $duration) : $actualMin);

                    $type = $task['type'] ?? 'custom';
                    if (!isset($typeStats[$type])) {
                        $typeStats[$type] = ['planned_min' => 0, 'actual_min' => 0, 'total' => 0, 'completed' => 0];
                    }
                    $typeStats[$type]['total']++;
                    $typeStats[$type]['planned_min'] += $duration;

                    $dayCompletions[$dayDate]['total']++;

                    switch ($status) {
                        case 'completed':
                            $completedCount++;
                            $typeStats[$type]['completed']++;
                            $typeStats[$type]['actual_min'] += ($actualMin ?: $duration);
                            $dayCompletions[$dayDate]['completed']++;
                            break;
                        case 'skipped':
                            $skippedCount++;
                            break;
                        case 'failed':
                            $failedCount++;
                            break;
                        case 'in_progress':
                            $inProgressCount++;
                            break;
                        default:
                            $pendingCount++;
                            // Check if missed (past day and still pending)
                            if ($dayDate < $today) {
                                $missedTasks[] = [
                                    'id' => $task['id'],
                                    'title' => $task['title'],
                                    'date' => $dayDate,
                                    'week' => $weekNum,
                                    'duration' => $duration,
                                    'type' => $type
                                ];
                            }
                            break;
                    }
                }
            }
        }

        // Overall progress percentage
        $overallPct = $totalTasks > 0 ? round(($completedCount / $totalTasks) * 100) : 0;

        // Calculate Streak (consecutive days leading to today or yesterday with at least 1 completed task)
        $streak = 0;
        $checkDate = new DateTime($today);
        // If today has completions, start from today, else start from yesterday
        $todayStr = $checkDate->format('Y-m-d');
        if (empty($dayCompletions[$todayStr]['completed'])) {
            $checkDate->modify('-1 day');
        }

        for ($i = 0; $i < 365; $i++) {
            $dtStr = $checkDate->format('Y-m-d');
            if (!empty($dayCompletions[$dtStr]['completed']) && $dayCompletions[$dtStr]['completed'] > 0) {
                $streak++;
                $checkDate->modify('-1 day');
            } else {
                break;
            }
        }

        return [
            'total_tasks' => $totalTasks,
            'completed' => $completedCount,
            'skipped' => $skippedCount,
            'failed' => $failedCount,
            'in_progress' => $inProgressCount,
            'pending' => $pendingCount,
            'completion_rate' => $overallPct,
            'planned_minutes_total' => $plannedMinutesTotal,
            'actual_minutes_total' => $actualMinutesTotal,
            'streak' => $streak,
            'missed_tasks_count' => count($missedTasks),
            'missed_tasks' => array_slice($missedTasks, 0, 10),
            'type_breakdown' => $typeStats
        ];
    }

    /**
     * Export updated Markdown with completed tasks checked: - [x]
     */
    public static function exportUpdatedMarkdown(string $planId): ?string {
        $slug = sanitize_plan_id($planId);
        $mdFile = PLANS_DIR . '/' . $slug . '.md';
        $execFile = EXEC_DIR . '/' . $slug . '.json';

        if (!file_exists($mdFile)) {
            return null;
        }

        $plan = self::getPlan($slug);
        if (!$plan) return null;
        $md = $plan['raw_markdown'];
        $today = date('Y-m-d');
        $autoDelVal = isset($plan['auto_delete_days']) ? (int)$plan['auto_delete_days'] : 90;
        foreach (['plan_id' => $slug, 'current_date' => $today, 'auto_delete_days' => $autoDelVal] as $key => $value) {
            if (preg_match('/^' . $key . ':.*$/m', $md)) {
                $md = preg_replace('/^' . $key . ':.*$/m', $key . ': ' . $value, $md, 1);
            } else {
                $md = preg_replace('/^---\n/', "---\n$key: $value\n", $md, 1);
            }
        }
        if (!empty($plan['finance'])) {
            $financeLine = 'finance_data: ' . json_encode($plan['finance'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (preg_match('/^finance_data:.*$/m', $md)) {
                $md = preg_replace_callback('/^finance_data:.*$/m', function () use ($financeLine) { return $financeLine; }, $md, 1);
            } else {
                $md = preg_replace_callback('/^---\n/', function () use ($financeLine) { return "---\n" . $financeLine . "\n"; }, $md, 1);
            }
        }
        $tasks = [];
        foreach ($plan['weeks'] as $week) {
            foreach ($week['days'] as $day) {
                foreach ($day['tasks'] as $task) $tasks[] = $task;
            }
        }
        $index = 0;
        return preg_replace_callback('/^[-*]\s*\[[ xX]\][^\n]*(?:\n(?![-*]\s*\[|#)[^\n]*)*/m', function ($match) use (&$index, $tasks) {
            $task = $tasks[$index++] ?? null;
            if (!$task) return $match[0];
            $block = preg_replace('/^(\s*[-*]\s*\[)[ xX](\])/', '${1}' . ($task['status'] === 'completed' ? 'x' : ' ') . '${2}', $match[0]);
            $block = preg_replace('/^\s*[-*]\s*(?:note|note_cards|description|status|actual_minutes|completed_at|subtasks):[^\n]*\n?/m', '', $block);
            $block = rtrim($block);
            $block .= "\n  - status: " . $task['status'];
            $block .= "\n  - actual_minutes: " . $task['actual_minutes'];
            if ($task['completed_at']) $block .= "\n  - completed_at: " . $task['completed_at'];
            $block .= "\n  - note: " . json_encode($task['notes'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $block .= "\n  - note_cards: " . json_encode($task['note_cards'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $block .= "\n  - description: " . json_encode($task['description'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $block .= "\n  - subtasks: " . json_encode($task['subtasks'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            return $block . "\n\n";
        }, $md);
    }

    /**
     * List all available plans
     */
    public static function listPlans(): array {
        $files = glob(PLANS_DIR . '/*.json');
        $list = [];

        foreach ($files as $file) {
            $id = basename($file, '.json');
            if (str_starts_with($id, 'ws2-')) continue;
            $data = json_decode(file_get_contents($file), true);
            if ($data && empty($data['redirect_to'])) {
                $execFile = EXEC_DIR . '/' . $id . '.json';
                $completed = 0;
                if (file_exists($execFile)) {
                    $ex = json_decode(file_get_contents($execFile), true);
                    foreach ($ex['tasks'] ?? [] as $t) {
                        if (($t['status'] ?? '') === 'completed') $completed++;
                    }
                }
                $list[] = [
                    'plan_id' => $id,
                    'title' => $data['title'] ?? 'Untitled Plan',
                    'start_date' => $data['start_date'] ?? '',
                    'duration_weeks' => $data['duration_weeks'] ?? 0,
                    'total_tasks' => $data['task_count'] ?? 0,
                    'completed_tasks' => $completed
                ];
            }
        }

        return $list;
    }

    /**
     * Check if a plan has a password configured
     */
    public static function hasPassword(string $planId): bool {
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        if (!file_exists($jsonFile)) return false;
        $data = json_decode(file_get_contents($jsonFile), true);
        return !empty($data['password_hash']);
    }

    /**
     * Verify plain password against plan's stored hash
     */
    public static function verifyPassword(string $planId, string $password): bool {
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        if (!file_exists($jsonFile)) return false;
        $data = json_decode(file_get_contents($jsonFile), true);
        if (empty($data['password_hash'])) return true;
        return password_verify(trim($password), $data['password_hash']);
    }

    /**
     * Generate an authentication token for verified sessions
     */
    public static function generateAuthToken(string $planId): string {
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        $hash = 'public';
        if (file_exists($jsonFile)) {
            $data = json_decode(file_get_contents($jsonFile), true);
            $hash = $data['password_hash'] ?? 'public';
        }
        return hash_hmac('sha256', $slug . ':' . $hash, 'ereader_plan_secret_salt_2026');
    }

    /**
     * Verify an authentication token
     */
    public static function verifyAuthToken(string $planId, string $token): bool {
        if (empty($token)) return false;
        $expected = self::generateAuthToken($planId);
        return hash_equals($expected, $token);
    }

    /**
     * Check if request is authorized (either no password required, valid token, or valid password)
     */
    public static function isAuthorized(string $planId, ?string $token = null, ?string $password = null): bool {
        if (!self::hasPassword($planId)) {
            return true;
        }
        if (!empty($token) && self::verifyAuthToken($planId, $token)) {
            return true;
        }
        if (!empty($password) && self::verifyPassword($planId, $password)) {
            return true;
        }
        return false;
    }

    /**
     * Set, update, or remove password for an existing plan
     */
    public static function setPassword(string $planId, string $newPassword, ?string $currentPassword = null): array {
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        if (!file_exists($jsonFile)) {
            Workspace::createNotebook($slug, $slug, null, 90);
            if (!file_exists($jsonFile)) {
                return ['success' => false, 'error' => 'Plan not found'];
            }
        }

        $data = json_decode(file_get_contents($jsonFile), true);
        $hasPass = !empty($data['password_hash']);

        if ($hasPass) {
            if (empty($currentPassword) || !password_verify(trim($currentPassword), $data['password_hash'])) {
                return ['success' => false, 'error' => 'Current password is incorrect'];
            }
        }

        $trimmed = trim($newPassword);
        if ($trimmed === '') {
            unset($data['password_hash']);
        } else {
            $data['password_hash'] = password_hash($trimmed, PASSWORD_DEFAULT);
        }

        file_put_contents($jsonFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        $token = self::generateAuthToken($slug);

        return [
            'success' => true,
            'has_password' => !empty($data['password_hash']),
            'token' => $token,
            'message' => empty($data['password_hash']) ? 'Đã gỡ bỏ mật khẩu bảo vệ' : 'Đã cập nhật mật khẩu thành công'
        ];
    }

    /**
     * Set or clear plan auto-delete retention in days
     */
    public static function setAutoDelete(string $planId, int $days): array {
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        if (!file_exists($jsonFile)) {
            Workspace::createNotebook($slug, $slug, null, $days);
            if (!file_exists($jsonFile)) {
                return ['success' => false, 'error' => 'Plan not found'];
            }
        }
        $data = json_decode(file_get_contents($jsonFile), true);
        if ($days > 0) {
            $data['auto_delete_days'] = $days;
            $data['auto_delete_at'] = date('c', time() + $days * 86400);
        } else {
            $data['auto_delete_days'] = 0;
            unset($data['auto_delete_at']);
        }

        // Update raw_markdown if present
        $mdFile = PLANS_DIR . '/' . $slug . '.md';
        if (file_exists($mdFile)) {
            $md = file_get_contents($mdFile);
            $retentionVal = $days > 0 ? $days : 0;
            if (preg_match('/^auto_delete_days:.*$/m', $md)) {
                $md = preg_replace('/^auto_delete_days:.*$/m', 'auto_delete_days: ' . $retentionVal, $md, 1);
            } else {
                $md = preg_replace('/^---\n/', "---\nauto_delete_days: " . $retentionVal . "\n", $md, 1);
            }
            file_put_contents($mdFile, $md);
            $data['raw_markdown'] = $md;
        }

        file_put_contents($jsonFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        // Sync to child slot 2 if exists
        $childId = Workspace::childId($slug);
        $childFile = PLANS_DIR . '/' . $childId . '.json';
        if (file_exists($childFile)) {
            $childData = json_decode(file_get_contents($childFile), true);
            $childData['auto_delete_days'] = $data['auto_delete_days'];
            if (isset($data['auto_delete_at'])) {
                $childData['auto_delete_at'] = $data['auto_delete_at'];
            } else {
                unset($childData['auto_delete_at']);
            }
            file_put_contents($childFile, json_encode($childData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        }

        return [
            'success' => true,
            'auto_delete_days' => $days > 0 ? $days : 0,
            'auto_delete_at' => $data['auto_delete_at'] ?? null,
            'message' => $days > 0 ? "Plan sẽ tự động xóa sau $days ngày" : 'Đã tắt tính năng tự động xóa (Giữ vĩnh viễn)'
        ];
    }

    /**
     * Delete a plan and its executions permanently
     */
    public static function deletePlan(string $planId): bool {
        $slug = sanitize_plan_id($planId);
        $jsonFile = PLANS_DIR . '/' . $slug . '.json';
        if (!file_exists($jsonFile)) {
            return false;
        }
        @unlink($jsonFile);
        @unlink(PLANS_DIR . '/' . $slug . '.md');
        @unlink(EXEC_DIR . '/' . $slug . '.json');
        return true;
    }
}
