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
