import type { Bytes32, ChainName, CommonObject, DataItem, DataItems, EncryptionSchema, PriceInfo, PriceInfoBytes, PriceInfoT } from '../index.d';
import { DEFAULTENCRYPTIONSCHEMA } from '../config'


interface IData {
  chainName: string;
  uploadData(
    data: Uint8Array,
    dataTag: string,
    priceInfo: PriceInfo,
    wallet: any,
    encryptionSchema: EncryptionSchema,
    extParam?: CommonObject,
  ): Promise<string>;
}

export default class BaseData implements IData {

  /**
   * Encrypt data and upload encrypted data to decentralized storage blockchains such as Arweave and Filecoin.The combination of encryptData and submitData.
   *
   * @param data - plain data need to encrypt and upload
   * @param dataTag - the data meta info object
   * @param priceInfo - The data price symbol(symbol is optional, default is wAR) and price. Currently only wAR(the Wrapped AR in AO) is supported, with a minimum price unit of 1 (1 means 0.000000000001 wAR).
   * @param wallet - The ar wallet json object, this wallet must have AR Token. Pass `window.arweaveWallet` in a browser
   * @param encryptionSchema EncryptionSchema
   * @param extParam - The extParam object, which can be used to pass additional parameters to the upload process
   *                    - uploadParam : The uploadParam object, which can be used to pass additional parameters to the upload process
   *                        - storageType : The storage type, default is ARWEAVE
   *                        - symbolTag :  The tag corresponding to the token used for payment. ref: https://web3infra.dev/docs/arseeding/sdk/arseeding-js/getTokenTag
   
   * @returns The uploaded encrypted data id
   */
  async uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    encryptionSchema: EncryptionSchema = DEFAULTENCRYPTIONSCHEMA,
    extParam?: CommonObject,
  ) {
  }
}