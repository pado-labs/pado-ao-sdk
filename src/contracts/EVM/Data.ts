// import { Contract  } from '@ethersproject/contracts';
// import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { DATACONTRACTADDRESSES } from '../../config';
import type {
  Address,
  Bytes,
  Bytes32,
  ChainName,
  DataItem,
  DataItems,
  EncryptionSchema,
  PrepareRegistryReturnType,
  PriceInfoT
} from '../../index.d';
import BaseData from '../BaseData';

interface IData {
  contractAddress: string;
  contractInstance: any;
  prepareRegistry(encryptionSchema: EncryptionSchema): Promise<PrepareRegistryReturnType>;
  register(dataId: Bytes32, dataTag: string, priceInfo: PriceInfoT, dataContent: Bytes): Promise<Bytes32>;
  getAllData(): Promise<DataItems>;
  getDataByOwner(owner: Address): Promise<DataItems>;
  getDataById(dataId: Bytes32): Promise<DataItem>;
  deleteDataById(dataId: Bytes32): void;
}
export default class EVMData extends BaseData {
  contractAddress: string;
  /**
   * @param chainName The name of the chain, used to identify and differentiate between different chains.
   * @param provider The provider object for the blockchain, used to establish and manage the connection with the blockchain.
   */
  constructor(chainName: ChainName, provider: any) {
    super();
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
   * @notice Data Provider prepare to register confidential data to PADO Network.
   * @param encryptionSchema EncryptionSchema
   * @return dataId and publicKeys data id and public keys
   */
  async prepareRegistry(encryptionSchema: EncryptionSchema): Promise<PrepareRegistryReturnType> {
    return await this.contractInstance.prepareRegistry(encryptionSchema);
  }

  /**
   * @notice Data Provider register confidential data to PADO Network.
   * @param dataId Data id for registry, returned by prepareRegistry.
   * @param dataTag The tag of data, providing basic information about data.
   * @param priceInfo The price infomation of data.
   * @param dataContent The content of data.
   * @return The UID of the data
   */
  async register(dataId: Bytes32, dataTag: string, priceInfo: PriceInfoT, dataContent: Bytes): Promise<Bytes32> {
    return await this.contractInstance.register(dataId, dataTag, priceInfo, dataContent);
  }

  /**
   * @notice Get all data registered by Data Provider
   * @return return all data
   */
  async getAllData(): Promise<DataItems> {
    return await this.contractInstance.getAllData();
  }

  /**
   * @notice Get data by owner
   * @param owner The owner of data
   * @return return data owned by the owner
   */
  async getDataByOwner(owner: Address): Promise<DataItems> {
    return await this.contractInstance.getDataByOwner(owner);
  }

  /**
   * @notice Get data by dataId
   * @param dataId The identifier of the data
   * @return return the data
   */
  async getDataById(dataId: Bytes32): Promise<DataItem> {
    return await this.contractInstance.getDataById(dataId);
  }

  /**
   * @notice Delete data by dataId
   * @param dataId The identifier of the data
   * @return None.
   */
  async deleteDataById(dataId: Bytes32): Promise<void> {
    return await this.contractInstance.deleteDataById(dataId);
  }
}
