import { createDataItemSigner } from '@permaweb/aoconnect';
import Arweave from 'arweave';
import { THRESHOLD_2_3 } from '../algorithm';
import type { CommonObject, DataItem, DataItems, EncryptionSchema, nodeInfo, PriceInfo } from '../index.d';
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
    encryptionSchema?: EncryptionSchema
  ): Promise<string>;
  uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    extParam?: CommonObject,
    encryptionSchema?: EncryptionSchema
  ): Promise<string>;
  listData(dataStatus?: string): Promise<DataItems>;
  getDataById(dataId?: string): Promise<DataItem>;
}

export default class Data implements IData {
  chainName: string;

  constructor(chainName: string) {
    this.chainName = chainName;
  }

  /**
   * Encrypt data
   *
   * @param data - plain data need to encrypt
   * @returns The encrypted data
   */
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

  /**
   * submit encrypted data to  decentralized storage blockchains such as Arweave and Filecoin.
   *
   * @param encryptedData - encrypted data need to upload
   * @param dataTag - the data meta info object
   * @param priceInfo - The data price symbol(symbol is optional, default is wAR) and price. Currently only wAR(the Wrapped AR in AO) is supported, with a minimum price unit of 1 (1 means 0.000000000001 wAR).
   * @param wallet - The ar wallet json object, this wallet must have AR Token. Pass `window.arweaveWallet` in a browser
   * @param extParam - The extParam object, which can be used to pass additional parameters to the upload process
   *                    - uploadParam : The uploadParam object, which can be used to pass additional parameters to the upload process
   *                        - storageType : The storage type, default is ARWEAVE
   *                        - symbolTag :  The tag corresponding to the token used for payment. ref: https://web3infra.dev/docs/arseeding/sdk/arseeding-js/getTokenTag
   * @param encryptionSchema  - threshold
   * @returns The uploaded encrypted data id
   */
  async submitData(
    encryptedData: CommonObject,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    extParam?: CommonObject,
    encryptionSchema: EncryptionSchema = { t: '2', n: '3' }
  ): Promise<string> {
    console.log('encryptionSchema', encryptionSchema);
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

    priceInfo.symbol = priceInfo.symbol || 'wAR';
    const dataRes = await dataRegister(
      JSON.stringify(dataTag),
      JSON.stringify(priceInfo),
      JSON.stringify(exData),
      encryptedData.policy.names,
      signer
    );

    return dataRes;
  }

  /**
   * Encrypt data and upload encrypted data to decentralized storage blockchains such as Arweave and Filecoin.The combination of encryptData and submitData.
   *
   * @param data - plain data need to encrypt and upload
   * @param dataTag - the data meta info object
   * @param priceInfo - The data price symbol(symbol is optional, default is wAR) and price. Currently only wAR(the Wrapped AR in AO) is supported, with a minimum price unit of 1 (1 means 0.000000000001 wAR).
   * @param wallet - The ar wallet json object, this wallet must have AR Token. Pass `window.arweaveWallet` in a browser
   * @param extParam - The extParam object, which can be used to pass additional parameters to the upload process
   *                    - uploadParam : The uploadParam object, which can be used to pass additional parameters to the upload process
   *                        - storageType : The storage type, default is ARWEAVE
   *                        - symbolTag :  The tag corresponding to the token used for payment. ref: https://web3infra.dev/docs/arseeding/sdk/arseeding-js/getTokenTag
   * @param encryptionSchema  - threshold
   * @returns The uploaded encrypted data id
   */
  async uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    wallet: any,
    extParam?: CommonObject,
    encryptionSchema: EncryptionSchema = { t: '2', n: '3' }
  ) {
    const encryptedData = await this.encryptData(data);
    const dataId = await this.submitData(encryptedData, dataTag, priceInfo, wallet, extParam, encryptionSchema);
    return dataId;
  }

  /**
   * Get the encrypted data info
   *
   * @param dataStatus - The value is one of Valid/Invalid/All. Valid is to get valid data, Invalid is to get invalid data, and All is to get all data. The default is Valid.
   * @returns Return Array of all data, each item contains id, dataTag, price, from and data fields
   */
  async listData(dataStatus = 'Valid'): Promise<DataItems> {
    const resStr = await allData(dataStatus);
    const res = JSON.parse(resStr);
    return res;
  }

  /**
   * Get the encrypted data info by data id
   *
   * @param dataId - The id of the data.
   * @returns Return Array of all data, each item contains id, dataTag, price, from and data fields
   */
  async getDataById(dataId: string): Promise<DataItem> {
    console.log('getDataById1=', dataId);
    let encData = await getDataInfoById(dataId);
    console.log('getDataById2=', encData);
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