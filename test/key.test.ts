import { generateKey } from '../src/index';


describe('generateKey function', () => {
  test('returns an object with pk and sk as string', async () => {
    const result = await generateKey();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('pk');
    expect(result).toHaveProperty('sk');
    expect(typeof result.pk).toBe('string');
    expect(typeof result.sk).toBe('string');
  });
});
