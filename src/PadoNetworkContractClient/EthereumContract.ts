import Data from 'contracts/EVM/Data';
import Fee from 'contracts/EVM/Fee';
import Helper from 'contracts/EVM/Helper';
import Task from 'contracts/EVM/Task';
import Worker from 'contracts/EVM/Worker';
import { DEFAULTENCRYPTIONSCHEMA } from '../config';
import { KeyInfo, StorageType, type CommonObject, type EncryptionSchema, type FeeTokenInfo, type PriceInfo } from '../index.d';
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
    this.task = new Task(chainName);
    this.fee = new Fee(chainName);
    this.helper = new Helper(chainName);
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
    const indices =  new Array(Number(encryptionSchema.n)).fill(0);  
    const names = new Array(Number(encryptionSchema.n)).fill('');  
    const policy = {
      t: Number(encryptionSchema.t),
      n: Number(encryptionSchema.n),
      indices, // TODO
      names // TODO
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
      price: priceInfo.price // TODO-ysm bigint
    });

    const newDataId = await this.data.register(dataId, dataTagStr, priceInfoStr, transactionIdBytes);
    return newDataId;
  }

  /**
   * Asynchronously retrieves a list of data based on the specified status.
   * @param dataStatus - The status of the data to retrieve, defaults to 'Valid'.
   * @returns A promise that resolves to the retrieved data list.
   */
  async getDataList(dataStatus: string = 'Valid') {
    const res = await this.data.getAllData();
    // TODO Filter data from various states
    return res;
  }

  /**
   * Asynchronously retrieves data by the specified ID.
   * @param dataId The unique identifier of the data to retrieve.
   * @returns A promise that resolves to the retrieved data.
   */
  async getDataById(dataId: string) {
    const res = await this.data.getDataById(dataId);
    return res;
  }

  /**
   * Submits a task for processing with the specified parameters.
   *
   * @param taskType - The type of task to be submitted.
   * @param wallet - The wallet object containing user's credentials for signing transactions.
   * @param dataId - The identifier of the data to be used in the task.
   * @returns {Promise<string>} - The ID of the submitted task.
   */
  async submitTask(taskType: string, wallet: any, dataId: string) {
    const key = await this.generateKey();
    this.userKey = key;

    let encData = await this.data.getDataById(dataId);
    const { priceInfo: priceObj, workerIds } = encData;
    const { tokenSymbol: symbol, price: dataPrice } = priceObj;
    const isSupported = await this.fee.isSupportToken(symbol);
    if (!isSupported) {
      const supportTokens = await this.fee.getFeeTokens();
      const supportSymbols = supportTokens.map((i: FeeTokenInfo) => i.symbol);
      throw new Error(`Only support ${supportSymbols.join('/')} now!`);
    }
    //get node price

    const { computingPrice: nodePrice } = await this.fee.getFeeTokenBySymbol(symbol);
    const totalPrice = Number(dataPrice) + Number(nodePrice) * workerIds.length;

    try {
      if (symbol === 'ETH') {
        const from = 'taskContractAddress';
        // TODO-ysm format amount
        await this.helper.transferETH(from, totalPrice);
      }
    } catch (err) {
      if (err === 'Insufficient Balance!') {
        throw new Error(
          'Insufficient Balance! Please ensure that your wallet balance is greater than ' + totalPrice + symbol
        );
      } else {
        throw err;
      }
    }

    const taskId = await this.task.submit(taskType, this.userKey.pk, dataId);
    return taskId;
  }

  
  async getTaskResult(taskId: string, timeout: number = 10000): Promise<Uint8Array> {
    const task = await this.task.getCompletedTaskById(taskId);

    let encData = await this.data.getDataById(task.dataId);
    const { encryptionSchema, workerIds, dataContent } = encData;
    const { t, n } = encryptionSchema;
    let uint8Array = new Uint8Array(dataContent); // 表示 "Hello" 的 UTF-8 编码
    let decoder = new TextDecoder('utf-8');
    let transactionId = decoder.decode(uint8Array);  
    let encMsg = await this.storage.getData(transactionId);
    // TODO
    // const res = this.decrypt(reencChosenSks, this.userKey.sk, exData.nonce, encMsg, chosenIndices);
  }
}