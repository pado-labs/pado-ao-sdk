import { createDataItemSigner } from '@permaweb/aoconnect';
import Arweave from 'arweave';
import { decrypt, encrypt, keygen, THRESHOLD_2_3 } from '../algorithm';
import { CommonObject, type KeyInfo, type PolicyInfo } from '../index.d';


const ARConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
};
interface IArweave {
  arweave: Arweave;
}
export default class BaseArweave implements IArweave {
  arweave: Arweave;
  constructor() {
    this.arweave = Arweave.init(ARConfig);
  }

  /**
   * Generate private and public key pair
   *
   * @returns Return the key pair object which contains pk and sk fields
   */
  async generateKey(): Promise<KeyInfo> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(keygen());
      }, 1000);
    });
  }

  /**
   * Asynchronous function: encrypts data.
   *
   * This function is used to encrypt a given piece of data using a specified encryption policy and public keys. It first checks if the data to be encrypted is empty, then performs the encryption operation, and finally returns the encrypted data along with the encryption policy.
   *
   * @param data A Uint8Array type data to be encrypted.
   * @param policy An encryption policy that specifies how the data is encrypted.
   * @param publicKeys An array of strings containing the public keys used for encryption.
   * @returns Returns a Promise, which resolves to an object containing the encrypted data and encryption policy.
   * @throws If the data to be encrypted is empty, an error is thrown.
   */
  encryptData(data: Uint8Array, policy: PolicyInfo, publicKeys: string[]): CommonObject {
    if (data.length === 0) {
      throw new Error('The Data to be encrypted can not be empty');
    }
    const res = encrypt(publicKeys, data, policy);
    return Object.assign(res, { policy });
  }

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
  decrypt(
    reenc_sks: string[],
    consumer_sk: string,
    nonce: string,
    enc_msg: Uint8Array,
    chosen_indices: number[],
    threshold: any = THRESHOLD_2_3
  ): CommonObject {
    return decrypt(reenc_sks, consumer_sk, nonce, enc_msg, chosen_indices, threshold);
  }

  /**
   * Formats the signer object.
   *
   * This method creates and returns a formatted signer object, which can be used for subsequent signing operations.
   * It accepts a wallet object as a parameter, which is used to generate the signer.
   *
   * @param wallet - The wallet object from which the signer will be created.
   * @returns The formatted signer object.
   */
  getSigner(wallet: any): any {
    const signer = createDataItemSigner(wallet);
    return signer;
  }
}