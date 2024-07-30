import Arweave from 'arweave';
import { StorageType } from './../index.d';


const ARConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
};
interface IBaseStorage {
  arweave: Arweave;
  submitData(data: string | Uint8Array | ArrayBuffer, wallet: any): Promise<string>;
  getData(transactionId: string): Promise<Uint8Array>
}
export default class BaseStorage implements IBaseStorage {
  arweave: Arweave;
  constructor() {
    this.arweave = Arweave.init(ARConfig);
  }
  async submitData(data: string | Uint8Array | ArrayBuffer, wallet: any): Promise<string> {
    return Promise.resolve('')
  }
  async getData(transactionId: string): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array())
  }
}