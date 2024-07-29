import { message, result } from '@permaweb/aoconnect';

import { DATAREGISTRY_PROCESS_ID } from '../../config';
import type {
  EncryptionSchema,
} from '../../index.d';
import BaseData from '../BaseData';
import { getMessageResultData } from '../../processes/utils';
import Worker from './Worker';

export default class AOData extends BaseData {
  /**
   * @notice Data Provider prepare to register confidential data to PADO Network.
   * @param encryptionSchema EncryptionSchema
   * @return publicKeys data id and public keys
   */
  async prepareRegistry(encryptionSchema: EncryptionSchema): Promise<any> {
    let policy = Object.assign(
      {
        indices: [] as number[],
        names: [] as string[]
      },
      encryptionSchema
    );
    let nodeInfos = await new Worker().getNodeInfos(Number(policy.n), true);

    let nodesPublicKey = [] as string[];
    for (let i = 0; i < nodeInfos.length; i++) {
      policy.indices.push(nodeInfos[i].index);
      policy.names.push(nodeInfos[i].name);
      nodesPublicKey.push(nodeInfos[i].pk);
    }
    return [policy, nodesPublicKey];
  }

  

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

}
