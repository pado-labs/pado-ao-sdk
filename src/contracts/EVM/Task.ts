import type { Bytes, Bytes32, Uint32,Task } from '../../index.d';
import BaseEVM from './BaseEVM';

export default class TaskC extends BaseEVM{
  /**
   * @notice Network Consumer submit confidential computing task to PADO Network.
   * @param taskType The type of the task.
   * @param consumerPk The Public Key of the Network Consumer.
   * @param dataId The id of the data. If provided, dataInfoRequest is ignored.
   * @return The UID of the new task
   */
  async submit(taskType: Uint32, consumerPk: Bytes, dataId: Bytes32): Promise<Bytes32> {
    const taskId = await this.contractInstance.submit(taskType, consumerPk, dataId);
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