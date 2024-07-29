import { dryrun, message, result } from '@permaweb/aoconnect';
import { NODEREGISTRY_PROCESS_ID } from '../../config';
import type { nodeInfo } from '../../index.d';
import { getMessageResultData } from '../../processes/utils';

export default class AOWorker {
  constructor() {}
  async register_or_update(action: string, name: string, pk: string, desc: string, signer: any) {
    const msgId = await message({
      process: NODEREGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: action },
        { name: 'Name', value: name },
        { name: 'Desc', value: desc }
      ],
      signer: signer,
      data: pk
    });

    let Result = await result({
      message: msgId,
      process: NODEREGISTRY_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  async register(name: string, pk: string, desc: string, signer: any) {
    return await this.register_or_update('Register', name, pk, desc, signer);
  }

  async update(name: string, desc: string, signer: any) {
    return await this.register_or_update('Update', name, '', desc, signer);
  }

  async deleteNode(name: string, signer: any) {
    const msgId = await message({
      process: NODEREGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'Delete' },
        { name: 'Name', value: name }
      ],
      signer: signer
    });

    let Result = await result({
      message: msgId,
      process: NODEREGISTRY_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  async nodes() {
    let { Messages } = await dryrun({
      process: NODEREGISTRY_PROCESS_ID,
      tags: [{ name: 'Action', value: 'Nodes' }]
    });
    const nodes = Messages[0].Data;
    return nodes;
  }

  async addWhiteList(addr: string, signer: any) {
    const msgId = await message({
      process: NODEREGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'AddWhiteList' },
        { name: 'Address', value: addr }
      ],
      signer: signer
    });

    let Result = await result({
      message: msgId,
      process: NODEREGISTRY_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  /**
   * Get node infos
   *
   * @param n - How many nodes to select
   * @param random - Whether randomly selected
   * @returns The node infos
   */
  async getNodeInfos(n: number, random: boolean = false): Promise<Array<nodeInfo>> {
    let nodesres = await this.nodes();
    nodesres = JSON.parse(nodesres);
    if (nodesres.length < n) {
      throw `Insufficient number of nodes, expect ${n}, actual ${nodesres.length}`;
    }

    let selected_indices = Array.from({ length: nodesres.length }, (_, i) => i);
    if (random) {
      selected_indices.sort(function () {
        return 0.5 - Math.random();
      });
    }

    let nodeInfos: Array<nodeInfo> = [];
    for (let i = 0; i < n; i++) {
      let node = nodesres[selected_indices[i]];
      nodeInfos.push({
        org_index: parseInt(node.index),
        index: parseInt(node.index),
        name: node.name,
        pk: node.publickey
      });
    }

    // it's ok, no matter sorted or not
    // nodeInfos.sort((a, b) => a.org_index - b.org_index);

    // re-index, do not care original index
    for (var i = 0; i < nodeInfos.length; i++) {
      nodeInfos[i].index = i + 1;
    }
    return nodeInfos;
  }
}
