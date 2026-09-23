"""Run against the local PHP server: python3 tests/test_workspace_api.py [base URL]."""
import hashlib
import json
import pathlib
import sys
import uuid
import urllib.error
import urllib.parse
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8088'
ROOT = pathlib.Path(__file__).resolve().parents[1]
plan_id = 'workspace-test-' + uuid.uuid4().hex[:12]
renamed = plan_id + '-renamed'

def call(action, slot=1, body=None, token='', root=None, **params):
    root = root or plan_id
    params.update(action=action, slot=slot, workspace=root)
    if body is None:
        params['p'] = root
    else:
        body = dict(body)
        body.setdefault('p', root)
    request = urllib.request.Request(BASE + '/api.php?' + urllib.parse.urlencode(params),
        data=None if body is None else json.dumps(body).encode(),
        headers={'Content-Type':'application/json', 'X-Plan-Token':token})
    try:
        with urllib.request.urlopen(request) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)

def check(condition, message):
    assert condition, message
    print('PASS:', message)

try:
    _, created = call('create_notebook', body={'title':'Private notebook', 'password':'qa-workspace-pin'})
    check(created.get('success'), 'Create empty notebook without tasks')
    token = created['token']
    _, locked = call('get_plan', slot=2)
    check(locked.get('is_protected') and 'workspace' not in locked, 'Second slot requires shared PIN, even before creation')
    status, empty = call('get_plan', slot=2, token=token)
    check(status == 404 and len(empty['workspace']) == 2 and empty['token'] == token, 'Empty second slot is available after unlocking')
    _, saved = call('save_notebook', body={'notes':['First note', 'Second\nline']}, token=token)
    check(saved.get('success'), 'Save two notebook notes')
    status, _ = call('save_notebook', body={'notes':['1','2','3']}, token=token)
    check(status == 422, 'Reject third notebook note')
    md = (ROOT / 'examples/coding-roadmap.md').read_text()
    _, second = call('save_plan', slot=2, body={'custom_id':plan_id,'markdown':md}, token=token)
    check(second.get('success') and second['plan_id'] == plan_id, 'Create second plan under same public link')
    _, second_data = call('get_plan', slot=2, token=token)
    check(second_data['plan']['has_password'] and all(p['exists'] for p in second_data['workspace']), 'Both plans share root protection and appear in deck')
    task_id = next(iter(second_data['plan']['weeks'].values()))['days']['monday']['tasks'][0]['id']
    _, task = call('update_task', slot=2, body={'task_id':task_id,'note_cards':['Only second plan']}, token=token)
    check(task.get('success'), 'Task updates use second slot')
    _, first = call('get_plan', token=token)
    check(first['plan']['weeks'] == [] and first['plan']['notebook']['notes'] == ['First note','Second\nline'], 'First notebook remains isolated from second plan')
    _, exported = call('export_markdown', slot=2, token=token)
    check('plan_id: ' + plan_id in exported['markdown'] and 'Only second plan' in exported['markdown'], 'Second plan export contains public ID and its own journal')
    status, _ = call('get_plan', slot=3, token=token)
    check(status == 422, 'Reject third plan slot')
    internal = 'ws2-' + hashlib.sha256(plan_id.encode()).hexdigest()[:48]
    status, _ = call('get_plan', root=internal)
    check(status == 403, 'Reject direct internal slot URL')
    _, locked = call('get_plan', slot=2)
    check(locked.get('is_protected') and 'plan' not in locked, 'Reload without memory token cannot read second plan')
    _, changed = call('custom_link', body={'new_id':renamed,'rename':True}, token=token)
    check(changed.get('success'), 'Rename link with both slots')
    _, after = call('get_plan', slot=2, root=renamed, token=changed['token'])
    check(after['plan']['title'] == second_data['plan']['title'], 'Second plan survives custom link rename')
    _, after_first = call('get_plan', root=renamed, token=changed['token'])
    check(after_first['plan']['notebook']['notes'][0] == 'First note', 'Notebook survives custom link rename')
    status, _ = call('save_notebook', body={'notes':[]}, slot=2, token=token)
    check(status == 409, 'Old alias cannot mutate an orphaned slot')
finally:
    for public_id in [plan_id, renamed]:
        for item in [public_id, 'ws2-' + hashlib.sha256(public_id.encode()).hexdigest()[:48]]:
            for folder, suffix in [('plans','.json'),('plans','.md'),('executions','.json')]:
                (ROOT / 'data' / folder / (item + suffix)).unlink(missing_ok=True)
