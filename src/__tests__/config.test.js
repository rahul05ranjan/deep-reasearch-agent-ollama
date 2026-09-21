import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { config, researchModes } from '../config.js';

describe('Config', () => {
  it('should have ollama config', () => {
    assert.ok(config.ollama);
    assert.ok(config.ollama.baseUrl);
  });

  it('should have researchModes', () => {
    assert.equal(typeof researchModes, 'object');
    assert.ok(Object.keys(researchModes).length > 0);
  });
});
