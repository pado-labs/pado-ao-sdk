import { createDataItemSigner } from '@permaweb/aoconnect';
import Arweave from 'arweave';
import { AOCRED_PROCESS_ID, COMPUTELIMIT, MEMORYLIMIT, TASKS_PROCESS_ID, WAR_PROCESS_ID } from '../config';
import { StorageType } from '../index';
import type { ComputingInfoRequest, TaskDataInfoRequest } from '../index.d';
import { getDataFromArseeding } from '../padoarseeding';
import { ARConfig, getDataFromAR } from '../padoarweave';
import { getCompletedTasksById, submit } from '../processes/tasks';
import Data from './Data';
import Fee from './Fee';
import Helper from './Helper';
import { decrypt } from './utils';


interface ITask {
  chainName: string;
  submitTask(
    dataUserPk: string,
    wallet: any,
    taskType: string,
    dataId?: string,
    tokenSymbol?: string,
    dataInfoRequest?: TaskDataInfoRequest,
    computingInfoRequest?: ComputingInfoRequest
  ): Promise<string>;
  getResult(taskId: string, dataUserSk: string, timeout?: number): Promise<Uint8Array>;
}

export default class Task implements ITask {
  chainName: string;

  constructor(chainName: string) {
    this.chainName = chainName;
  }

  /**
   * Submit a task to PADO Network. And must pay the data fee corresponding to the dataId and the computing fee of the PADO Node. Now each task charges a certain amount of AOCRED(TestToken) per computing node,  and the getComputationPrice can get the amount.
   *
   * @param dataUserPk - The user's public key generated by keygen
   * @param wallet - The  wallet json object, this wallet must have enough token. Pass `window.arweaveWallet` or 'window.ethereum' in a browser.
   * @param taskType - The type of task.
   * @param dataId - (optional)The data id.
   * @param tokenSymbol - (optional)The symbol of the token paid by the user.
   * @param dataInfoRequest - (optional)The data request information related to the task.
   * @param computingInfoRequest - (optional)The computing info about the task.
   * @returns The submited task id
   */
  async submitTask(
    dataUserPk: string,
    wallet: any,
    taskType: string,
    dataId?: string,
    tokenSymbol?: string,
    dataInfoRequest?: TaskDataInfoRequest,
    computingInfoRequest?: ComputingInfoRequest
  ) {
    const dataInstance = new Data(this.chainName);
    console.log('tokenSymbol', tokenSymbol, dataInfoRequest, computingInfoRequest);
    let encData = await dataInstance.getDataById(dataId as string);
    console.log('encData1', encData);
    const exData = JSON.parse(encData.data);
    console.log('encData2', encData);
    const nodeNames = exData.policy.names;
    const priceObj = JSON.parse(encData.price);
    const symbol = priceObj.symbol;
    if (symbol !== 'AOCRED' && symbol !== 'wAR') {
      throw new Error('Only support AOCRED/wAR now!');
    }
    const dataPrice = priceObj.price;
    //get node price
    const feeInstance = new Fee(this.chainName);
    const nodePrice = await feeInstance.getComputationPrice();
    const totalPrice = Number(dataPrice) + Number(nodePrice) * nodeNames.length;
    console.log('totalPrice', totalPrice, dataPrice, nodePrice);
    const signer = createDataItemSigner(wallet);

    try {
      const helperInstance = new Helper(this.chainName);
      let from;
      if (symbol === 'AOCRED') {
        from = AOCRED_PROCESS_ID;
      } else if (symbol === 'wAR') {
        from = WAR_PROCESS_ID;
      }
      await helperInstance.transfer(from, TASKS_PROCESS_ID, totalPrice.toString(), signer);
    } catch (err) {
      if (err === 'Insufficient Balance!') {
        throw new Error(
          'Insufficient Balance! Please ensure that your wallet balance is greater than ' + totalPrice + symbol
        );
      } else {
        throw err;
      }
    }

    let inputData = { dataId: dataId, consumerPk: dataUserPk };
    // const TASKTYPE= 'ZKLHEDataSharing'
    const taskId = await submit(
      taskType,
      dataId as string,
      JSON.stringify(inputData),
      COMPUTELIMIT,
      MEMORYLIMIT,
      nodeNames,
      signer
    );
    return taskId;
  }

  /**
   * Get the result of the task
   *
   * @param taskId The task id
   * @param dataUserSk - The user's secret key generated by keygen
   * @param timeout Timeout in milliseconds (default: 10 seconds)
   * @returns Return plain data
   */
  async getResult(taskId: string, dataUserSk: string, timeout: number = 10000) {
    const taskStr = await this._getCompletedTaskPromise(taskId, timeout);
    const task = JSON.parse(taskStr);

    if (task.verificationError) {
      throw task.verificationError;
    }

    let dataId = JSON.parse(task.inputData).dataId;
    const dataInstance = new Data(this.chainName);
    let encData = await dataInstance.getDataById(dataId);

    let exData = JSON.parse(encData.data);
    const dataTag = JSON.parse(encData.dataTag);
    const storageType = dataTag?.storageType;
    const t = exData.policy.t;
    const n = exData.policy.n;
    let chosenIndices = [];
    let reencChosenSks = [];
    for (let i = 0; i < n; i++) {
      let name = exData.policy.names[i];

      if (task.result && task.result[name]) {
        let index = exData.policy.indices[i];
        chosenIndices.push(index);

        const reencSksObj = JSON.parse(task.result[name]);
        reencChosenSks.push(reencSksObj.reenc_sk);
      }
      if (chosenIndices.length >= t) {
        break;
      }
    }
    if (chosenIndices.length < t) {
      throw `Insufficient number of chosen nodes, expect at least ${t}, actual ${chosenIndices.length}`;
    }
    let encMsg;
    if (StorageType.ARSEEDING === storageType) {
      encMsg = await getDataFromArseeding(exData.transactionId);
    } else {
      const arweave = Arweave.init(ARConfig);
      encMsg = await getDataFromAR(arweave, exData.transactionId);
    }

    const res: any = decrypt(reencChosenSks, dataUserSk, exData.nonce, encMsg, chosenIndices);
    return new Uint8Array(res.msg);
  }

  /**
   * Get the completed task
   *
   * @param taskId The task id
   * @param timeout Timeout in milliseconds (default: 10 seconds)
   * @returns The node infos
   */
  private async _getCompletedTaskPromise(taskId: string, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const tick = async () => {
        const timeGap = performance.now() - start;
        const taskStr = await getCompletedTasksById(taskId);
        const task = JSON.parse(taskStr);
        if (task.id) {
          resolve(taskStr);
        } else if (timeGap > timeout) {
          reject('timeout');
        } else {
          setTimeout(tick, 500);
        }
      };
      tick();
    });
  }
}