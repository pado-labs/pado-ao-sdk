import { StorageType, Wallets } from '../types/index';
import Utils from '../Common/Utils';
import PadoNetworkStorageClient from '../PadoNetworkStorageClient';


interface IBaseContract {
  // uploadData(data: string | Uint8Array | ArrayBuffer, wallet: any): Promise<string>;
  // getDataById(dataId: string): Promise<Uint8Array>;
  // getDataList(): Promise<Uint8Array>;
  // submitTask(): Promise<string>;
  // getTaskResult(): Promise<string>;
}
export default class BaseContract extends Utils implements IBaseContract {
  storageType: StorageType;
  storage: any;
  wallet: any;
  storageWallet: any;
  constructor(chainName:any, storageType: StorageType, wallets:  Wallets) {
    super();
    this.storage = new PadoNetworkStorageClient(storageType);
    this.storageType = this.storage.storageType;
    this.wallet = wallets.wallet;
    this.storageWallet = wallets.storageWallet;
  }
}