import type { StorageType } from "./index.d";

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
