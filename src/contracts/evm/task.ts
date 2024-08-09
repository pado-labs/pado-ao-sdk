import type { Bytes, Bytes32, ChainName, Task, Uint32 } from '../../types/index';
import BaseEvm from './base-evm';
import abiJson from './abi/taskMgt.json';

export default class TaskC extends BaseEvm {
  constructor(chainName: ChainName, wallet: any,address: string) {
    super(chainName, wallet,address);
    this._initContractInstance(abiJson);
  }

  /**
   * @notice Network Consumer submit confidential computing task to PADO Network.
   * @param taskType The type of the task.
   * @param consumerPk The Public Key of the Network Consumer.
   * @param dataId The id of the data. If provided, dataInfoRequest is ignored.
   * @param value fee
   * @return The UID of the new task
   */
  async submitTask(taskType: Uint32, consumerPk: Bytes, dataId: Bytes32,  value: bigint): Promise<Bytes32> {
    console.log(`taskType :${taskType}`)
    console.log(`consumerPk :${consumerPk}`)
    console.log(`dataId :${dataId}`)
    console.log(`value :${value}`)
    const taskId = await this.contractInstance.submitTask(taskType, consumerPk, dataId, { value: value});
    return taskId;
  }

  /**
   * Asynchronously retrieves completed tasks by the specified task ID.
   * @param taskId The unique identifier of the task to retrieve.
   * @returns A string representation of the task data, or an empty string if no data is found.
   */
  async getCompletedTaskById(taskId: Bytes32): Promise<Task> {
    const res = await this.contractInstance.getCompletedTaskById(taskId);
    return res;
  }
}