import { ethers } from 'ethers';
import { DATACONTRACTADDRESSES } from '../../config';
import type { Bytes, Bytes32, Uint32,Task } from '../../index.d';


export default class TaskC {
  contractAddress: string;
  contractInstance: any;
  /**
   * @param chainName The name of the chain, used to identify and differentiate between different chains.
   * @param provider The provider object for the blockchain, used to establish and manage the connection with the blockchain.
   */
  constructor(chainName: ChainName, provider: any = window.ethereum) {
    // TODO-ysm provider use window.etherrum directly?
    this.contractAddress = DATACONTRACTADDRESSES[chainName];
    this._initContractInstance(provider);
  }
  /**
   * Initializes the contract instance.
   *
   * This function is responsible for initializing an ethers.Contract instance using the provided provider.
   * This instance can then be used to interact with a specific smart contract. The use of ethers.js library
   * provides a simple way to interface with the Ethereum network, including signing and sending transactions.
   *
   * @param provider A provider used to connect to the Ethereum network. It should be a Web3Provider instance
   *                 or another supported provider. The provider offers methods to interact with the Ethereum
   *                 blockchain.
   * @return None. This function initializes the contract instance by modifying an instance variable of the class.
   */
  _initContractInstance(provider: any) {
    const abiJson = [''];
    let providerT = new ethers.providers.Web3Provider(provider);
    let signer = providerT.getSigner();
    this.contractInstance = new ethers.Contract(this.contractAddress, abiJson, signer);
  }

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