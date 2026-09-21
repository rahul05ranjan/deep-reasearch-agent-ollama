import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Validate Script', () => {
  it('should run without throwing', async () => {
    let error;
    try {
      await import('../validate.js');
    } catch (e) {
      error = e;
    }
    assert.equal(error, undefined);
  });
});
