import { encrypt as AlEncrypt, decrypt as AlgDecrypt, keygen, THRESHOLD_2_3 } from '../algorithm';
import type { EncryptedData, KeyInfo, PolicyInfo } from '../index.d';


/**
   * Get a list of supported chains.
   * @returns Return a list of supported chain names
   */
export const getSupportedChains = (): string[] => {
  return ['ao', 'sepolia'];
};

/**
 * The encryption method of the algorithm.
 *
 * @param publicKeys List of public keys corresponding to the selected workers.
 * @param data Data that to be encrypted.
 * @param policyInfo Some information about workers involved in encryption.
 * @returns Return the encrypted data.
 */
export const encrypt = (publicKeys: string[], data: Uint8Array, policyInfo: PolicyInfo): EncryptedData => {
  return AlEncrypt(publicKeys, data, policyInfo);
};

/**
 * The decryption method of the algorithm.
 *
 * @param reenc_sks List of private keys corresponding to the selected workers.
 * @param consumer_sk Consumer's private key.
 * @param nonce 
 * @param enc_msg
 * @param chosen_indices
 * @param threshold
 * @returns Return the decrypted data.
 */
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

/**
 * Generate private and public key pair.
 *
 * @returns Return the key pair object which contains pk and sk fields
 */
export const generateKey = (): Promise<KeyInfo> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(keygen());
    }, 1000);
  });
};