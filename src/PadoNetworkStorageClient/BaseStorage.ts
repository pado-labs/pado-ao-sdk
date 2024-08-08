import Arweave from 'arweave';
import { WalletWithType } from 'types';

interface IBaseStorage {
  arweave: Arweave;
  submitData(data: string | Uint8Array | ArrayBuffer, wallet: WalletWithType): Promise<string>;
  getData(transactionId: string): Promise<Uint8Array>;
}


const ARConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
};
export default class BaseStorage implements IBaseStorage {
  arweave: Arweave;
  constructor() {
    this.arweave = Arweave.init(ARConfig);
  }
  async submitData(data: Uint8Array, wallet: WalletWithType): Promise<string> {
    console.log(data,wallet);
    return Promise.resolve('');
  }
  async getData(transactionId: string): Promise<Uint8Array> {
    console.log(transactionId);
    return Promise.resolve(new Uint8Array());
  }
}