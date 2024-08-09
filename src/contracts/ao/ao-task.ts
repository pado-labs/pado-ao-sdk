import { dryrun, message, result } from '@permaweb/aoconnect';
import { TASKS_PROCESS_ID } from '../../config';
import { getMessageResultData } from './util/utils';

export class AoTask {
  constructor() {}
  /**
   * Asynchronously submits a task to the system.
   *
   * @param taskType - The type of the task to be submitted.
   * @param dataId - Identifier for the data associated with the task.
   * @param inputData - Input data for the task in string format.
   * @param computeLimit - Compute resource limit for the task.
   * @param memoryLimit - Memory resource limit for the task.
   * @param computeNodes - Array of compute nodes involved in the task.
   * @param signer - Authentication object or function to sign the request.
   *
   * @returns A promise that resolves to the response data from the system after submitting the task.
   */
  async submit(
    taskType: string,
    dataId: string,
    inputData: string,
    computeLimit: string,
    memoryLimit: string,
    computeNodes: string[],
    signer: any
  ) {
    const msgId = await message({
      process: TASKS_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'Submit' },
        { name: 'TaskType', value: taskType },
        { name: 'DataId', value: dataId },
        { name: 'ComputeLimit', value: computeLimit },
        { name: 'MemoryLimit', value: memoryLimit },
        { name: 'ComputeNodes', value: JSON.stringify(computeNodes) }
      ],
      signer: signer,
      data: inputData
    });

    let Result = await result({
      message: msgId,
      process: TASKS_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  /**
   * Asynchronously retrieves the list of pending tasks.
   *
   * This function queries for the current pending tasks by sending a specific dryrun request.
   *
   * @returns {Promise<any>} A promise that resolves to the response data containing the pending tasks.
   */
  async getPendingTasks() {
    let { Messages } = await dryrun({
      process: TASKS_PROCESS_ID,
      tags: [{ name: 'Action', value: 'GetPendingTasks' }]
    });
    const res = Messages[0].Data;
    return res;
  }

  /**
   * Asynchronously reports the result of a task to a specified process.
   *
   * @param taskId - The unique identifier for the task.
   * @param nodeName - The name of the node executing the task.
   * @param taskResult - The result of the task execution.
   * @param signer - The entity used to sign the message.
   *
   * @returns The result data extracted from the message response.
   */
  async reportResult(taskId: string, nodeName: string, taskResult: string, signer: any) {
    const msgId = await message({
      process: TASKS_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'ReportResult' },
        { name: 'TaskId', value: taskId },
        { name: 'NodeName', value: nodeName }
      ],
      signer: signer,
      data: taskResult
    });
    let Result = await result({
      message: msgId,
      process: TASKS_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  /**
   * Asynchronously retrieves completed tasks by the specified task ID.
   * @param taskId The unique identifier of the task to retrieve.
   * @returns A string representation of the task data, or an empty string if no data is found.
   */
  async getCompletedTasksById(taskId: string) {
    let { Messages } = await dryrun({
      process: TASKS_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'GetCompletedTaskById' },
        { name: 'TaskId', value: taskId }
      ]
    });
    //console.log("getCompletedTasksById Messages=", Messages);
    let res = '{}';
    if (Messages[0] && Messages[0].Data) {
      res = Messages[0].Data;
    }
    return res;
  }

  /**
   * Asynchronously retrieves completed tasks.
   *
   * @returns A promise that resolves to the response data containing completed tasks.
   */
  async getCompletedTasks() {
    let { Messages } = await dryrun({
      process: TASKS_PROCESS_ID,
      tags: [{ name: 'Action', value: 'GetCompletedTasks' }]
    });
    const res = Messages[0].Data;
    return res;
  }

  /**
   * Asynchronously retrieves all tasks by executing a dry run process.
   * @returns {Promise<any>} A promise that resolves to the result containing all tasks.
   */
  async getAllTasks() {
    let { Messages } = await dryrun({
      process: TASKS_PROCESS_ID,
      tags: [{ name: 'Action', value: 'GetAllTasks' }]
    });
    const res = Messages[0].Data;
    return res;
  }
}
