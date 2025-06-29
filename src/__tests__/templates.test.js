import { getPrompt } from '../prompts/templates.js';

describe('Prompt Templates', () => {
  test('getPrompt should return a string containing topic and mode', () => {
    const prompt = getPrompt('topicAnalysis', { topic: 'Test', mode: 'Test' });
    expect(typeof prompt).toBe('string');
    expect(prompt).toContain('Test');
  });
});
