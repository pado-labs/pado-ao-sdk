export interface PriceInfo {
  price: string;
  symbol?: string;
}
export interface PriceInfoT {
  price: Uint256; // The price of data
  tokenSymbol?: string; // The token symbol of price
}

export type CommonObject = {
  [propName: string]: any;
};

// export type DataItem = {
//   id: string;
//   dataTag: string;
//   price: string;
//   from: string;
//   data: string;
// };
export type DataItem = {
  dataId: Bytes32; // The identifier of the data
  dataTag: string; // The tag of the data
  priceInfo: PriceInfoT; // The price of the data
  dataContent: Bytes; // The content of the data
  workerIds: Bytes32[]; // The workerIds of workers participanting in  encrypting the data
  registeredTimestamp: Uint64; // The timestamp at which the data was registered
  owner: Address;// The owner of the data
  status: DataStatus; // The status of the data
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

// --- contract EncryptionSchema
export type Policy = {
  t: Bytes32; // threshold
  n: Bytes32; // total amount of nodes
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
export type ChainName = 'ao' | 'sepolia'

/**
 * @notice A enum representing data staus
 */
enum DataStatus {
    NEVER_USED,
    REGISTERING,
    REGISTERED,
    DELETED
}

type Bytes = Uint8Array;
type Bytes32 = string;
type Uint64 = bigint;
type Uint256 = bigint;
type Bool = boolean;
type Address = string;
