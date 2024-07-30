import { DEFAULTENCRYPTIONSCHEMA } from '../../config';
import AODataContract from '../../contracts/AO/Data';
import AOWorkerContract from '../../contracts/AO/Worker';
import type { ChainName, CommonObject, DataItems, EncryptionSchema, PriceInfo } from '../../index.d';
import BaseData from '../BaseData';

export default class AOData extends BaseData {
  dataContractInstance: any;
  workerContractInstance: any;
  constructor(chainName: ChainName) {
    super();
    this.dataContractInstance = new AODataContract();
    this.workerContractInstance = new AOWorkerContract();
  }

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
    extParam?: CommonObject
  ) {
    const [policy, publicKeys] = await this.dataContractInstance.prepareRegistry(encryptionSchema);
    const encryptData = this.dataContractInstance.encryptData(data, policy, publicKeys);
    const dataId = await this.dataContractInstance.submitData(
      encryptData,
      dataTag,
      priceInfo,
      policy,
      wallet,
      extParam
    );
    return dataId;
  }

  /**
   * Asynchronously retrieves a list of data items.
   *
   * This function calls the method of the data contract instance to fetch a list of data items with a specified status.
   *
   * @param {string} dataStatus - The status of the data items to be retrieved, defaulting to 'Valid'.
   * @returns {Promise<DataItems>} A promise that resolves to an object containing the fetched data items.
   */
  async listData(dataStatus = 'Valid'): Promise<DataItems> {
    const resStr = await this.dataContractInstance.allData(dataStatus);
    const res = JSON.parse(resStr);
    return res;
  }

  /**
   * Asynchronously retrieves data information by the given data ID.
   *
   * This function calls the getDataInfoById method of the data contract instance
   * to fetch the encrypted data, logs the result, and then parses the JSON string
   * to return the data object.
   *
   * @param {string} dataId - The unique identifier for the data to be retrieved.
   * @returns {Promise<any>} A promise that resolves to the data object.
   */
  async getDataById(dataId: string) {
    const encData = await this.dataContractInstance.getDataInfoById(dataId);
    console.log('getDataById=', dataId, encData);
    const res = JSON.parse(encData);
    return res;
  }
}
