<?php
/** Two plan slots share one public link and its PIN. Internal IDs are never public routes. */
class Workspace {
    public static function childId(string $root): string { return 'ws2-' . substr(hash('sha256', $root), 0, 48); }
    public static function summaries(string $root): array {
        $items = [];
        foreach ([1 => $root, 2 => self::childId($root)] as $slot => $id) {
            $path = PLANS_DIR . '/' . $id . '.json';
            $plan = is_file($path) ? json_decode(file_get_contents($path), true) : null;
            $items[] = ['slot'=>$slot, 'exists'=>!!$plan, 'title'=>$plan['title'] ?? 'Plan trống', 'domain'=>$plan['domain'] ?? ''];
        }
        return $items;
    }
    public static function createNotebook(string $id, string $title, ?string $password, int $autoDeleteDays = 90): bool {
        $file = PLANS_DIR . '/' . $id . '.json';
        $handle = @fopen($file, 'x');
        if (!$handle) return false;
        $plan = [
            'plan_id'=>$id,
            'title'=>$title ?: 'Sổ ghi chú',
            'domain'=>'notebook',
            'start_date'=>date('Y-m-d'),
            'duration_weeks'=>1,
            'weeks'=>[],
            'task_count'=>0,
            'notebook'=>['notes'=>[]],
            'auto_delete_days'=>$autoDeleteDays
        ];
        if ($autoDeleteDays > 0) {
            $plan['auto_delete_at'] = date('c', time() + $autoDeleteDays * 86400);
        }
        if ($password) $plan['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        fwrite($handle, json_encode($plan, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)); fclose($handle);
        file_put_contents(EXEC_DIR . '/' . $id . '.json', json_encode(['tasks'=>[], 'notebook'=>['notes'=>[]]]));
        return true;
    }
    public static function saveNotebook(string $id, array $notes): bool {
        $plan = PlanStorage::getPlan($id);
        if (!$plan) {
            self::createNotebook($id, $id, null, 90);
            $plan = PlanStorage::getPlan($id);
        }
        if (!$plan || !PlanValidator::validNoteCards($notes)) return false;
        $path = EXEC_DIR . '/' . $id . '.json';
        $data = file_exists($path) ? (json_decode(file_get_contents($path), true) ?: ['tasks'=>[]]) : ['tasks'=>[]];
        $data['notebook'] = ['notes'=>$notes, 'updated_at'=>date('c')];
        return file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
    }
}
