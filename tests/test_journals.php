<?php
require_once __DIR__ . '/../lib/PlanStorage.php';
function verify_journal($ok, $message) {
    if (!$ok) throw new RuntimeException($message);
    echo "PASS: $message\n";
}
$id = 'journal-test-' . bin2hex(random_bytes(6));
$ids = [$id, $id . '-copy', $id . '-finance'];
try {
    $markdown = "---\nplan_id: $id\ntitle: Journal test\nstart_date: 2026-09-23\nduration_weeks: 1\n---\n# Week 1\n## Wednesday\n- [ ] Task\n  - id: task-1\n  - duration: 20\n  - note: \"legacy note\"\n";
    verify_journal(PlanStorage::savePlan($markdown, $id, 'qa-pin-246810')['success'], 'Create protected fixture');
    $task = PlanStorage::getPlan($id)['weeks'][1]['days']['wednesday']['tasks'][0];
    verify_journal($task['note_cards'] === ['legacy note'] && $task['subtasks'] === [], 'Legacy note migrates and no subtasks are created');
    $cards = ["First\nline", 'Second <script> & "quoted"'];
    $sub = [['id'=>'sub-1','title'=>'User-created','completed'=>false,'notes'=>'one','note_cards'=>['one','two']]];
    verify_journal(PlanStorage::updateTask($id, 'task-1', null, null, null, $sub, "Description\nwith details", $cards), 'Save description and two notes at both levels');
    verify_journal(!PlanStorage::updateTask($id, 'task-1', null, null, null, null, null, ['a','b','c']), 'Reject third task note');
    $badSub = $sub; $badSub[0]['note_cards'][] = 'third';
    verify_journal(!PlanStorage::updateTask($id, 'task-1', null, null, null, $badSub), 'Reject third subtask note');
    PlanStorage::updateTask($id, 'task-1', 'completed');
    $export = PlanStorage::exportUpdatedMarkdown($id);
    verify_journal(PlanStorage::savePlan($export, $ids[1])['success'], 'Reimport journal');
    $task = PlanStorage::getPlan($ids[1])['weeks'][1]['days']['wednesday']['tasks'][0];
    verify_journal($task['note_cards'] === $cards && $task['description'] === "Description\nwith details" && $task['subtasks'] === $sub, 'Status update and Markdown roundtrip preserve all notes');
    verify_journal(!PlanStorage::isAuthorized($id, null, null), 'Protected data requires credentials');
    verify_journal(!PlanStorage::verifyPassword($id, 'wrong'), 'Wrong PIN denied');
    verify_journal(PlanStorage::verifyPassword($id, 'qa-pin-246810'), 'Correct PIN accepted');
    $finance = ['essential'=>100,'lifestyle'=>200,'reserve'=>50,'assets'=>1000,'debt'=>0,'months'=>6,'rate'=>4,'entries'=>[],'notes'=>'','profile'=>['goal'=>'Track spending'],'analysis'=>'My financial direction'];
    verify_journal(FinanceTracker::create($ids[2], $finance), 'Create standalone finance tracker');
    $tracker = PlanStorage::getPlan($ids[2]);
    verify_journal($tracker['weeks'] === [] && $tracker['task_count'] === 0 && !file_exists(PLANS_DIR . '/' . $ids[2] . '.md'), 'Finance has no tasks or PLAN.md');
    verify_journal($tracker['finance'] === $finance, 'Financial profile and direction persist');
    verify_journal(!FinanceTracker::create($ids[2], $finance), 'Existing finance link cannot be overwritten');
} finally {
    foreach ($ids as $fixture) foreach ([PLANS_DIR . "/$fixture.json", PLANS_DIR . "/$fixture.md", EXEC_DIR . "/$fixture.json"] as $file) {
        if (file_exists($file)) unlink($file);
    }
}
