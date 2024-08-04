# pado-ao-sdk


## Overview

This is PADO AO SDK of PADO Network for dapps developer. PADO Network consists of three parts, the other two parts are:

- [PADO AO Processes](https://github.com/pado-labs/pado-ao-process)
- [PADO Nodes](https://github.com/pado-labs/pado-network)


## Features

- **Upload Data**

Data Provider can upload encrypted data through dapp developed based on PADO SDK and set data prices at the same time. The data encrypted by the FHE algorithm and the PADO Node public key will be uploaded to Arweave, and the data information will be registered to AO's Data Registry Process.

- **Submit Task**

Data User submits computation tasks with Data User Public Key through the dapp developed based on PADO SDK, and pays a certain computation and data fee. The computation tasks will be submitted to AO's Task Process.

- **Get Data**

Data User obtains encrypted data from Arweave, obtains task results and data information from Process, and then uses the FHE algorithm and Data User Public Key in the SDK to decrypt the results.

## Quick Start

- [demos](./src/demo/README.md).

## Install

### Nodejs

```shell
npm install --save @padolabs/pado-ao-sdk
```

### Browser

* Install sdk
  ```shell
  npm install --save @padolabs/pado-ao-sdk
  ```

* Introduce lhe.js into the html file, for example:

  ```html
    <script type="text/javascript" src="https://pado-online.s3.ap-northeast-1.amazonaws.com/resources/lhe.js"></script>
  ```

* If you meet the following error in your browser's console:
```shell
_stream_writable.js:57 Uncaught ReferenceError: process is not defined
    at node_modules/readable-stream/lib/_stream_writable.js (_stream_writable.js:57:18)
    at __require2 (chunk-BYPFWIQ6.js?v=4d6312bd:19:50)
```
You can refer to project using vite. [link](https://github.com/pado-labs/pado-ao-demo/blob/main/vite.config.ts)

  


## API

### Data

Some operations on Data

#### constructor

The constructor of Data.

#### uploadData

Encrypt data and upload encrypted data to decentralized storage blockchains such as Arweave and Filecoin. The combination of encryptData and submitData.

- **Parameters:**
  - `data:Uint8Array` Plain data need to encrypt and upload.
  - `dataTag:CommonObject` The data meta info object.
  - `priceInfo:PriceInfo` The data price symbol(symbol is optional, default is wAR, with a minimum price unit of 1 (1 means 0.000000000001 wAR) and price. 
  - `wallet:any` The ar wallet json object, this wallet must have AR Token. Pass `window.arweaveWallet` in a browser.
  - `extParam(optional)` The extParam object, which can be used to pass additional parameters to the upload process.Usage can in the following example. By default, we use AR native transaction/data.
  - `policy:Policy(optional)` threshold
- **Returns:**

  - `Promise<string>` The uploaded encrypted data id.

- **Example:**

  ```typescript
  import { readFileSync } from 'node:fs';
  import { Data } from '@padolabs/pado-ao-sdk';

  const extParam = {
    uploadParam: {
      //sotreageType: arweave or arseeding, default is arweave
      storageType: 'arseeding',
      //symbolTag:The tag corresponding to the token used for payment. ref: https://web3infra.dev/docs/arseeding/sdk/arseeding-js/getTokenTag
      symbolTag:
        'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543'
    }
  };
  const policy = {
    t: 2,
    n: 3
  }
  const wallet = JSON.parse(readFileSync(walletpath).toString());
  let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  let dataTag = { testtagkey: 'testtagvalue' };
  let priceInfo = { price: '2000000', symbol: 'wAR' };
  const dataInstance = new Data('ao');
  const dataId = await dataInstance.uploadData(data, dataTag, priceInfo, wallet, extParam,policy);
  console.log(`DATAID=${dataId}`);
  ```

#### encryptData

Encrypt data.

- **Parameters:**

  - `data:Uint8Array` Plain data need to encrypt.

- **Returns:**

  - `Promise<CommonObject>` The encrypted data.

- **Example:**

  ```typescript
  import { Data } from '@padolabs/pado-ao-sdk';

  let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const dataInstance = new Data('ao');
  const encryptedData = await dataInstance.encryptData(data);
  console.log(`encryptedData=${encryptedData}`);
  ```

#### submitData

Submit encrypted data to the storage chain.

- **Parameters:**

  - `encryptedData:CommonObject` Encrypted data need to upload. The value is returned by encryptData.
  - `dataTag:CommonObject` The data meta info object.
  - `priceInfo:PriceInfo` The data price symbol(symbol is optional, default is wAR, with a minimum price unit of 1 (1 means 0.000000000001 wAR) and price. 
  - `wallet:any` The ar wallet json object, this wallet must have AR Token. Pass `window.arweaveWallet` in a browser.
  - `extParam(optional)` The extParam object, which can be used to pass additional parameters to the upload process.Usage can in the following example. By default, we use AR native transaction/data.
  - `policy:Policy` threshold

- **Returns:**

  - `Promise<string>` The uploaded encrypted data id.

- **Example:**

  ```typescript
  import { readFileSync } from 'node:fs';
  import { Data } from '@padolabs/pado-ao-sdk';
  import Arweave from 'arweave';

  const extParam = {
    uploadParam: {
      //sotreageType: arweave or arseeding, default is arweave
      storageType: 'arseeding',
      //symbolTag:The tag corresponding to the token used for payment. ref: https://web3infra.dev/docs/arseeding/sdk/arseeding-js/getTokenTag
      symbolTag:
        'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543'
    }
  };
  const policy = {
    t: 2,
    n: 3
  }
  const wallet = JSON.parse(readFileSync(walletpath).toString());
  let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  let dataTag = { testtagkey: 'testtagvalue' };
  let priceInfo = { price: '2000000', symbol: 'wAR' };
  const dataInstance = new Data('ao');
  const encryptedData = await dataInstance.encryptData(data);
  const dataId = await dataInstance.submitData(encryptedData, dataTag, priceInfo, wallet, extParam,policy);
  console.log(`DATAID=${dataId}`);
  ```

#### listData

Get the encrypted data info.

- **Parameters:**

  - `dataStatus: string(optional)` The value is one of Valid/Invalid/All. Valid is to get valid data, Invalid is to get invalid data, and All is to get all data. The default is Valid.

- **Returns:**

  - `Promise<DataItems>` Return Array of all data, each item contains id, dataTag, price, from and data fields.

- **Example:**

  ```typescript
  import { Data } from '@padolabs/pado-ao-sdk';

  const data = await listData();
  for (let dataitem of data) {
    console.log('dataitem=', dataitem.id, dataitem.dataTag, dataitem.price, dataitem.from);
  }
  ```

#### getDataById

Get the encrypted data info by data id

- **Parameters:**

  - `dataId: string` The id of the data.

- **Returns:**

  - `Promise<DataItem>` Return the data, which contains id, dataTag, price, from and data fields.

- **Example:**

  ```typescript
  import { Data } from '@padolabs/pado-network-sdk';

  const dataInstance = new Data('ao');
  const dataitem = await dataInstance.getDataById('01');
  console.log('dataitem=', dataitem.id, dataitem.dataTag, dataitem.price, dataitem.from);
  ```

### Task

Some operations on Task

#### constructor

- **Parameters:**

  - `chainName: string` The name of the chain.

- **Returns:**

  - The instance of Task

- **Example:**

  ```typescript
  import { Task } from '@padolabs/pado-network-sdk';

  const dataInstance = new Task('ao');
  ```

#### submitTask

Submit a task to PADO Network. And must pay the data fee corresponding to the dataId and the computing fee of the PADO Node. Now each task charges a certain amount of token per computing node, and the [getComputationPrice](#getComputationPrice) can get the amount.

- **Parameters:**

  - `dataUserPk:string` The user's public key generated by keygen.
  - `wallet:any` The ar wallet json object, this wallet must have enough token. Pass `window.arweaveWallet` in a browser.
  - `taskType:string` The type of task.
  - `dataId:string(optional)` The data id.
  - `tokenSymbol:string(optional)` The symbol of the token paid by the user.
  - `dataInfoRequest:TaskDataInfoRequest(optional)` The data request information related to the task.
  - `computingInfoRequest:ComputingInfoRequest(optional)` The computing info about the task.
  

- **Returns:**

  - `Promise<string>` The submited task id.

- **Example:**

  ```typescript
  import { readFileSync } from 'node:fs';
  import { Task, utils } from '@padolabs/pado-ao-sdk';

  let key = await utils.generateKey();
  const wallet = JSON.parse(readFileSync(walletpath).toString());
  const taskInstance = new Task('ao');
  const taskId = await taskInstance.submitTask(dataId, key.pk, wallet);
  console.log('taskId=', taskId);
  ```

#### getResult

Get the result of the task.

- **Parameters:**
  - `taskId:string` The task id.
  - `dataUserSk:string` The user's secret key generated by keygen.
  - `timeout:number(optional)` Timeout in milliseconds (default: 10 seconds).
- **Returns:**

  - `Promise<Uint8Array>` Return plain data.

- **Example:**

  ```typescript
  import { Task } from '@padolabs/pado-ao-sdk';

  const taskInstance = new Task('ao');
  const data = await getResult(taskId, key.sk);
  console.log(`data=${data}`);
  ```

### Fee

Some operations on Fee

#### constructor

The constructor of Fee.

- **Parameters:**

  - `chainName: string` The name of the chain.

- **Returns:**

  - The instance of Fee

- **Example:**

  ```typescript
  import { Fee } from '@padolabs/pado-ao-sdk';

  const feeInstance = new Fee('ao');
  ```

#### getComputationPrice

Get the computing price of each node for each task.

- **Parameters:**

  - `symbol:string(optional)` The price symbol (default: wAR).

- **Returns:**

  - `Promise<string>` Return the computing price of a node.

- **Example:**

  ```typescript
  import { Fee } from '@padolabs/pado-ao-sdk';

  const feeInstance = new Fee('ao');
  const price = await feeInstance.getComputationPrice();
  console.log('price=', price);
  ```

### Helper

Some other operations 

#### constructor

The constructor of Helper.

- **Parameters:**

  - `chainName: string` The name of the chain.

- **Returns:**

  - The instance of Helper

- **Example:**

  ```typescript
  import { Helper } from '@padolabs/pado-ao-sdk';

  const helperInstance = new Helper('ao');
  ```
#### transfer

transfer accounts

- **Parameters:**

  - `from:string` sender address.
  - `recipient:string` recipient.
  - `quantity:string` transfer quantity.
  - `signer:any` 

- **Returns:**

- **Example:**

  ```typescript
  import { Helper } from '@padolabs/pado-network-sdk';
  const helperInstance = new Helper('ao')
  const res = await helperInstance.transfer('0x1', '0x2', '1', signer);
  ```

### utils

Some utility functions. includes getSupportedChains,generateKey,transfer,decrypt,encrypt.

- **Example:**

  ```typescript
  import { utils } from '@padolabs/pado-network-sdk';

  const kp = utils.generateKey();
  ```

#### getSupportedChains

Get a list of supported chains.

- **Parameters:** NULL.
- **Returns:**

  - `string[]` Return a list of supported chain names.

- **Example:**

  ```typescript
  import { utils } from '@padolabs/pado-ao-sdk';

  const chainList = await utils.getSupportedChains();
  console.log('chainList', chainList);
  ```
#### generateKey

Generate private and public key pair.

- **Parameters:** NULL.
- **Returns:**

  - `KeyInfo` Return the key pair object which contains pk and sk fields.

- **Example:**

  ```typescript
  import { utils } from '@padolabs/pado-ao-sdk';

  const keyPair = await utils.generateKey();
  console.log('keyPair', keyPair);
  ```

#### encrypt

The encryption method of the algorithm.

- **Parameters:**

  - `publicKeys:string[]` List of public keys corresponding to the selected workers.
  - `data:Uint8Array` Data that to be encrypted.
  - `policyInfo:<PolicyInfo>` Some information about workers involved in encryption.

- **Returns:**

  - `<EncryptedData>` Return the encrypted data.

- **Example:**

  ```typescript
  import { utils } from '@padolabs/pado-network-sdk';

  let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const policyInfo = {
    t: 2,
    n: 3,
    indices: [1, 2, 3],
    names: ['testnode2', 'testnode3', 'testnode1']
  };
  const res = await utils.encrypt(['0x1'], data, policyInfo);
  ```

#### decrypt

The decryption method of the algorithm.

- **Parameters:**

  - `reenc_sks:string[]` List of private keys corresponding to the selected workers.
  - `consumer_sk:string` Consumer's private key.
  - `nonce:string` 
  - `enc_msg:Uint8Array` 
  - `chosen_indices:number[]` .
  - `threshold: any (optional)`

- **Returns:**

  - `<DecryptedData>` Return the decrypted data.

- **Example:**

  ```typescript
  import { utils } from '@padolabs/pado-network-sdk';

  let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const res = await utils.decrypt(['001', '002', '003'], '0x4', '78c80dfbcbca7c549ec5bcc6', data, [1, 2, 3]);
  ```

## Building

```sh
npm install
npm run build
```
