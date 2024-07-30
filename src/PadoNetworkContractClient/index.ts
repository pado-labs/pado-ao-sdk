import ArweaveContract from './ArweaveContract';
import EthereumContract from './EthereumContract';


const ContractClient = {
  ao: ArweaveContract,
  ethereum: EthereumContract
};
export default class PadoNetworkContractClient {
  private _client: any;
  constructor(chainName: string) {
    this._client = new ContractClient[chainName]();
  }
  async nodes() {
    const res = await this._client.nodes();
    return res
  }
}