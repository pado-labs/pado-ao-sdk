import { StorageType } from 'index.d';
import ArseedingStorage from './ArseedingStorage';
import ArweaveStorage from './ArweaveStorage';

const StorageClient = {
  arweave: ArweaveStorage,
  arseeding: ArseedingStorage
};
export default class PadoNetworkStorageClient {
  private _client: any;
  storageType: StorageType;
  constructor(storageType: StorageType = StorageType.ARWEAVE) {
    this.storageType = storageType;
    this._client = new StorageClient[storageType]();
  }
  async submitData(data: Uint8Array, wallet: any): Promise<string> {
    const res = await this._client.submitData(data, wallet);
    return res;
  }
  async getData(transactionId: string): Promise<Uint8Array> {
    const res = await this._client.getData(transactionId);
    return res;
  }
}
