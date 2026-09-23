<?php
class FinanceTracker {
    public static function create(string $id, array $data, ?string $password = null): bool {
        if (!self::validate($data)) return false;
        $slug = sanitize_plan_id($id);
        if ($slug === '') return false;

        $planFile = PLANS_DIR . '/' . $slug . '.json';
        $execFile = EXEC_DIR . '/' . $slug . '.json';
        $plan = [
            'plan_id' => $slug,
            'title' => 'Tài chính cá nhân & FIRE',
            'domain' => 'finance',
            'timezone' => 'Asia/Ho_Chi_Minh',
            'created_at' => date('c'),
            'start_date' => date('Y-m-d'),
            'duration_weeks' => 0,
            'weeks' => [],
            'task_count' => 0,
            'total_minutes' => 0,
            'raw_markdown' => ''
        ];
        if ($password !== null && trim($password) !== '') {
            $plan['password_hash'] = password_hash(trim($password), PASSWORD_DEFAULT);
        }
        $exec = [
            'plan_id' => $slug,
            'created_at' => date('c'),
            'updated_at' => date('c'),
            'tasks' => [],
            'finance' => $data
        ];

        $handle = @fopen($planFile, 'x');
        if (!$handle) return false;
        $saved = fwrite($handle, json_encode($plan, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) !== false;
        fclose($handle);
        return $saved && file_put_contents($execFile, json_encode($exec, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
    }

    public static function validate($data): bool {
        if (!is_array($data)) return false;
        if (isset($data['analysis']) && !is_string($data['analysis'])) return false;
        if (isset($data['profile'])) {
            if (!is_array($data['profile'])) return false;
            foreach ($data['profile'] as $answer) if (!is_string($answer)) return false;
        }
        foreach (['essential', 'lifestyle', 'reserve', 'assets', 'debt', 'months', 'rate'] as $key) {
            if (!isset($data[$key]) || !is_numeric($data[$key]) || !is_finite((float)$data[$key]) || $data[$key] < 0 || $data[$key] > 1e15) return false;
        }
        if ($data['essential'] <= 0 || $data['lifestyle'] < $data['essential'] || $data['months'] < 1 || $data['months'] > 36 || $data['rate'] < 1 || $data['rate'] > 10) return false;
        if (!is_array($data['entries'] ?? null) || count($data['entries']) > 5000 || !is_string($data['notes'] ?? null)) return false;
        foreach ($data['entries'] as $entry) {
            if (!is_array($entry) || !in_array($entry['type'] ?? '', ['income', 'expense'], true) || !is_numeric($entry['amount'] ?? null) || !is_finite((float)$entry['amount']) || $entry['amount'] <= 0 || $entry['amount'] > 1e15 || !is_string($entry['category'] ?? null) || !is_string($entry['notes'] ?? null)) return false;
            $date = DateTime::createFromFormat('!Y-m-d', $entry['date'] ?? '');
            if (!$date || $date->format('Y-m-d') !== $entry['date']) return false;
        }
        return true;
    }
    public static function save(string $id, array $data): bool {
        if (!self::validate($data)) return false;
        $path = EXEC_DIR . '/' . sanitize_plan_id($id) . '.json';
        $handle = fopen($path, 'c+');
        if (!$handle) return false;
        flock($handle, LOCK_EX);
        $state = json_decode(stream_get_contents($handle), true) ?: ['plan_id' => $id, 'tasks' => []];
        $state['finance'] = $data;
        $state['updated_at'] = date('c');
        rewind($handle);
        ftruncate($handle, 0);
        $ok = fwrite($handle, json_encode($state, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) !== false;
        flock($handle, LOCK_UN);
        fclose($handle);
        return $ok;
    }
}
