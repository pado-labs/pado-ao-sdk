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
} from '../../types/index';
import abiJson from './abi/dataMgt.json';
import BaseEVM from './BaseEVM';


export default class Data extends BaseEVM {
  constructor(chainName: ChainName, wallet: any, address: string) {
    super(chainName, wallet,address);
    this._initContractInstance(abiJson);
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