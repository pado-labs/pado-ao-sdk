import Data from '../contracts/EVM/Data';
import Fee from '../contracts/EVM/Fee';
import Helper from '../contracts/EVM/Helper';
import Task from '../contracts/EVM/Task';
import Worker from '../contracts/EVM/Worker';
import { DEFAULTENCRYPTIONSCHEMA, PADO_NETWORK_CONTRACT_ADDRESS } from '../config';
import {
  ChainName,
  type CommonObject,
  type EncryptionSchema,
  type FeeTokenInfo,
  KeyInfo,
  type PriceInfo,
  StorageType,
  Wallets
} from '../types/index';
import BaseContract from './BaseContract';
import { ethers } from 'ethers';


export default class EthereumContract extends BaseContract {
  worker: any;
  data: any;
  task: any;
  fee: any;
  helper: any;
  userKey: KeyInfo | undefined;

  constructor(chainName: ChainName, storageType: StorageType, wallets: Wallets, userKey?: KeyInfo) {
    super(chainName, storageType, wallets);
    const addresses = PADO_NETWORK_CONTRACT_ADDRESS[chainName]
    this.worker = new Worker(chainName, wallets.wallet.wallet,(addresses as any).workerMgt);
    this.data = new Data(chainName, wallets.wallet.wallet,(addresses as any).dataMgt);
    this.task = new Task(chainName, wallets.wallet.wallet,(addresses as any).taskMgt);
    this.fee = new Fee(chainName, wallets.wallet.wallet,(addresses as any).feeMgt);
    this.helper = new Helper(wallets.wallet.wallet);
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

    const tx = await this.data.prepareRegistry(encryptionSchema);
    const receipt = await tx.wait();
    console.log(receipt)
    const event = receipt.events.find((event: { event: any; })  => event.event === 'DataPrepareRegistry');
    if(!event){
      throw new Error('prepareRegistry failed')
    }
    const dataId = event.args.dataId;
    const publicKeys = event.args.publicKeys;
    const indices = [];
    const names = new Array(Number(encryptionSchema.n)).fill('');

    //get publickeys
    const rawPublickeys = [];
    for (let i = 0; i < publicKeys.length; i++) {
      const rawPk = await this.storage.getData(this.hexToString(publicKeys[i]))
      rawPublickeys.push(Buffer.from(rawPk).toString('hex'))
      indices.push(i+1)
    }
    const policy = {
      t: Number(encryptionSchema.t),
      n: Number(encryptionSchema.n),
      indices,
      names
    };
    console.log('rawPublickeys',rawPublickeys)
    console.log('policy',policy)
    const data1 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const encryptData = this.encrypt_v2(rawPublickeys,data1, policy);


    //save it to arweave
    const transactionId = await this.storage.submitData(encryptData, this.storageWallet);
    const transactionIdBytes = '0x'+Buffer.from(this.stringToUint8Array(transactionId)).toString('hex');
    const dataTagStr = JSON.stringify(dataTag);
    const priceInfoStr = {
      tokenSymbol: 'ETH',
      price: priceInfo.price // TODO-ysm bigint
    };
    console.log(`dataId:${dataId}`)
    console.log(`dataTagStr :${dataTagStr}`)
    console.log(`priceInfoStr:${priceInfoStr}`)
    console.log(`transactionIdBytes:${transactionIdBytes}`)
    const registryTx = await this.data.register(dataId, dataTag, priceInfoStr, transactionIdBytes);
    const registryReceipt = await registryTx.wait();
    const registryEvent = registryReceipt.events.find((event: { event: any; })  => event.event === 'DataRegistered');
    if(!registryEvent){
      throw new Error('data register failed')
    }
    const newDataId = registryEvent.args.dataId;
    return newDataId;
  }


  stringToUint8Array(str: string) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }

    var data = new Uint8Array(arr);
    return data
  }

  hexToString = (hex:any)=>{
    hex = hex.startsWith('0x') ? hex.slice(2) : hex;

    const byteArray = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      byteArray[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }

    const decoder = new TextDecoder();
    return decoder.decode(byteArray);
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
  async submitTask(taskType: number, dataId: string) {
    //todo get from arweave
    let encData = await this.data.getDataById(dataId);
    const { priceInfo: priceObj, workerIds } = encData;
    const { tokenSymbol: symbol, price: dataPrice } = priceObj;
    debugger
    const isSupported = await this.fee.isSupportToken(symbol);
    if (!isSupported) {
      const supportTokens = await this.fee.getFeeTokens();
      const supportSymbols = supportTokens.map((i: FeeTokenInfo) => i.symbol);
      throw new Error(`Only support ${supportSymbols.join('/')} now!`);
    }
    //get node price

    const { computingPrice: nodePrice } = await this.fee.getFeeTokenBySymbol(symbol);
    const totalPrice = Number(dataPrice) + Number(nodePrice) * workerIds.length;

    if (!this.userKey) {
      throw Error('Please set user key!');
    }
    console.log(`Buffer.from(this.userKey.pk,'hex'):${Buffer.from(this.userKey.pk,'hex')}`)
    const pkTransactionHash = await this.storage.submitData(new Uint8Array(Buffer.from(this.userKey.pk,'hex')),this.storageWallet);
    const pkTransactionHashBytes = ethers.utils.hexlify(this.stringToUint8Array(pkTransactionHash));
    const tx = await this.task.submitTask(taskType, pkTransactionHashBytes, dataId,totalPrice);
    const receipt = await tx.wait();
    console.log(receipt)
    const event = receipt.events.find((event: { event: any; })  => event.event === 'TaskDispatched');
    if(!event){
      throw new Error('submitTask failed')
    }
    return event.args.taskId;
  }


  async getTaskResult(taskId: string, timeout: number = 10000): Promise<Uint8Array> {
    const task = await this.task.getCompletedTaskById(taskId);

    let dataFromContract = await this.data.getDataById(task.dataId);
    const itemIdForArSeeding = this.hexToString(dataFromContract.dataContent);
    console.log(`itemIdForArSeeding:${itemIdForArSeeding}`)
    const encData = await this.storage.getData(itemIdForArSeeding);
    // dataFromContract = JSON.parse(dataFromContract);
    // let exData = JSON.parse(dataFromContract.data);

    const { encryptionSchema, workerIds, dataContent } = dataFromContract;
    // let uint8Array = new Uint8Array(dataContent);
    // let decoder = new TextDecoder('utf-8');
    // let transactionId = decoder.decode(uint8Array);
    // let encMsg = await this.storage.getData(this.hexToString(dataContent));
    const chosenIndices = [];

    const reencChosenSks = [];
    for (let i = 0; i < task.computingInfo.results.length; i++) {
      if(task.computingInfo.results[i].length===0){
        continue;
      }
      const dataItemId = this.hexToString(task.computingInfo.results[i])
      reencChosenSks.push(Buffer.from(await this.storage.getData(dataItemId)).toString('hex'));
      chosenIndices.push(i+1);
    }


    if (!this.userKey) {
      throw Error('Please set user key!');
    }
    console.log(`reencChosenSks:${reencChosenSks}`)
    console.log(`encData:${encData}`)
    console.log(`chosenIndices:${chosenIndices}`)
    return this.decrypt_v2(reencChosenSks, this.userKey.sk, encData, chosenIndices);
  }
}