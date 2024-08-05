import type {
  ChainName,
} from '../../types/index';
import abiJson from './abi/workerMgt.json';
import BaseEVM from './BaseEVM';


export default class Worker extends BaseEVM {
  constructor(chainName: ChainName, wallet: any) {
    super(chainName, wallet);
    this._initContractInstance(abiJson);
  }

}