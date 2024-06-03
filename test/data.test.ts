import { listData } from '../src/index';

describe('listData function', () => {
  jest.setTimeout(50000);
  let allDataLen = 0;
  let invalidDataLen = 0;
  let validDataLen = 0;
  let defaultDataLen = 0;
  it('should return an array of objects with expected properties when no dataStatus is provided', async () => {
    const result = await listData();
    console.log('listData result.length:', result.length);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    defaultDataLen = result.length;
    result.forEach((item) => {
      expect(typeof item.id).toBe('string');
      expect(typeof item.dataTag).toBe('string');
      expect(typeof item.price).toBe('string');
      expect(typeof item.from).toBe('string');
      expect(typeof item.data).toBe('string');
    });
  });

  it('should return an array of objects with expected properties when a specific dataStatus is provided', async () => {
    const dataStatus = 'Invalid';
    const result = await listData(dataStatus);

    expect(result).toBeInstanceOf(Array);
    invalidDataLen = result.length;
    if (invalidDataLen > 0) {
      result.forEach((item) => {
        expect(typeof item.id).toBe('string');
        expect(typeof item.dataTag).toBe('string');
        expect(typeof item.price).toBe('string');
        expect(typeof item.from).toBe('string');
        expect(typeof item.data).toBe('string');
      });
    }
  });

  it('should return an array of objects with expected properties when a specific dataStatus is provided', async () => {
    const dataStatus = 'Valid';
    const result = await listData(dataStatus);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    validDataLen = result.length;
    expect(validDataLen).toBe(defaultDataLen);
    result.forEach((item) => {
      expect(typeof item.id).toBe('string');
      expect(typeof item.dataTag).toBe('string');
      expect(typeof item.price).toBe('string');
      expect(typeof item.from).toBe('string');
      expect(typeof item.data).toBe('string');
    });
  });

  it('should return an array of objects with expected properties when a specific dataStatus is provided', async () => {
    const dataStatus = 'All';
    const result = await listData(dataStatus);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    allDataLen = result.length;
    expect(validDataLen + invalidDataLen).toBe(allDataLen);
    result.forEach((item) => {
      expect(typeof item.id).toBe('string');
      expect(typeof item.dataTag).toBe('string');
      expect(typeof item.price).toBe('string');
      expect(typeof item.from).toBe('string');
      expect(typeof item.data).toBe('string');
    });
  });

  it('should reject when an invalid dataStatus is provided', async () => {
    const dataStatus = 'a';
    // @ts-ignore
    await expect(listData(dataStatus)).rejects.toBeDefined();
  });
});
