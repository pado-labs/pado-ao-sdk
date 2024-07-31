import type { ChainName, StorageType } from '../index.d';
import ArweaveContract from './ArweaveContract';
import EthereumContract from './EthereumContract';
import { allData } from '../processes/dataregistry';


const ContractClient = {
  ao: ArweaveContract,
  sepolia: EthereumContract
};
export default class PadoNetworkContractClient {
  private _client: any;
  private _storageType: StorageType;
  constructor(chainName: ChainName, storageType: StorageType) {
    this._client = new ContractClient[chainName]();
    this._storageType = storageType;
  }
  async allData(dataStatus: string = 'Valid'): Promise<string> {
    const res = await this._client.allData(dataStatus)
    return res
  }
  async nodes() {
    const res = await this._client.nodes();
    return res;
  }
}