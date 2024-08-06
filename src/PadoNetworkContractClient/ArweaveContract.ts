import { createDataItemSigner } from '@permaweb/aoconnect';
import { AOData } from '../contracts/AO/AOData';
import { AOFee } from '../contracts/AO/AOFee';
import Helper from '../contracts/AO/Helper';
import { AOTask } from '../contracts/AO/AOTask';
import { AOWorker } from '../contracts/AO/AOWorker';
import {
  COMPUTELIMIT,
  DEFAULTENCRYPTIONSCHEMA,
  MEMORYLIMIT,
  SUPPORTSYMBOLONAOFROMADDRESSMAP,
  SUPPORTSYMBOLSONAO,
  TASKS_PROCESS_ID
} from '../config';
import { KeyInfo, StorageType, type CommonObject, type EncryptionSchema, type PriceInfo } from '../types/index';
import BaseContract from './BaseContract';
import { ChainName } from '../types/index';
import Utils from '../Common/Utils';


export default class ArweaveContract extends BaseContract {
  worker: any;
  data: any;
  task: any;
  fee: any;
  helper: any;
  userKey: KeyInfo | undefined;
  wallet: any;

  constructor(chainName: ChainName, storageType: StorageType, wallet: any, userKey?: KeyInfo) {
    super(chainName, storageType, wallet);
    this.worker = new AOWorker();
    this.data = new AOData();
    this.task = new AOTask();
    this.fee = new AOFee();
    this.helper = new Helper();
    this.wallet = wallet;
    if (userKey) {
      this.userKey = userKey;
    } else {
      this.initializeUserKey(chainName, wallet);
    }
  }

  private async initializeUserKey(chainName: ChainName, wallet: any): Promise<void> {
    const utils = new Utils();
    this.userKey = await utils.generateKey();
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
    wallet: any,
    encryptionSchema: EncryptionSchema = DEFAULTENCRYPTIONSCHEMA
  ) {
    const [policy, publicKeys] = await this.data.prepareRegistry(encryptionSchema);
    const encryptData = this.encryptData(data, policy, publicKeys);
    // if (!encryptedData) {
    //   throw new Error('The encrypted Data to be uploaded can not be empty');
    // }
    let transactionId = await this.storage.submitData(encryptData.enc_msg, this.wallet);
    dataTag['storageType'] = this.storage.StorageType;

    const txData = {
      policy: encryptData.policy,
      nonce: encryptData.nonce,
      transactionId: transactionId,
      encSks: encryptData.enc_sks
    };
    const dataTagStr = JSON.stringify(dataTag);
    const priceInfoStr = JSON.stringify(priceInfo);
    const txDataStr = JSON.stringify(txData);
    const computeNodes = policy.names;
    const signer = await this._getSigner(this.wallet);
    const dataId = this.data.register(dataTagStr, priceInfoStr, txDataStr, computeNodes, signer);
    return dataId;
  }

