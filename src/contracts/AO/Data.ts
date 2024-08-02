import { dryrun, message, result } from '@permaweb/aoconnect';
import { DATAREGISTRY_PROCESS_ID } from '../../config';
import { type EncryptionSchema, type nodeInfo, type PolicyInfo } from '../../index.d';
import { getMessageResultData } from '../../processes/utils';
import Worker from './Worker';

export default class AOData {
  contractInstance: any;
  /**
   * @notice Data Provider prepare to register confidential data to PADO Network.
   * @param encryptionSchema EncryptionSchema
   * @return policy and public keys
   */
  async prepareRegistry(encryptionSchema: EncryptionSchema): Promise<any> {
    let nodeInfos = await new Worker().getNodeInfos(Number(encryptionSchema.n), true);
    const [policy, publicKeys] = await this._formatPolicy(encryptionSchema, nodeInfos);
    return [policy, publicKeys];
  }
  /**
   * Asynchronously registers data.
   *
   * This method is used to register data within the data registry process. It accomplishes this by sending a message containing registration details and waiting for the processing result of that message to complete the registration process.
   *
   * @param dataTag The data tag, used to identify the data being registered.
   * @param price The price of the data, specifying the selling price of this data.
   * @param exData Extra data, which can be any supplementary information related to the registered data.
   * @param computeNodes An array of compute nodes, indicating the compute nodes associated with this data.
   * @param signer  The formatted signer object.
   * @returns The result data obtained from the message processing result.
   */
  async register(dataTag: string, price: string, exData: string, computeNodes: string[], signer: any) {
    const msgId = await message({
      process: DATAREGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'Register' },
        { name: 'DataTag', value: dataTag },
        { name: 'Price', value: price },
        { name: 'ComputeNodes', value: JSON.stringify(computeNodes) }
      ],
      signer: signer,
      data: exData
    });

    let Result = await result({
      message: msgId,
      process: DATAREGISTRY_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  /**
   * Asynchronously retrieves all data based on the specified data status.
   *
   * @param dataStatus - The status of the data to retrieve, defaults to 'Valid'.
   * @returns A promise that resolves to the retrieved data.
   */
  async allData(dataStatus: string = 'Valid') {
    let { Messages } = await dryrun({
      process: DATAREGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'AllData' },
        { name: 'DataStatus', value: dataStatus }
      ]
    });
    const res = Messages[0].Data;
    return res;
  }

  /**
   * Asynchronously retrieves data by its ID.
   *
   * This function calls the dryrun interface, passing a specific process ID and tags to request information for a particular data ID.
   * It is primarily applicable in scenarios where data needs to be fetched from the data registry center based on the data ID.
   *
   * @param dataId The unique identifier ID of the data.
   * @returns The specific data extracted from the interface response.
   */
  async getDataById(dataId: string) {
    let { Messages } = await dryrun({
      process: DATAREGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'GetDataById' },
        { name: 'DataId', value: dataId }
      ]
    });
    const res = Messages[0].Data;
    return res;
  }

  /**
   * Formats the encryption policy and collects public keys of nodes.
   *
   * This method takes an encryption schema and an array of node information,
   * then formats the policy by incorporating indices and names from node information,
   * and also compiles an array of public keys from these nodes.
   * It is primarily used to prepare the configuration required for encrypting data.
   *
   * @param encryptionSchema - The encryption schema object containing parameters of the encryption policy.
   * @param nodeInfos - An array of nodeInfo objects, each containing details about a node including its index, name, and public key.
   * @returns A tuple where the first element is the formatted policyInfo object with updated indices and names, and the second element is an array of public keys corresponding to the nodes.
   */
  private _formatPolicy(encryptionSchema: EncryptionSchema, nodeInfos: Array<nodeInfo>): [PolicyInfo, string[]] {
    let policy = Object.assign(
      {
        indices: [] as number[],
        names: [] as string[]
      },
      encryptionSchema
    );

    let nodesPublicKey = [] as string[];
    for (let i = 0; i < nodeInfos.length; i++) {
      policy.indices.push(nodeInfos[i].index); // TODO-ysm
      policy.names.push(nodeInfos[i].name); // TODO-ysm
      nodesPublicKey.push(nodeInfos[i].pk);
    }
    const formatPolicy = { ...policy, t: Number(policy.t), n: Number(policy.n) };

    return [formatPolicy, nodesPublicKey];
  }
}