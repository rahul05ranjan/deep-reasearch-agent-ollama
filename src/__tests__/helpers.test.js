import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Logger, Formatter } from '../utils/helpers.js';

describe('Helpers', () => {
  it('Logger should have info, error, success, title methods', () => {
    assert.equal(typeof Logger.info, 'function');
    assert.equal(typeof Logger.error, 'function');
    assert.equal(typeof Logger.success, 'function');
    assert.equal(typeof Logger.title, 'function');
  });

  it('Formatter should have highlight, dim, section, box methods', () => {
    assert.equal(typeof Formatter.highlight, 'function');
    assert.equal(typeof Formatter.dim, 'function');
    assert.equal(typeof Formatter.section, 'function');
    assert.equal(typeof Formatter.box, 'function');
  });
});
