import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPrompt } from '../prompts/templates.js';

describe('Prompt Templates', () => {
  it('getPrompt should return a string containing topic and mode', () => {
    const prompt = getPrompt('topicAnalysis', { topic: 'Test', mode: 'Test' });
    assert.equal(typeof prompt, 'string');
    assert.ok(prompt.includes('Test'));
  });
});
