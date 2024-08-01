import { dryrun } from '@permaweb/aoconnect';
import { TASKS_PROCESS_ID } from '../../config';


export default class AOFee {
  constructor() {}

  /**
   * Asynchronously retrieves a completed task by its ID within a specified timeout.
   *
   * @param {string} taskId - The unique identifier of the task to retrieve.
   * @param {number} timeout - The maximum time in milliseconds to wait for the task before timing out.
   * @returns {Promise<string>} A promise that resolves with the task as a string or rejects with a 'timeout' message.
   */
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