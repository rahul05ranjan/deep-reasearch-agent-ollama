import '../validate.js';

describe('Validate Script', () => {
  test('should run without throwing', async () => {
    let error;
    try {
      await import('../validate.js');
    } catch (e) {
      error = e;
    }
    expect(error).toBeUndefined();
  });
});
