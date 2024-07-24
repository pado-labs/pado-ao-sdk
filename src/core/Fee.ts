import { getComputationPrice as fetchComputationPrice } from '../processes/tasks';

interface IFee {
  chainName: string;
  getComputationPrice(symbol?: string): Promise<string>;
}

export default class Fee implements IFee {
  chainName: string;

  constructor(chainName: string) {
    this.chainName = chainName;
  }

  /**
   * Obtain the computational cost for each node.
   *
   * @param symbol - The price symbol (default: wAR).
   * @returns The computational cost for each node.
   */
  async getComputationPrice(symbol: string = 'wAR') {
    // TODO
    console.log('symbol', symbol);
    const res = await fetchComputationPrice(symbol);
    return res;
  }
}
