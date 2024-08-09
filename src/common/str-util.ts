/**
 * Converts the bytes type data obtained from the contract into itemId on arseeding
 * (0x4f6f55516873635a3231716a783452746166687277624436376b486d37727273594e393850494847375941) -> (OoUQhscZ21qjx4RtafhrwbD67kHm7rrsYN98PIHG7YA)
 * @param hexStr : hex string get from contracts type 'bytes', such as '0x4f6f55516873635a3231716a783452746166687277624436376b486d37727273594e393850494847375941'
 */
export const arseedingHexStrToBase64 = (hexStr: string) => {
  hexStr = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;

  const byteArray = new Uint8Array(hexStr.length / 2);
  for (let i = 0; i < hexStr.length; i += 2) {
    byteArray[i / 2] = parseInt(hexStr.slice(i, i + 2), 16);
  }
  const decoder = new TextDecoder();
  return decoder.decode(byteArray);
};

/**
 * Converts the base64 type data obtained from arseeding to hex type data
 *  such as 'OoUQhscZ21qjx4RtafhrwbD67kHm7rrsYN98PIHG7YA' -> '0x4f6f55516873635a3231716a783452746166687277624436376b486d37727273594e393850494847375
 * @param base64Str
 */
export const arseedingBase64ToHexStr = (base64Str: string) => {
  const arr = [];
  for (let i = 0, j = base64Str.length; i < j; ++i) {
    arr.push(base64Str.charCodeAt(i));
  }

  const data = new Uint8Array(arr);
  return '0x'+Buffer.from(data).toString('hex');
};


/**
 * convert Uint8Array to hex string
 * @param data
 */
export const convertUint8ArrayToHexStr = (data: Uint8Array) => {
  return Buffer.from(data).toString('hex');
};
