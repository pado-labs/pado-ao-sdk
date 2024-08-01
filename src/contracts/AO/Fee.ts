import { dryrun } from '@permaweb/aoconnect';
import { TASKS_PROCESS_ID } from '../../config';


export default class AOFee {
  constructor() {}
  async getComputationPrice(symbol: string) {
    const { Messages } = await dryrun({
      process: TASKS_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'ComputationPrice' },
        { name: 'PriceSymbol', value: symbol }
      ]
    });
    const res = Messages[0].Data;
    return res;
  }
}