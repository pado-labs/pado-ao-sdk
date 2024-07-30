



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
  async nodes(data: string | Uint8Array | ArrayBuffer, wallet: any): Promise<string> {
    return Promise.resolve('');
  }
  
}