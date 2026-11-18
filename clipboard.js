(function (root) {
  'use strict';
  // Read only in response to a paste button. Never cache or reuse previous input.
  async function readText() {
    if (!navigator.clipboard?.readText)
      throw new Error(
        'Clipboard access is unavailable. Click the input and use Ctrl+V / Cmd+V.'
      );
    let text;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      throw new Error(
        'Clipboard access was blocked. Click the input and use Ctrl+V / Cmd+V, or allow clipboard access in your browser.'
      );
    }
    if (!text.trim())
      throw new Error('No text was copied. Copy the cells in Excel again, then paste.');
    return text;
  }
  root.ToolClipboard = { readText };
})(window);
