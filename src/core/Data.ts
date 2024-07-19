import { createDataItemSigner } from '@permaweb/aoconnect';
import Arweave from 'arweave';
import { THRESHOLD_2_3 } from '../algorithm';
import type { CommonObject, DataItem, DataItems, nodeInfo, Policy, PriceInfo } from '../index.d';
import { submitDataToArseeding } from '../padoarseeding';
import { ARConfig, submitDataToAR } from '../padoarweave';
import { allData, register as dataRegister, getDataById as getDataInfoById } from '../processes/dataregistry';
import { nodes } from '../processes/noderegistry';
import { encrypt } from './utils';


export enum StorageType {
  ARWEAVE = 'arweave',
  ARSEEDING = 'arseeding'
}
interface IData {
  chainName: string;
  encryptData(data: Uint8Array): Promise<CommonObject>;
  submitData(
    encryptedData: CommonObject,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    extParam?: CommonObject,
    policy?: Policy
  ): Promise<string>;
  uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    extParam?: CommonObject,
    policy?: Policy
  ): Promise<string>;
  listData(dataStatus?: string): Promise<DataItems>;
  getDataById(dataId?: string): Promise<DataItem>;
}

export default class Data implements IData {
  chainName: string;

  constructor(chainName: string) {
    this.chainName = chainName;
  }

  async encryptData(data: Uint8Array): Promise<CommonObject> {
    if (data.length === 0) {
      throw new Error('The Data to be encrypted can not be empty');
    }

    // TODO: only support 2-3 at present
    let policy = {
      t: THRESHOLD_2_3.t,
      n: THRESHOLD_2_3.n,
      indices: [] as number[],
      names: [] as string[]
    };
    let nodeInfos = await this._getNodeInfos(policy.n, true);

    let nodesPublicKey = [] as string[];
    for (let i = 0; i < nodeInfos.length; i++) {
      policy.indices.push(nodeInfos[i].index);
      policy.names.push(nodeInfos[i].name);
      nodesPublicKey.push(nodeInfos[i].pk);
    }

    const res = encrypt(nodesPublicKey, data, policy);
    return Object.assign(res, { policy });
  }

  async submitData(
    encryptedData: CommonObject,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    extParam?: CommonObject,
    policy: Policy = { t: '2', n: '3' }
  ): Promise<string> {
    console.log('policy', policy);
    if (!encryptedData) {
      throw new Error('The encrypted Data to be uploaded can not be empty');
    }

    let transactionId;

    const arweave: Arweave = Arweave.init(ARConfig);
    if (StorageType.ARSEEDING === extParam?.uploadParam?.storageType) {
      dataTag['storageType'] = StorageType.ARSEEDING;
      transactionId = await submitDataToArseeding(
        arweave,
        encryptedData.enc_msg,
        wallet,
        extParam.uploadParam.symbolTag
      );
    } else {
      dataTag['storageType'] = StorageType.ARWEAVE;
      transactionId = await submitDataToAR(arweave, encryptedData.enc_msg, wallet);
    }

    const signer = createDataItemSigner(wallet);
    let exData = {
      policy: encryptedData.policy,
      nonce: encryptedData.nonce,
      transactionId: transactionId,
      encSks: encryptedData.enc_sks
    };

    priceInfo.symbol = priceInfo.symbol || 'AOCRED';
    const dataRes = await dataRegister(
      JSON.stringify(dataTag),
      JSON.stringify(priceInfo),
      JSON.stringify(exData),
      encryptedData.policy.names,
      signer
    );

    return dataRes;
  }

  async uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    extParam?: CommonObject,
    policy: Policy = { t: '2', n: '3' }
  ) {
    const encryptedData = await this.encryptData(data);
    const dataId = await this.submitData(encryptedData, dataTag, priceInfo, wallet, extParam, policy);
    return dataId;
  }

  async listData(dataStatus = 'Valid'): Promise<DataItems> {
    const resStr = await allData(dataStatus);
    const res = JSON.parse(resStr);
    return res;
  }

  async getDataById(dataId: string): Promise<DataItem> {
    let encData = await getDataInfoById(dataId);
    return JSON.parse(encData);
  }

  /**
   * Get node infos
   *
   * @param n - How many nodes to select
   * @param random - Whether randomly selected
   * @returns The node infos
   */
  private async _getNodeInfos(n: number, random: boolean = false): Promise<Array<nodeInfo>> {
    let nodesres = await nodes();
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