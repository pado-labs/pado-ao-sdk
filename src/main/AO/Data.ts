import { message, result } from '@permaweb/aoconnect';
import { DATAREGISTRY_PROCESS_ID, DEFAULTENCRYPTIONSCHEMA } from '../../config';
import AODataContract from '../../contracts/AO/Data';
import AOWorkerContract from '../../contracts/AO/Worker';
import { encrypt } from '../../core/utils';
import type { CommonObject, EncryptionSchema, nodeInfo, PolicyInfo } from '../../index.d';
import { getMessageResultData } from '../../processes/utils';
import BaseData from '../BaseData';
import Worker from './Worker';


export default class AOData extends BaseData {
  dataContractInstance: any;
  workerContractInstance: any;
  constructor(chainName: ChainName) {
    super();
    this.dataContractInstance = new AODataContract();
    this.workerContractInstance = new AOWorkerContract();
  }
  // /**
  //  * Get node infos
  //  *
  //  * @param n - How many nodes to select
  //  * @param random - Whether randomly selected
  //  * @returns The node infos
  //  */
  // private async _getNodeInfos(n: number, random: boolean = false): Promise<Array<nodeInfo>> {
  //   let nodesres = await this.workerContractInstance.nodes();
  //   nodesres = JSON.parse(nodesres);
  //   if (nodesres.length < n) {
  //     throw `Insufficient number of nodes, expect ${n}, actual ${nodesres.length}`;
  //   }

  //   let selected_indices = Array.from({ length: nodesres.length }, (_, i) => i);
  //   if (random) {
  //     selected_indices.sort(function () {
  //       return 0.5 - Math.random();
  //     });
  //   }

  //   let nodeInfos: Array<nodeInfo> = [];
  //   for (let i = 0; i < n; i++) {
  //     let node = nodesres[selected_indices[i]];
  //     nodeInfos.push({
  //       org_index: parseInt(node.index),
  //       index: parseInt(node.index),
  //       name: node.name,
  //       pk: node.publickey
  //     });
  //   }

  //   // it's ok, no matter sorted or not
  //   // nodeInfos.sort((a, b) => a.org_index - b.org_index);

  //   // re-index, do not care original index
  //   for (var i = 0; i < nodeInfos.length; i++) {
  //     nodeInfos[i].index = i + 1;
  //   }
  //   return nodeInfos;
  // }
  

  /**
   * Encrypt data and upload encrypted data to decentralized storage blockchains such as Arweave and Filecoin.The combination of encryptData and submitData.
   *
   * @param data - plain data need to encrypt and upload
   * @param dataTag - the data meta info object
   * @param priceInfo - The data price symbol(symbol is optional, default is wAR) and price. Currently only wAR(the Wrapped AR in AO) is supported, with a minimum price unit of 1 (1 means 0.000000000001 wAR).
   * @param wallet - The ar wallet json object, this wallet must have AR Token. Pass `window.arweaveWallet` in a browser
   * @param encryptionSchema EncryptionSchema
   * @param extParam - The extParam object, which can be used to pass additional parameters to the upload process
   *                    - uploadParam : The uploadParam object, which can be used to pass additional parameters to the upload process
   *                        - storageType : The storage type, default is ARWEAVE
   *                        - symbolTag :  The tag corresponding to the token used for payment. ref: https://web3infra.dev/docs/arseeding/sdk/arseeding-js/getTokenTag
   * @returns The uploaded encrypted data id
   */
  async uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    encryptionSchema: EncryptionSchema = DEFAULTENCRYPTIONSCHEMA,
    extParam?: CommonObject
  ) {
    const [policy, publicKeys] = await this.dataContractInstance.prepareRegistry(encryptionSchema);
    const encryptData = this.dataContractInstance.encryptData(data, policy, publicKeys);
    const dataId = await this.dataContractInstance.submitData(encryptData, dataTag, priceInfo, policy, wallet, extParam)
    return dataId
  }
}