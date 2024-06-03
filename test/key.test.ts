import { generateKey } from '../src/index';


describe('generateKey function', () => {
  test('returns an object with pk and sk as string', async () => {
    const result = await generateKey();
    expect(result).toBeDefined();
    // expect(result).toHaveProperty('pk');
    // expect(result).toHaveProperty('sk');
    expect(typeof result.pk).toBe('string');
    expect(typeof result.sk).toBe('string');

    // Further inspection
    // expect(result.pk).not.toBeNull();
    // expect(result.pk).not.toBeUndefined();
    // expect(result.pk).not.toBe('');
    // expect(result.sk).not.toBeNull();
    // expect(result.sk).not.toBeUndefined();
    // expect(result.sk).not.toBe('');
    // expect(result.pk).toMatch(/^[a-zA-Z0-9]+$/);
    // expect(result.sk).toMatch(/^[a-z]+$/); 
  });
});
