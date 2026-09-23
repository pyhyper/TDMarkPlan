<?php
/**
 * AiAdapter — Generates structured adaptation prompts for ChatGPT / Gemini
 * based on the user's real execution performance.
 */
class AiAdapter {

    /**
     * Generate prompt text to paste into ChatGPT or Gemini
     */
    public static function generateAdaptationPrompt(array $plan): string {
        $title = $plan['title'] ?? 'Personal Plan';
        $stats = $plan['stats'] ?? [];
        $objective = $plan['details']['objective'] ?? $title;
        $target = $plan['details']['target'] ?? '';
        $constraints = implode("\n- ", $plan['details']['constraints'] ?? []);

        $completionRate = $stats['completion_rate'] ?? 0;
        $totalTasks = $stats['total_tasks'] ?? 0;
        $completed = $stats['completed'] ?? 0;
        $skipped = $stats['skipped'] ?? 0;
        $failed = $stats['failed'] ?? 0;
        $plannedHours = round(($stats['planned_minutes_total'] ?? 0) / 60, 1);
        $actualHours = round(($stats['actual_minutes_total'] ?? 0) / 60, 1);

        // Analyze strong vs weak types
        $strongTypes = [];
        $weakTypes = [];
        foreach ($stats['type_breakdown'] ?? [] as $type => $data) {
            $total = $data['total'] ?? 0;
            $comp = $data['completed'] ?? 0;
            if ($total > 0) {
                $pct = round(($comp / $total) * 100);
                if ($pct >= 75) {
                    $strongTypes[] = "- " . ucfirst($type) . ": {$pct}% completed ({$comp}/{$total})";
                } elseif ($pct <= 50) {
                    $weakTypes[] = "- " . ucfirst($type) . ": {$pct}% completed ({$comp}/{$total}) — Need adjustment";
                }
            }
        }

        $missedList = '';
        if (!empty($stats['missed_tasks'])) {
            $missedList = "\nRecent Missed Tasks:\n";
            foreach (array_slice($stats['missed_tasks'], 0, 5) as $m) {
                $missedList .= "- Week {$m['week']} ({$m['date']}): {$m['title']} [{$m['type']}, {$m['duration']}m]\n";
            }
        }

        // Extract user notes and self-reports from tasks
        $userNotes = [];
        foreach ($plan['weeks'] ?? [] as $wNum => $w) {
            foreach ($w['days'] ?? [] as $d) {
                foreach ($d['tasks'] ?? [] as $t) {
                    if (!empty($t['notes'])) {
                        $userNotes[] = "- [{$d['day_name']} W{$wNum}] {$t['title']} ({$t['status']}): \"{$t['notes']}\"";
                    }
                }
            }
        }
        $notesSection = '';
        if (!empty($userNotes)) {
            $notesSection = "\n## Daily Study Notes & Self-Reports from User:\n" . implode("\n", $userNotes) . "\n";
        }

        $strongStr = !empty($strongTypes) ? implode("\n", $strongTypes) : "- None recorded yet";
        $weakStr = !empty($weakTypes) ? implode("\n", $weakTypes) : "- None recorded yet";

        $prompt = <<<EOT
I am executing my personal study/training plan using PLAN.md format.
Here is my actual execution performance data and personal notes tracked by the system:

# CURRENT PERFORMANCE REVIEW
- Plan Title: {$title}
- Main Goal: {$objective}
- Target: {$target}
- Overall Completion Rate: {$completionRate}% ({$completed} of {$totalTasks} tasks completed)
- Tasks Skipped: {$skipped}
- Tasks Failed: {$failed}
- Total Study Time: {$actualHours} hours actual vs {$plannedHours} hours planned

## Strong Areas (High completion):
{$strongStr}

## Weak / Bottleneck Areas (Low completion):
{$weakStr}
{$missedList}{$notesSection}
## Constraints & Preferences:
- {$constraints}

---

# INSTRUCTION FOR AI (ChatGPT / Gemini):
Based on this real-life execution data and my personal notes:
1. Analyze where I am struggling (session duration, difficult task types, or daily overload).
2. Take into account my specific notes and self-reports above to adjust upcoming tasks.
3. Propose specific rebalancing (e.g. reduce daily minutes, split longer sessions into 15-20 min chunks, or schedule targeted reviews).
4. CRITICAL: Output ONLY 1 single raw Markdown code block (````markdown ... ````) containing the complete updated PLAN.md with YAML frontmatter, with NO conversational filler before or after, so I can copy and import directly into the AI Plan Executor web reader.
EOT;

        $today = date('Y-m-d');
        $prompt .= "\nPreserve description and note_cards (at most two strings per task/subtask). Never invent new notes or subtasks: users create these themselves. Existing user-created subtasks and notes must remain intact.\n";
        $start = $plan['start_date'];
        $prompt .= "\n\nCurrent date: {$today}. User start date: {$start}.\n";
        $prompt .= "Keep the same frontmatter schema, unique task IDs, # Week N and ## English weekday headings. Each week is a 7-day window starting on start_date. Keep historical tasks and their status, actual_minutes, completed_at and JSON-quoted note metadata, plus subtasks (one-line JSON array of id, title, completed boolean, notes string); adjust upcoming tasks only. Set current_date to today. Return a complete PLAN.md file in one Markdown code block.\n\n# COMPLETE PLAN AND EXECUTION JOURNAL\n";
        if (!empty($plan['finance'])) $prompt .= "Finance: preserve finance_data, dated income/expense notes and assumptions. Emergency reserve target = essential monthly costs × months. FIRE target = annual costs / (rate/100). Distinguish essential and desired lifestyle budgets; do not treat the projection as guaranteed or double-count the reserve in invested assets.\n";
        $prompt .= PlanStorage::exportUpdatedMarkdown($plan['plan_id']) ?? $plan['raw_markdown'];
        return trim($prompt);
    }
}
