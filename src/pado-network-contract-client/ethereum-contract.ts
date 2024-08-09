import Data from '../contracts/evm/data';
import Fee from '../contracts/evm/fee';
import Helper from '../contracts/evm/helper';
import Task from '../contracts/evm/task';
import Worker from '../contracts/evm/worker';
import { DEFAULT_ENCRYPTION_SCHEMA, PADO_NETWORK_CONTRACT_ADDRESS } from '../config';
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
import BaseContract from './base-contract';
import { ethers } from 'ethers';
import { arseedingBase64ToHexStr, arseedingHexStrToBase64 } from '../common/str-util';


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
   * @param priceInfo - The data price symbol(symbol is optional, default is wAR) and price. Currently only wAR(the Wrapped AR in ao) is supported, with a minimum price unit of 1 (1 means 0.000000000001 wAR).
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
    encryptionSchema: EncryptionSchema = DEFAULT_ENCRYPTION_SCHEMA
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
      const publicKeyHashInStorageHexStr = publicKeys[i];
      const rawPk = await this.storage.getData(arseedingHexStrToBase64(publicKeyHashInStorageHexStr))
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
    const encryptData = this.encrypt_v2(rawPublickeys,data, policy);


    //save it to arweave
    const transactionId = await this.storage.submitData(encryptData);
    const transactionIdHexStr = arseedingBase64ToHexStr(transactionId);
    dataTag['storageType'] = this.storageType;
    const dataTagStr = JSON.stringify(dataTag);
    const priceInfoStr = {
      tokenSymbol: 'ETH',
      price: priceInfo.price // TODO-ysm bigint
    };
    console.log(`dataId:${dataId}`)
    console.log(`dataTagStr :${dataTagStr}`)
    console.log(`priceInfoStr:${priceInfoStr}`)
    console.log(`transactionIdHexStr:${transactionIdHexStr}`)
    const registryTx = await this.data.register(dataId, dataTag, priceInfoStr, transactionIdHexStr);
    const registryReceipt = await registryTx.wait();
    const registryEvent = registryReceipt.events.find((event: { event: any; })  => event.event === 'DataRegistered');
    if(!registryEvent){
      throw new Error('data register failed')
    }
    return registryEvent.args.dataId;
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
    const pkTransactionHashHexStr = arseedingBase64ToHexStr(pkTransactionHash);
    const tx = await this.task.submitTask(taskType, pkTransactionHashHexStr, dataId,totalPrice);
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
    const itemIdForArSeeding = arseedingHexStrToBase64(dataFromContract.dataContent);
    console.log(`itemIdForArSeeding:${itemIdForArSeeding}`)
    const encData = await this.storage.getData(itemIdForArSeeding);
    const chosenIndices = [];
    const reencChosenSks = [];
    for (let i = 0; i < task.computingInfo.results.length; i++) {
      if(task.computingInfo.results[i].length===0){
        continue;
      }
      const dataItemId = arseedingHexStrToBase64(task.computingInfo.results[i])
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