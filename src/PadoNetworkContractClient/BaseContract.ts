import { StorageType } from 'index.d';
import BaseArweave from '../CommonClasss/BaseArweave';
import PadoNetworkStorageClient from '../PadoNetworkStorageClient';


interface IBaseContract {
  // submitData(data: string | Uint8Array | ArrayBuffer, wallet: any): Promise<string>;
  // getDataById(dataId: string): Promise<Uint8Array>;
  // getDataList(): Promise<Uint8Array>;
  // submitTask(): Promise<string>;
  // getTaskResult(): Promise<string>;
}
export default class BaseContract extends BaseArweave implements IBaseContract {
  storageType: StorageType;
  storage: any;
  constructor(chainName, storageType: StorageType) {
    super();
    this.storage = new PadoNetworkStorageClient(storageType);
    this.storageType = this.storage.storageType;
  }
}