<?php
require_once __DIR__ . '/../lib/PlanStorage.php';
require_once __DIR__ . '/../lib/AiAdapter.php';
function check($ok, $message) {
    if (!$ok) throw new RuntimeException($message);
    echo "PASS: $message\n";
}
$id = 'roundtrip-' . bin2hex(random_bytes(8));
$copyId = $id . '-copy';
try {
    $md = str_replace('start_date: 2026-09-28', 'start_date: 2026-09-23', file_get_contents(EXAMPLES_DIR . '/ielts-6.5.md'));
    // Ensure a Wednesday start independent of sample date.
    $md = preg_replace('/^start_date:.*$/m', 'start_date: 2026-09-23', $md);
    check(PlanStorage::savePlan("```markdown\n$md\n```", $id)['success'], 'Import fenced AI response');
    $plan = PlanStorage::getPlan($id);
    check($plan['weeks'][1]['days']['monday']['date'] === '2026-09-28', 'Monday follows Wednesday start');
    $task = $plan['weeks'][1]['days']['monday']['tasks'][0]['id'];
    $note = "Học được \"async\"\nKhó khăn: await \\ promise\n- [ ] đây là ghi chú, không phải task";
    PlanStorage::updateTask($id, $task, 'in_progress', 17, $note);
    $subs = [['id' => 'sub-1', 'title' => 'Luyện Speaking', 'completed' => true, 'notes' => "Học từ mới\nCòn bí ý"], ['id' => 'sub-2', 'title' => 'Ghi âm', 'completed' => false, 'notes' => '']];
    check(PlanStorage::updateTask($id, $task, null, null, null, $subs), 'Save subtasks without changing parent status');
    check(!PlanStorage::updateTask($id, $task, null, null, null, [['id' => 'bad']]), 'Reject malformed subtasks');
    check(!PlanStorage::updateTask($id, 'unknown-task', null, null, null, $subs), 'Reject subtasks for unknown parent');
    $finance = ['essential'=>10000000,'lifestyle'=>20000000,'reserve'=>30000000,'assets'=>1000000000,'debt'=>0,'months'=>6,'rate'=>4,'notes'=>"FIRE: ghi chú\n$5",'entries'=>[['date'=>'2026-09-22','type'=>'expense','amount'=>50000,'category'=>'Ăn uống','notes'=>'Bữa trưa']]];
    check(FinanceTracker::save($id, $finance), 'Save finance journal');
    check(!FinanceTracker::validate(array_replace($finance, ['rate'=>0])), 'Reject zero withdrawal rate');
    $export = PlanStorage::exportUpdatedMarkdown($id);
    check(strpos($export, 'current_date: ' . date('Y-m-d')) !== false, 'Export includes current date');
    check(PlanStorage::savePlan($export, $copyId)['success'], 'Reimport exported Markdown');
    $copy = PlanStorage::getPlan($copyId);
    check($copy['finance'] === $finance, 'Finance and expense notes roundtrip exactly');
    $t = $copy['weeks'][1]['days']['monday']['tasks'][0];
    check($t['subtasks'] === $subs, 'Subtask completion and multiline journals roundtrip');
    check($t['notes'] === $note, 'Multiline notes and quotes roundtrip exactly');
    check($t['status'] === 'in_progress' && $t['actual_minutes'] === 17, 'Status and actual minutes preserved');
    check($copy['task_count'] === $plan['task_count'], 'No extra tasks created from note content');
    PlanStorage::updateTask($copyId, $task, 'completed', null, null);
    check(PlanStorage::getPlan($copyId)['weeks'][1]['days']['monday']['tasks'][0]['notes'] === $note, 'Status update preserves notes');
    PlanStorage::updateTask($copyId, $task, 'completed', null, '');
    check(PlanStorage::getPlan($copyId)['weeks'][1]['days']['monday']['tasks'][0]['subtasks'] === $subs, 'Updating parent preserves subtasks');
    check(PlanStorage::updateTask($copyId, $task, null, null, null, array_replace($subs, [0 => array_replace($subs[0], ['notes' => ''])])), 'Clear subtask note');
    check(PlanStorage::getPlan($copyId)['weeks'][1]['days']['monday']['tasks'][0]['subtasks'][0]['notes'] === '', 'Cleared subtask note persists');
    check(PlanStorage::getPlan($copyId)['weeks'][1]['days']['monday']['tasks'][0]['notes'] === '', 'Notes can be cleared');
    check(strpos(AiAdapter::generateAdaptationPrompt(PlanStorage::getPlan($id)), 'actual_minutes: 17') !== false, 'Adaptation includes full journal');
} finally {
    foreach ([$id, $copyId] as $testId) {
        foreach ([PLANS_DIR . "/$testId.json", PLANS_DIR . "/$testId.md", EXEC_DIR . "/$testId.json"] as $file) {
            if (file_exists($file)) unlink($file);
        }
    }
}
