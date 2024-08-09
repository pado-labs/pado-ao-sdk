import { ethers } from 'ethers';
import type { ChainName } from '../../types/index';


export default class BaseEvm {
  contractInstance: any;
  contractAddress: string;
  wallet: any;
  /**
   * @param chainName The name of the chain, used to identify and differentiate between different chains.
   * @param provider The provider object for the blockchain, used to establish and manage the connection with the blockchain.
   */
  constructor(chainName: ChainName, wallet: any, address: string) {
    this.contractAddress = address;
    this.wallet = wallet;
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
  _initContractInstance(abiJson: any) {
    let providerT = new ethers.providers.Web3Provider(this.wallet);
    let signer = providerT.getSigner();
    this.contractInstance = new ethers.Contract(this.contractAddress, abiJson, signer);
  }
}