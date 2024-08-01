import BaseArweave from '../CommonClasss/BaseArweave'
import { StorageType } from './../index.d';


interface IBaseStorage {
  submitData(data: string | Uint8Array | ArrayBuffer, wallet: any): Promise<string>;
  getData(transactionId: string): Promise<Uint8Array>
}
export default class BaseStorage extends BaseArweave implements IBaseStorage  {
  
  async submitData(data: string | Uint8Array | ArrayBuffer, wallet: any): Promise<string> {
    return Promise.resolve('')
  }
  async getData(transactionId: string): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array())
  }
}