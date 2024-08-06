import { CommonObject, type KeyInfo, type PolicyInfo } from '../types/index';

var lhe: any;
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  import('../lib/lhe').then((lhei) => {
    lhe = lhei;
  });
} else {
  lhe = (window as any).Module;
}
const lhe_call = (func: any, param_obj: any) => {
  let param_json = JSON.stringify(param_obj);
  let param_ptr = lhe.allocateUTF8(param_json);

  let cptr = func(param_ptr);
  lhe._free(param_ptr);

  let ret_json = lhe.UTF8ToString(cptr);
  lhe._free_cptr(cptr);

  let ret_obj = JSON.parse(ret_json);

  return ret_obj;
};

export const THRESHOLD_2_3 = { t: 2, n: 3, indices: [1, 2, 3] };

export default class Utils {
  constructor() {}
  /**
   * Generate private and public key pair
   *
   * @returns Return the key pair object which contains pk and sk fields
   */
async generateKey(param_obj: any = THRESHOLD_2_3): Promise<KeyInfo> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const keys = lhe_call(lhe._keygen, param_obj);
        resolve(keys);
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
    // const res = encrypt(publicKeys, data, policy);
    let msg_len = data.length;
    let msg_ptr = lhe._malloc(msg_len);
    let msg_buffer = new Uint8Array(lhe.wasmMemory.buffer, msg_ptr, msg_len);
    msg_buffer.set(data);

    let param_obj = { ...policy, node_pks: publicKeys, msg_len: msg_len, msg_ptr: msg_ptr };

    let res = lhe_call(lhe._encrypt, param_obj);
    lhe._free(msg_ptr);

    let dataview = new Uint8Array(lhe.wasmMemory.buffer, res.emsg_ptr, res.emsg_len);
    res.enc_msg = new Uint8Array(dataview);
    lhe._free(res.emsg_ptr);
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
    let emsg_len = enc_msg.length;
    let emsg_ptr = lhe._malloc(emsg_len);
    let emsg_buffer = new Uint8Array(lhe.wasmMemory.buffer, emsg_ptr, emsg_len);
    emsg_buffer.set(enc_msg);

    let param_obj = {
      ...threshold,
      reenc_sks: reenc_sks,
      consumer_sk: consumer_sk,
      nonce: nonce,
      emsg_ptr: emsg_ptr,
      emsg_len: emsg_len,
      chosen_indices: chosen_indices
    };

    let res = lhe_call(lhe._decrypt, param_obj);
    lhe._free(emsg_ptr);

    let dataview = new Uint8Array(lhe.wasmMemory.buffer, res.msg_ptr, res.msg_len);
    res.msg = new Uint8Array(dataview);
    lhe._free(res.msg_ptr);
    return res;
  }

  reencrypt(enc_sk: string, node_sk: string, consumer_pk: string, threshold: any = THRESHOLD_2_3) {
    let param_obj = { ...threshold, enc_sk: enc_sk, node_sk: node_sk, consumer_pk: consumer_pk };
    return lhe_call(lhe._reencrypt, param_obj);
  }
}
