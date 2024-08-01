import { ethers } from 'ethers';
import type { Address, Allowance, Bytes32, FeeTokenInfo, Uint256 } from '../../index.d';

export default class Fee {
  contractAddress: string;
  contractInstance: any;
  feeTokens: FeeTokenInfo[];
  /**
   * @param chainName The name of the chain, used to identify and differentiate between different chains.
   * @param provider The provider object for the blockchain, used to establish and manage the connection with the blockchain.
   */
  constructor(chainName: ChainName, provider: any = window.ethereum) {
    // TODO-ysm provider use window.etherrum directly?
    this.contractAddress = DATACONTRACTADDRESSES[chainName];
    this.contractInstance = null;
    this._initContractInstance(provider);
    this.feeTokens = [];
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
   * @notice Get the all fee tokens.
   * @return Returns the all fee tokens info.
   */
  async getFeeTokens(): Promise<FeeTokenInfo[]> {
    const tokens = await this.contractInstance.getFeeTokens();
    return tokens;
  }

  /**
   * @notice Determine whether a token can pay the handling fee.
   * @return Returns true if a token can pay fee, otherwise returns false.
   */
  async isSupportToken(tokenSymbol: string): Promise<boolean> {
    const isSupport = await this.contractInstance.isSupportToken(tokenSymbol);
    return isSupport;
  }

  /**
   * @notice Get fee token by token symbol.
   * @param tokenSymbol The token symbol.
   * @return Returns the fee token.
   */
  async getFeeTokenBySymbol(tokenSymbol: string): Promise<FeeTokenInfo> {
    const feeToken = await this.contractInstance.getFeeTokenBySymbol(tokenSymbol);
    return feeToken;
  }

  /**
   * @notice Get allowance info.
   * @param dataUser The address of data user
   * @param tokenSymbol The token symbol for the data user
   * @return Allowance for the data user
   */
  async getAllowance(userAddress: Address, tokenSymbol: string): Promise<Allowance> {
    const allowance = await this.contractInstance.getAllowance(userAddress, tokenSymbol);
    return allowance;
  }

  /**
   * @notice TaskMgt contract request locking fee.
   * @param taskId The task id.
   * @param submitter The submitter of the task.
   * @param tokenSymbol The fee token symbol.
   * @param workerOwners The owner address of all workers which have already run the task.
   * @param dataPrice The data price of the task.
   * @param dataProviders The address of data providers which provide data to the task.
   * @return Returns true if the settlement is successful.
   */
  async lock(
    taskId: Bytes32,
    submitter: Address,
    tokenSymbol: string,
    workerOwners: Address[],
    dataPrice: Uint256,
    dataProviders: Address[]
  ): Promise<Allowance> {
    const allowance = await this.contractInstance.lock(
      taskId,
      submitter,
      tokenSymbol,
      workerOwners,
      dataPrice,
      dataProviders
    );
    return allowance;
  }

  /**
   * @notice TaskMgt contract request transfer tokens.
   * @param from The address from which transfer token.
   * @param tokenSymbol The token symbol
   * @param amount The amount of tokens to be transfered
   */
  async transferToken(from: Address, tokenSymbol: string, amount: Uint256): Promise<Allowance> {
    const allowance = await this.contractInstance.transferToken(
      from,
      tokenSymbol,
      amount
    );
    return allowance;
  }
}
