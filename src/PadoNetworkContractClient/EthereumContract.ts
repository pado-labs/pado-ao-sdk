import Data from 'contracts/EVM/Data';
import Fee from 'contracts/EVM/Fee';
import Helper from 'contracts/EVM/Helper';
import Task from 'contracts/EVM/Task';
import Worker from 'contracts/EVM/Worker';
import { AOCRED_PROCESS_ID, COMPUTELIMIT, DEFAULTENCRYPTIONSCHEMA, MEMORYLIMIT, TASKS_PROCESS_ID, WAR_PROCESS_ID } from '../config';
import { KeyInfo, StorageType, type CommonObject, type EncryptionSchema, type PriceInfo } from '../index.d';
import BaseContract from './BaseContract';


export default class EthereumContract extends BaseContract {
  worker: any;
  data: any;
  task: any;
  fee: any;
  helper: any;
  userKey: KeyInfo;
  constructor(chainName: ChainName, storageType: StorageType) {
    super(chainName, storageType);
    this.worker = new Worker();
    this.data = new Data(chainName);
    this.task = new Task();
    this.fee = new Fee();
    this.helper = new Helper();
    this.userKey = { pk: '', sk: '' };
  }
  /**
   * Encrypt data and upload encrypted data to decentralized storage blockchains such as Arweave and Filecoin.
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
  async submitData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    encryptionSchema: EncryptionSchema = DEFAULTENCRYPTIONSCHEMA
  ) {
    const [dataId, publicKeys] = await this.data.prepareRegistry(encryptionSchema);
    const policy = {
      t: Number(encryptionSchema.t),
      n: Number(encryptionSchema.n),
      indices: [],
      names: []
    };
    const encryptData = this.encryptData(data, policy, publicKeys);
    // if (!encryptedData) {
    //   throw new Error('The encrypted Data to be uploaded can not be empty');
    // }
    let transactionId = await this.storage.submitData(encryptData.enc_msg, wallet);
    const transactionIdBytes = new Uint8Array(transactionId);
    const dataTagStr = JSON.stringify(dataTag);
    const priceInfoStr = JSON.stringify({
      tokenSymbol: priceInfo.symbol,
      price: priceInfo.price, // TODO-ysm bigint
    });

    const newDataId = await this.data.register(dataId, dataTagStr, priceInfoStr, transactionIdBytes);
    return newDataId;
  }
}