import type { StorageType } from "./index.d";
import PadoNetworkContractClient from './PadoNetworkContractClient';
import PadoNetworkStorageClient from './PadoNetworkStorageClient';


export default class PadoNetworkClient {
  padoNetworkContractClient: any;
  padoNetworkStorageClient: any;
  constructor(chainName: string, storageType: StorageType) {
    this.padoNetworkContractClient = new PadoNetworkContractClient(chainName, storageType);
    this.padoNetworkStorageClient = new PadoNetworkStorageClient(storageType);
  }
  encryptData() {}
  submitData() {}
  uploadData() {}
  listData() {}
  generateKey() {}
  submitTask() {}
  getTaskResult() {}
  getComputationPrice() {}
}