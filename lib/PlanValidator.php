<?php
/**
 * PlanValidator — Validates parsed PLAN.md data against specification rules.
 */
class PlanValidator {
    public static function validNoteCards($cards): bool {
        if (!is_array($cards) || count($cards) > 2 || array_values($cards) !== $cards) return false;
        foreach ($cards as $card) if (!is_string($card)) return false;
        return true;
    }

    // Supported standard task types from the spec
    public const STANDARD_TYPES = [
        'reading', 'writing', 'listening', 'speaking',
        'vocabulary', 'grammar', 'coding', 'exercise',
        'review', 'research', 'project', 'custom'
    ];

    /**
     * Validate plan array
     * @return array ['valid' => bool, 'errors' => string[], 'warnings' => string[]]
     */
    public static function validate(array $plan): array {
        $errors = [];
        $warnings = [];

        if (!empty($plan['finance'])) {
            require_once __DIR__ . '/FinanceTracker.php';
            if (!FinanceTracker::validate($plan['finance'])) $errors[] = 'Invalid finance_data.';
        }

        // 1. Validate Plan ID
        if (empty($plan['plan_id'])) {
            $warnings[] = 'Missing "plan_id" in frontmatter. A dynamic ID will be assigned.';
        }

        // 2. Validate Title
        if (empty($plan['title'])) {
            $errors[] = 'Missing plan title or goal objective.';
        }

        // 3. Validate Start Date
        if (empty($plan['start_date'])) {
            $errors[] = 'Missing "start_date" in frontmatter (expected YYYY-MM-DD).';
        } else {
            $d = DateTime::createFromFormat('Y-m-d', $plan['start_date']);
            if (!$d || $d->format('Y-m-d') !== $plan['start_date']) {
                $errors[] = 'Invalid "start_date" format (' . htmlspecialchars($plan['start_date']) . '). Expected format: YYYY-MM-DD.';
            }
        }

        // 4. Validate Duration Weeks
        if (empty($plan['duration_weeks']) || (int)$plan['duration_weeks'] <= 0) {
            $warnings[] = 'duration_weeks is missing or <= 0. Inferred from week count.';
        }

        // 5. Validate Weeks and Tasks
        $weeks = $plan['weeks'] ?? [];
        if (empty($weeks)) {
            $errors[] = 'No weekly schedules found in plan. Expected headers like "# Week 1".';
        }

        $taskIds = [];
        $totalTasks = 0;

        foreach ($weeks as $weekNum => $weekData) {
            $days = $weekData['days'] ?? [];
            if (empty($days)) {
                $warnings[] = "Week {$weekNum} has no days specified.";
            }

            foreach ($days as $dayKey => $dayData) {
                $tasks = $dayData['tasks'] ?? [];
                foreach ($tasks as $task) {
                    $totalTasks++;
                    $taskId = $task['id'] ?? '';
                    $title = $task['title'] ?? 'Untitled';
                    $duration = $task['duration'] ?? 0;
                    $type = $task['type'] ?? 'custom';

                    // Check Task ID
                    if (empty($taskId)) {
                        $errors[] = "Task '{$title}' in Week {$weekNum} ({$dayData['day_name']}) has no id.";
                    } elseif (isset($taskIds[$taskId])) {
                        $errors[] = "Duplicate task ID detected: '{$taskId}' (Week {$weekNum}, {$dayData['day_name']}). Task IDs must be unique.";
                    } else {
                        $taskIds[$taskId] = true;
                    }

                    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $taskId)) {
                        $errors[] = 'Task IDs may contain only letters, numbers, hyphens and underscores.';
                    }
                    if (!in_array($task['status'] ?? 'pending', ['pending', 'in_progress', 'completed', 'skipped', 'failed'], true)) {
                        $errors[] = "Invalid status for task '{$taskId}'.";
                    }
                    $subtasks = $task['subtasks'] ?? [];
                    if (!is_string($task['description'] ?? '') || (isset($task['note_cards']) && !self::validNoteCards($task['note_cards']))) {
                        $errors[] = "Task '{$taskId}' requires a text description and at most two notes.";
                    }
                    $subIds = [];
                    if (!is_array($subtasks) || count($subtasks) > 100) {
                        $errors[] = "Invalid subtasks for '{$taskId}'.";
                    } else {
                        foreach ($subtasks as $sub) {
                            if (isset($sub['note_cards']) && !self::validNoteCards($sub['note_cards'])) $errors[] = 'Mỗi subtask có tối đa 2 ghi chú.';
                            if (!is_array($sub) || !is_string($sub['id'] ?? null) || !preg_match('/^[a-zA-Z0-9_-]+$/', $sub['id']) || isset($subIds[$sub['id']]) || !is_string($sub['title'] ?? null) || trim($sub['title']) === '' || !is_string($sub['notes'] ?? null) || !is_bool($sub['completed'] ?? null)) {
                                $errors[] = "Invalid subtask in '{$taskId}': use unique id, title, notes and boolean completed.";
                            } else { $subIds[$sub['id']] = true; }
                        }
                    }
                    // Check Duration
                    if ($duration <= 0) {
                        $errors[] = "Task '{$title}' ({$taskId}) has invalid duration ({$duration}). Duration must be greater than 0 minutes.";
                    }

                    // Check Type
                    if (!in_array($type, self::STANDARD_TYPES, true)) {
                        $warnings[] = "Task '{$title}' ({$taskId}) uses custom type '{$type}'.";
                    }
                }
            }
        }

        if ($totalTasks === 0) {
            $errors[] = 'Plan contains 0 executable tasks. Ensure tasks are formatted like: "- [ ] Task name".';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'total_tasks' => $totalTasks
        ];
    }
}
