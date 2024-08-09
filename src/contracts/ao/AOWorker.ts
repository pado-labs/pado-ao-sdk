import { dryrun, message, result } from '@permaweb/aoconnect';
import { NODE_REGISTRY_PROCESS_ID } from '../../config';
import type { nodeInfo } from '../../types/index';
import { getMessageResultData } from './util/utils';


export class AOWorker {
  constructor() {}

  /**
   * Registers or updates a node within the system based on the provided action.
   *
   * @param action - Specifies whether to register ('register') or update ('update') a node.
   * @param name - The unique name of the node.
   * @param pk - The public key of the node.
   * @param desc - A description detailing the node's purpose or characteristics.
   * @param signer - The entity responsible for signing the transaction.
   *
   * @returns The result data from the registration or update operation.
   */
  async register_or_update(action: string, name: string, pk: string, desc: string, signer: any) {
    const msgId = await message({
      process: NODE_REGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: action },
        { name: 'Name', value: name },
        { name: 'Desc', value: desc }
      ],
      signer,
      data: pk
    });

    let Result = await result({
      message: msgId,
      process: NODE_REGISTRY_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  /**
   * Asynchronously registers or updates an entry with the provided details.
   * @param name - The name of the entity to be registered.
   * @param pk - The public key associated with the entity.
   * @param desc - A description of the entity.
   * @param signer - An object that represents the signer for the registration.
   * @returns A promise that resolves when the registration or update is completed.
   */
  async register(name: string, pk: string, desc: string, signer: any) {
    return await this.register_or_update('Register', name, pk, desc, signer);
  }

  /**
   * Asynchronously updates information with the specified name and description.
   *
   * This function invokes the `register_or_update` method to perform the update operation.
   *
   * @param {string} name - The name of the information to be updated.
   * @param {string} desc - The new description for the information.
   * @param {any} signer - The entity or mechanism responsible for signing the update request.
   * @returns {Promise<any>} A promise that resolves with the result of the update operation.
   */
  async update(name: string, desc: string, signer: any) {
    return await this.register_or_update('Update', name, '', desc, signer);
  }

  /**
   * Asynchronously deletes a node by its name.
   *
   * This function initiates a request to delete a node with the specified name by crafting and sending a message.
   * It first constructs a message with the action set to 'Delete' and the target node's name, then awaits the response.
   * Finally, it extracts the result data from the received message and returns it.
   *
   * @param name - The name of the node to be deleted.
   * @param signer - An object representing the entity authorized to sign the deletion request.
   * @returns The data from the message result after attempting to delete the node.
   */
  async deleteNode(name: string, signer: any) {
    const msgId = await message({
      process: NODE_REGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'Delete' },
        { name: 'Name', value: name }
      ],
      signer
    });

    let Result = await result({
      message: msgId,
      process: NODE_REGISTRY_PROCESS_ID
    });

    const res = getMessageResultData(Result);
    return res;
  }

  /**
   * Asynchronously retrieves node information.
   * Executes a dry run on the specified process with a tag indicating the action to fetch nodes.
   *
   * @returns {Promise<any>} A promise that resolves to an array of node data.
   */
  async nodes() {
    let { Messages } = await dryrun({
      process: NODE_REGISTRY_PROCESS_ID,
      tags: [{ name: 'Action', value: 'Nodes' }]
    });
    const nodes = Messages[0].Data;
    return nodes;
  }

  /**
   * Adds an address to the whitelist asynchronously.
   *
   * @param addr - The address to be added to the whitelist.
   * @param signer - The entity responsible for signing the transaction.
   * @returns The result data of the operation.
   */
  async addWhiteList(addr: string, signer: any) {
    const msgId = await message({
      process: NODE_REGISTRY_PROCESS_ID,
      tags: [
        { name: 'Action', value: 'AddWhiteList' },
        { name: 'Address', value: addr }
      ],
      signer
    });

    let Result = await result({
      message: msgId,
      process: NODE_REGISTRY_PROCESS_ID
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