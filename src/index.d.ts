export interface PriceInfo {
  price: string;
  symbol?: string;
}

export type CommonObject = {
  [propName: string]: any;
};

export type DataItem = {
  id: string;
  dataTag: string;
  price: string;
  from: string;
  data: string;
};
export type DataItems = Array<DataItem>;

export interface nodeInfo {
  org_index: number;
  index: number;
  name: string;
  pk: string;
}
export type KeyInfo = {
  pk: string;
  sk: string;
};
export type createTransactionParamsTuple = [{ data: any }, any?];
export type signParamsTuple = [any, any?];

export type Policy = {
  t: string;
  n: string;
};
export type PolicyInfo = {
  t: number;
  n: number;
  indices: number[];
  names: string[];
};
export type DataStatus = 'Valid' | 'All' | 'All';
export type TaskType = 'dataSharing' | '2' | '3';
export type TaskDataInfoRequest = {
  price: number;
  dataDescription: string;
  dataInputAmount: number;
};
export type ComputingInfoRequest = {
  price: number;
  t: number;
  n: number;
};
export type EncryptedData = {
  emsg_len: number;
  emsg_ptr: number;
  enc_msg: Uint8Array;
  enc_sks: string[];
  nonce: string;
};

export enum StorageType {
  ARWEAVE = 'arweave',
  ARSEEDING = 'arseeding'
}