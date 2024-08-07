import Data from '../contracts/EVM/Data';
import Fee from '../contracts/EVM/Fee';
import Helper from '../contracts/EVM/Helper';
import Task from '../contracts/EVM/Task';
import Worker from '../contracts/EVM/Worker';
import { DEFAULTENCRYPTIONSCHEMA } from '../config';
import {
  KeyInfo,
  StorageType,
  type CommonObject,
  type EncryptionSchema,
  type FeeTokenInfo,
  type PriceInfo, Wallets
} from '../types/index';
import BaseContract from './BaseContract';
import { ChainName } from '../types/index';


export default class EthereumContract extends BaseContract {
  worker: any;
  data: any;
  task: any;
  fee: any;
  helper: any;
  userKey: KeyInfo | undefined;

  constructor(chainName: ChainName, storageType: StorageType, wallets: Wallets, userKey?: KeyInfo) {
    super(chainName, storageType, wallets);
    this.worker = new Worker(chainName, wallets.wallet);
    this.data = new Data(chainName, wallets.wallet);
    this.task = new Task(chainName, wallets.wallet);
    this.fee = new Fee(chainName, wallets.wallet);
    this.helper = new Helper(wallets.wallet);
    if (userKey) {
      this.userKey = userKey;
    } else {
      this.initializeUserKey().then(() => {
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  private async initializeUserKey(): Promise<void> {
    this.userKey = await this.generateKey();
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
  async uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    encryptionSchema: EncryptionSchema = DEFAULTENCRYPTIONSCHEMA
  ) {
    console.log(this.data)
    const [dataId, publicKeys] = await this.data.prepareRegistry(encryptionSchema);
    const indices = new Array(Number(encryptionSchema.n)).fill(0);
    const names = new Array(Number(encryptionSchema.n)).fill('');
    const policy = {
      t: Number(encryptionSchema.t),
      n: Number(encryptionSchema.n),
      indices,
      names
    };
    const encryptData = this.encrypt_v2(publicKeys,data, policy);
    //save it to arweave
    const transactionId = await this.storage.submitData(encryptData, this.storageWallet);
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
    console.log(`dataStatus is${dataStatus}`);
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
  async submitTask(taskType: string, dataId: string) {
    //todo get from arweave
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

    // const { computingPrice: nodePrice } = await this.fee.getFeeTokenBySymbol(symbol);
    // const totalPrice = Number(dataPrice) + Number(nodePrice) * workerIds.length;
    //
    // try {
    //   if (symbol === 'ETH') {
    //     const from = 'taskContractAddress';
    //     // TODO-ysm format amount
    //     await this.helper.transferETH(from, totalPrice);
    //   }
    // } catch (err) {
    //   if (err === 'Insufficient Balance!') {
    //     throw new Error(
    //       'Insufficient Balance! Please ensure that your wallet balance is greater than ' + totalPrice + symbol
    //     );
    //   } else {
    //     throw err;
    //   }
    // }
    if (!this.userKey) {
      throw Error('Please set user key!');
    }
    //todo save pk to storage

    const pkTransactionHash = await this.storage.submitData(new Uint8Array(Buffer.from(this.userKey.pk)),this.storageWallet);
    const taskId = await this.task.submitTask(taskType, pkTransactionHash, dataId);
    return taskId;
  }


  async getTaskResult(taskId: string, timeout: number = 10000): Promise<Uint8Array> {
    const task = await this.task.getCompletedTaskById(taskId);

    let encData = await this.data.getDataById(task.dataId);
    encData = JSON.parse(encData);
    let exData = JSON.parse(encData.data);

    const { encryptionSchema, workerIds, dataContent } = encData;
    let uint8Array = new Uint8Array(dataContent);
    let decoder = new TextDecoder('utf-8');
    let transactionId = decoder.decode(uint8Array);
    let encMsg = await this.storage.getData(transactionId);
    const chosenIndices = new Array(Number(encryptionSchema.n)).fill(0);
    const reencChosenSks = new Array(Number(encryptionSchema.n)).fill('');

    if (!this.userKey) {
      throw Error('Please set user key!');
    }
    const res = this.decrypt(reencChosenSks, this.userKey.sk, exData.nonce, encMsg, chosenIndices);
    return new Uint8Array(res.msg);
  }
}