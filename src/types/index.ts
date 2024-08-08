export interface PriceInfo {
  price: string;
  symbol: string;
}

export interface PriceInfoT {
  price: Uint256; // The price of data
  tokenSymbol: string; // The token symbol of price
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

export type EncryptionSchema = {
  t: Bytes32; // threshold
  n: Bytes32; // total amount of nodes
};
export type PolicyInfo = {
  t: number;
  n: number;
  indices: number[];
  names: string[];
};
export type DataStatus = 'Valid' | 'All';
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

export type ChainName = 'ao' | 'holesky' | 'ethereum'

/**
 * @notice A enum representing data staus
 */
// enum DataStatus {
//   NEVER_USED,
//   REGISTERING,
//   REGISTERED,
//   DELETED
// }

export type Bytes = Uint8Array;
export type Bytes32 = string;
export type Uint32 = bigint;
export type Uint64 = bigint;
export type Uint256 = bigint;
export type Bool = boolean;
export type Address = string;

export type PrepareRegistryReturnType = [Bytes32, Bytes[]];
export type FeeTokenInfo = {
  symbol: string; // Fee token symbol.
  tokenAddress: Address; // Fee token address.
  computingPrice: Uint256; // computing price.
}
export type  Allowance = {
  free: Uint256;
  locked: Uint256;
}


export type TaskDataInfo = {
  dataEncryptionPk: Bytes; // The data encryption Public Key.
  price: Uint256; // The data pice.
  dataProviders: Address[]; // The address array of data providers related to the task.
  data: Bytes[]; // Data Providers provides data array.
}
export type ComputingInfo = {
  price: Uint256; // The computing price.
  t: Uint32; // Threshold t.
  n: Uint32; // Threshold n.
  workerIds: Bytes32[]; // An array of worker ids that compute the task.
  results: Bytes[]; // The workers' results of the task.
  waitingList: Bytes32[]; // The workers should report.
}

export enum TaskStatus {
  NEVER_USED,
  EMPTY_DATA,
  PENDING,
  COMPLETED,
  FAILED
}

export type Task = {
  taskId: Bytes32; // The UID of the task.
  taskType: TaskType; // The type of the task.
  consumerPk: Bytes; // The Public Key of the Network Consumer.
  tokenSymbol: string; // The token symbol of data and computing fee.
  dataId: Bytes32; // The id of the data
  dataInfo: TaskDataInfo; // Data information related to the task.
  computingInfo: ComputingInfo; // Computing information related to the task.
  time: Uint64; // The time of the task submission.
  status: TaskStatus; // The status of the task.
  submitter: Address; // The submitter of the task.
  code: Bytes; // The task code to run, the field can empty.
}

export type Wallets = {
  wallet: WalletWithType;
  storageWallet: WalletWithType;
}

export type WalletWithType = {
  wallet: any;
  walletType: 'metamask'|'arweave'
}

