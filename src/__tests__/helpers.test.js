import { Logger, Formatter } from '../utils/helpers.js';

describe('Helpers', () => {
  test('Logger should have info, error, success, title methods', () => {
    expect(typeof Logger.info).toBe('function');
    expect(typeof Logger.error).toBe('function');
    expect(typeof Logger.success).toBe('function');
    expect(typeof Logger.title).toBe('function');
  });

  test('Formatter should have highlight, dim, section, box methods', () => {
    expect(typeof Formatter.highlight).toBe('function');
    expect(typeof Formatter.dim).toBe('function');
    expect(typeof Formatter.section).toBe('function');
    expect(typeof Formatter.box).toBe('function');
  });
});
