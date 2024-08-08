import type {
  ChainName,
} from '../../types/index';
import abiJson from './abi/workerMgt.json';
import BaseEVM from './BaseEVM';


export default class Worker extends BaseEVM {
  constructor(chainName: ChainName, wallet: any,address: string) {
    super(chainName, wallet,address);
    this._initContractInstance(abiJson);
  }

}