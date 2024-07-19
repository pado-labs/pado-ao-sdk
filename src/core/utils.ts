import { encrypt as AlEncrypt, decrypt as AlgDecrypt, keygen, THRESHOLD_2_3 } from '../algorithm';
import type { EncryptedData, KeyInfo, PolicyInfo } from '../index.d';


export const getSupportedChains = (): string[] => {
  return ['ao', 'sepolia'];
};

export const encrypt = (publicKeys: string[], data: Uint8Array, policyInfo: PolicyInfo): EncryptedData => {
  return AlEncrypt(publicKeys, data, policyInfo);
};
export const decrypt = (
  reenc_sks: string[],
  consumer_sk: string,
  nonce: string,
  enc_msg: Uint8Array,
  chosen_indices: number[],
  threshold: any = THRESHOLD_2_3
): string[] => {
  return AlgDecrypt(reenc_sks, consumer_sk, nonce, enc_msg, chosen_indices, threshold);
};

export const generateKey = (): Promise<KeyInfo> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(keygen());
    }, 1000);
  });
};