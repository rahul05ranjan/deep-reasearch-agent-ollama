import { config, researchModes } from '../config.js';

describe('Config', () => {
  test('should have ollama config', () => {
    expect(config.ollama).toBeDefined();
    expect(config.ollama.baseUrl).toBeDefined();
  });

  test('should have researchModes', () => {
    expect(typeof researchModes).toBe('object');
    expect(Object.keys(researchModes).length).toBeGreaterThan(0);
  });
});
