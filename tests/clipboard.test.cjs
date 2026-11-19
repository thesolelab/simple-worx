const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function clipboard(navigator) {
  const context = { window: {}, navigator };
  vm.runInNewContext(
    fs.readFileSync(require.resolve('../clipboard.js'), 'utf8'),
    context
  );
  return context.window.ToolClipboard;
}
test('each explicit paste reads current clipboard text without reusing older data', async () => {
  let text = 'Older list',
    reads = 0;
  const api = clipboard({
    clipboard: {
      readText: async () => {
        reads++;
        return text;
      },
    },
  });
  assert.equal(await api.readText(), 'Older list');
  text = '00123\tNew company\r\nAcme, Inc.';
  assert.equal(await api.readText(), text);
  assert.equal(reads, 2);
});
test('blocked, empty, and unavailable clipboard reads fail instead of returning cached text', async () => {
  let fail = false;
  const api = clipboard({
    clipboard: {
      readText: async () => {
        if (fail) throw new Error('denied');
        return 'Previous success';
      },
    },
  });
  await api.readText();
  fail = true;
  await assert.rejects(api.readText(), /blocked/);
  await assert.rejects(clipboard({}).readText(), /Ctrl\+V/);
  await assert.rejects(
    clipboard({ clipboard: { readText: async () => ' \r\n' } }).readText(),
    /No text was copied/
  );
});
