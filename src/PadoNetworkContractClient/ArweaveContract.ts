import AOWorker from 'contracts/AO/Worker';
import BaseStorage from './BaseContract';


export default class ArweaveStorage extends BaseStorage {
  workerContract: any;
  constructor() {
    super();
    this.workerContract = new AOWorker();
  }
  
  async nodes(): Promise<string> {
    const res = await this.workerContract.nodes()
    return res;
  }
}