  /**
   * Asynchronously retrieves a list of data based on the specified status.
   * @param dataStatus - The status of the data to retrieve, defaults to 'Valid'.
   * @returns A promise that resolves to the retrieved data.
   */
  async getDataList(dataStatus: string = 'Valid') {
    const res = await this.data.allData(dataStatus);
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
   * Submits a task for processing with specific parameters.
   *
   * @param taskType - The type of task to be submitted.
   * @param wallet - The wallet object used for signing transactions.
   * @param dataId - The ID of the data to be processed in the task.
   *
   * @returns A promise that resolves to the ID of the submitted task.
   */
  async submitTask(taskType: string, wallet: any, dataId: string) {
    const key = await this.generateKey();
    this.userKey = key;

    let encData = await this.data.getDataById(dataId);

    encData = JSON.parse(encData);
    const exData = JSON.parse(encData.data);
    const nodeNames = exData.policy.names;
    const priceObj = JSON.parse(encData.price);
    const symbol = priceObj.symbol;

    if (!SUPPORTSYMBOLSONAO.includes(symbol)) {
      throw new Error(`Only support ${SUPPORTSYMBOLSONAO.join('/')} now!`);
    }
    const dataPrice = priceObj.price;
    //get node price

    const nodePrice = await this.fee.getComputationPrice(symbol);
    const totalPrice = Number(dataPrice) + Number(nodePrice) * nodeNames.length;
    const signer = await this._getSigner(wallet);

    try {
      const from = SUPPORTSYMBOLONAOFROMADDRESSMAP[symbol as keyof typeof SUPPORTSYMBOLONAOFROMADDRESSMAP];
      await this.helper.transfer(from, TASKS_PROCESS_ID, totalPrice.toString(), signer);
    } catch (err) {
      if (err === 'Insufficient Balance!') {
        throw new Error(
          'Insufficient Balance! Please ensure that your wallet balance is greater than ' + totalPrice + symbol
        );
      } else {
        throw err;
      }
    }

    let inputData = { dataId, consumerPk: key.pk };
    // const TASKTYPE= 'ZKLHEDataSharing'
    const taskId = await this.task.submit(
      taskType,
      dataId as string,
      JSON.stringify(inputData),
      COMPUTELIMIT,
      MEMORYLIMIT,
      nodeNames,
      signer
    );
    return taskId;
  }

  /**
   * Asynchronously retrieves the result of a task.
   *
   * @param taskId The unique identifier for the task.
   * @param timeout The timeout duration in milliseconds, defaults to 10000ms.
   * @returns A promise that resolves to an array of unsigned 8-bit integers representing the task result.
   */
  async getTaskResult(taskId: string, timeout: number = 10000): Promise<Uint8Array> {
    const taskStr = await this._getCompletedTaskPromise(taskId, timeout);
    const task = JSON.parse(taskStr);
    if (task.verificationError) {
      throw task.verificationError;
    }

    let dataId = JSON.parse(task.inputData).dataId;
    let encData = await this.data.getDataById(dataId);
    encData = JSON.parse(encData);
    let exData = JSON.parse(encData.data);
    // const dataTag = JSON.parse(encData.dataTag);
    // const storageType = dataTag?.storageType;
    const t = exData.policy.t;
    const n = exData.policy.n;
    let chosenIndices = [];
    let reencChosenSks = [];
    for (let i = 0; i < n; i++) {
      let name = exData.policy.names[i];

      if (task.result && task.result[name]) {
        let index = exData.policy.indices[i];
        chosenIndices.push(index);

        const reencSksObj = JSON.parse(task.result[name]);
        reencChosenSks.push(reencSksObj.reenc_sk);
      }
      if (chosenIndices.length >= t) {
        break;
      }
    }
    if (chosenIndices.length < t) {
      throw `Insufficient number of chosen nodes, expect at least ${t}, actual ${chosenIndices.length}`;
    }
    let encMsg = await this.storage.getData(exData.transactionId);

    if(!this.userKey){
      throw Error('Please set user key!');
    }
    const res = this.decrypt(reencChosenSks, this.userKey.sk, exData.nonce, encMsg, chosenIndices);
    return new Uint8Array(res.msg);
  }

  /**
   * Asynchronously retrieves a completed task by its ID within a specified timeout.
   *
   * @param {string} taskId - The unique identifier of the task to retrieve.
   * @param {number} timeout - The maximum time in milliseconds to wait for the task before timing out.
   * @returns {Promise<string>} A promise that resolves with the task as a string or rejects with a 'timeout' message.
   */
  private async _getCompletedTaskPromise(taskId: string, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const tick = async () => {
        const timeGap = performance.now() - start;
        const taskStr = await this.task.getCompletedTasksById(taskId);
        const task = JSON.parse(taskStr);
        if (task.id) {
          resolve(taskStr);
        } else if (timeGap > timeout) {
          reject('timeout');
        } else {
          setTimeout(tick, 500);
        }
      };
      tick();
    });
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
  private _getSigner(wallet: any): any {
    const signer = createDataItemSigner(wallet);
    return signer;
  }
}