import { StorageType, Wallets, WalletWithType } from '../types/index';
import Utils from '../common/utils';
import PadoNetworkStorageClient from '../pado-network-storage-client';


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
  wallet: WalletWithType;
  storageWallet: WalletWithType;
  constructor(chainName:any, storageType: StorageType, wallets:  Wallets) {
    super();
    this.storage = new PadoNetworkStorageClient(storageType,wallets.storageWallet);
    this.storageType = this.storage.storageType;
    this.wallet = wallets.wallet;
    this.storageWallet = wallets.storageWallet;
  }
}