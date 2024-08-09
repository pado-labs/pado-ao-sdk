import Arweave from 'arweave';
import { StorageType, WalletWithType,SupportedSymbols } from '../types/index';

interface IBaseStorage {
  submitData(data: string | Uint8Array | ArrayBuffer, symbol: SupportedSymbols): Promise<string>;

  getData(transactionId: string): Promise<Uint8Array>;
}

const ARConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
};

export default class BaseStorage implements IBaseStorage {
  storageType: StorageType;
  wallet: WalletWithType;
  arweave: Arweave;


  constructor(storageType: StorageType, wallet: WalletWithType) {
    this.storageType = storageType;
    this.wallet = wallet;
    this.arweave = Arweave.init(ARConfig);
  }

  async submitData(data: Uint8Array, symbol: SupportedSymbols): Promise<string> {
    return Promise.resolve('');
  }

  async getData(transactionId: string): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array());
  }
}