<?php
/**
 * Automated CLI Test Suite for PlanParser, PlanValidator, and PlanStorage
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/PlanParser.php';
require_once __DIR__ . '/../lib/PlanValidator.php';
require_once __DIR__ . '/../lib/PlanStorage.php';
require_once __DIR__ . '/../lib/AiAdapter.php';

echo "========================================\n";
echo " Running AI Plan Executor Unit Tests\n";
echo "========================================\n\n";

$passCount = 0;
$failCount = 0;

function assert_test(string $name, bool $condition, string $detail = '') {
    global $passCount, $failCount;
    if ($condition) {
        echo " [PASS] {$name}\n";
        $passCount++;
    } else {
        echo " [FAIL] {$name}" . ($detail ? " — {$detail}" : '') . "\n";
        $failCount++;
    }
}

// 1. Test parsing IELTS 6.5 Example
$ieltsMd = file_get_contents(EXAMPLES_DIR . '/ielts-6.5.md');
$parsed = PlanParser::parse($ieltsMd);

assert_test("Parsed IELTS plan_id matches", ($parsed['plan_id'] === 'ielts-6-5-target'));
assert_test("Parsed title matches", str_contains($parsed['title'], 'IELTS 6.5'));
assert_test("Parsed duration_weeks is 12", $parsed['duration_weeks'] === 12);
assert_test("Parsed weeks count is 2", count($parsed['weeks']) === 2);
assert_test("Parsed total tasks count > 0", $parsed['task_count'] > 10, "Found " . $parsed['task_count']);
assert_test("Parsed total minutes > 0", $parsed['total_minutes'] > 0, "Minutes: " . $parsed['total_minutes']);

// 2. Test Validator on valid plan
$val = PlanValidator::validate($parsed);
assert_test("IELTS plan is strictly valid", $val['valid'] === true, json_encode($val['errors']));

// 3. Test Validator on invalid plan (missing start_date and duplicate IDs)
$badMd = <<<MD
---
title: Bad Plan
---
# Week 1
## Monday
- [ ] Task A
  - id: dup-01
  - duration: 20
- [ ] Task B
  - id: dup-01
  - duration: -5
MD;

$badParsed = PlanParser::parse($badMd);
$badVal = PlanValidator::validate($badParsed);
assert_test("Validator caught errors on invalid plan", $badVal['valid'] === false);
assert_test("Validator detected duplicate ID", count(array_filter($badVal['errors'], fn($e) => str_contains($e, 'Duplicate task ID'))) > 0);
assert_test("Validator detected negative duration", count(array_filter($badVal['errors'], fn($e) => str_contains($e, 'invalid duration'))) > 0);

// 4. Test Storage & Dynamic Link Generation
$saved = PlanStorage::savePlan($ieltsMd, 'test-dynamic-link');
assert_test("PlanStorage saved successfully", $saved['success'] === true);
assert_test("Dynamic Link plan_id matches", $saved['plan_id'] === 'test-dynamic-link');

$loaded = PlanStorage::getPlan('test-dynamic-link');
assert_test("PlanStorage retrieved saved plan", $loaded !== null && $loaded['plan_id'] === 'test-dynamic-link');

// 5. Test Task Execution Toggle
$testTaskId = 'ielts-w1-mon-01';
$upd = PlanStorage::updateTask('test-dynamic-link', $testTaskId, 'completed', 25, 'Finished on time');
assert_test("Task status update succeeded", $upd === true);

$reloaded = PlanStorage::getPlan('test-dynamic-link');
$taskRecord = null;
foreach ($reloaded['weeks'][1]['days']['monday']['tasks'] as $t) {
    if ($t['id'] === $testTaskId) {
        $taskRecord = $t;
        break;
    }
}
assert_test("Task execution record reflects 'completed'", $taskRecord && $taskRecord['status'] === 'completed');
assert_test("Stats completion_rate calculated", $reloaded['stats']['completed'] >= 1);

// 6. Test AI Adapter prompt generation
$aiPrompt = AiAdapter::generateAdaptationPrompt($reloaded);
assert_test("AI Adapter generated non-empty prompt", !empty($aiPrompt));
assert_test("AI Adapter prompt contains target", str_contains($aiPrompt, 'IELTS 6.5'));

// 7. Test Export Updated Markdown
$exportedMd = PlanStorage::exportUpdatedMarkdown('test-dynamic-link');
assert_test("Exported Markdown contains checked task [x]", str_contains($exportedMd, '- [x] Grammar Essentials'));

// 8. Test Password Protection Mechanism
$savedProtected = PlanStorage::savePlan($ieltsMd, 'test-protected-link', 'mysecret123');
assert_test("Protected plan saved successfully", $savedProtected['success'] === true);
assert_test("hasPassword detects protected plan", PlanStorage::hasPassword('test-protected-link') === true);
assert_test("verifyPassword rejects wrong password", PlanStorage::verifyPassword('test-protected-link', 'wrongpass') === false);
assert_test("verifyPassword accepts correct password", PlanStorage::verifyPassword('test-protected-link', 'mysecret123') === true);

// 9. Test Token Generation & Authorization Check
$token = PlanStorage::generateAuthToken('test-protected-link');
assert_test("Token verification succeeds with valid token", PlanStorage::verifyAuthToken('test-protected-link', $token) === true);
assert_test("Token verification fails with invalid token", PlanStorage::verifyAuthToken('test-protected-link', 'badtoken') === false);
assert_test("isAuthorized blocks unauthenticated request", PlanStorage::isAuthorized('test-protected-link', null, null) === false);
assert_test("isAuthorized allows request with valid token", PlanStorage::isAuthorized('test-protected-link', $token, null) === true);
assert_test("isAuthorized allows request with valid password", PlanStorage::isAuthorized('test-protected-link', null, 'mysecret123') === true);

// 10. Test Setting & Updating Password
$changeRes = PlanStorage::setPassword('test-protected-link', 'newsecret456', 'mysecret123');
assert_test("Password update succeeds with correct current password", $changeRes['success'] === true);
assert_test("New password verified", PlanStorage::verifyPassword('test-protected-link', 'newsecret456') === true);

// 11. Test Task Renaming
$renameOk = PlanStorage::updateTask('test-dynamic-link', 'ielts-w1-mon-01', 'in_progress', null, null, null, null, null, 'Nhiệm vụ ngữ pháp cải tiến');
assert_test("Task title renaming succeeded", $renameOk === true);
$planWithRenamedTask = PlanStorage::getPlan('test-dynamic-link');
$renamedTask = null;
foreach ($planWithRenamedTask['weeks'][1]['days']['monday']['tasks'] as $t) {
    if ($t['id'] === 'ielts-w1-mon-01') {
        $renamedTask = $t;
        break;
    }
}
assert_test("Reloaded plan reflects renamed task title", $renamedTask && $renamedTask['title'] === 'Nhiệm vụ ngữ pháp cải tiến');

// 12. Test Plan Deletion
$deleteOk = PlanStorage::deletePlan('test-protected-link');
assert_test("Plan deletion succeeded", $deleteOk === true);
assert_test("Deleted plan is no longer found", PlanStorage::getPlan('test-protected-link') === null);

echo "\n----------------------------------------\n";
echo " Results: {$passCount} Passed, {$failCount} Failed\n";
echo "========================================\n";

if ($failCount > 0) exit(1);
