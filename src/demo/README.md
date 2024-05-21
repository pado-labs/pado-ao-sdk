
- [Overview](#overview)
- [Preparations](#preparations)
- [Installation](#installation)
- [Usage](#usage)
  - [Data Provider](#data-provider)
  - [Data User](#data-user)
- [FAQ](#faq)
  - [Q1: connect ENETUNREACH while using default Arweave?](#q1-connect-enetunreach-while-using-default-arweave)


## Overview

Here we will introduce the steps on how to use the [PADO AO SDK](https://docs.padolabs.org/ecosystem/ao/sdk) with examples.



## Preparations


- Install an arweave wallet from [ArConnect](https://www.arconnect.io/download).
- Export the wallet from ArConnect and store it to somewhere, such as the current folder.
- **(Optional)** For local testing, you can run `npx arlocal` to start a local testnet, then refer to [ArLocal](https://docs.arconnect.io/developer-tooling/arlocal-devtools), to mint some AR(TestToken) that will be used to interact with the local testnet.


## Installation


```sh
npm install --save @padolabs/pado-ao-sdk
```

> Notes:
>
> - The minimum version of NodeJS required is 18+.


## Usage

There are two roles, the **Data Provider** and the **Data User**, and whichever role you are in, you need to load the wallet and initialize the arweave. 


<br/>

**load your arweave wallet**

Referring to the previous preparation stage, export the wallet from ArConnect.

```ts
import { readFileSync } from "node:fs";

// load your arweave wallet
let walletpath = "/path/to/your/arweave/wallet";
const wallet = JSON.parse(readFileSync(walletpath).toString());
```


<br/>

**init arweave**

By default, there is no need to set arweave, but for the Data Provider, some AR is required to upload data.

If you are going to test locally, make sure you have started arlocal and mint some AR(TestToken), as mentioned earlier in the preparation phase.

```ts
import Arweave from "arweave";

// init arweave (ArLocal)
const arweave = Arweave.init({
  host: '127.0.0.1',
  port: 1984,
  protocol: 'http'
});
```


### Data Provider

**prepare some data**

```ts
let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
```
In reality, you can load the data content from a file or the cloud and convert it to `Uint8Array`.

<br/>

**tag for the data**

You can also set tags for your data for easier retrieval in the future!

```ts
let dataTag = { "testtagkey": "testtagvalue" };
```

<br/>

**price for the data**

**Importantly**, you can set a price for your data, and the data users will pay you this defined price each time they use the data.

```ts
let priceInfo = { price: "100", symbol: "AOCRED" };
```

**NOTE:** Currently, only **AOCRED**(TestToken) is supported. In the example above, 100 means 0.1 AOCRED(TestToken).


<br/>

**upload your data**

```ts
import { uploadData } from "@padolabs/pado-ao-sdk";
const dataId = await uploadData(data, dataTag, priceInfo, wallet, arweave);
console.log(`DATAID=${dataId}`);
```

Please be assured that your data is encrypted by the [zk-LHE](https://github.com/pado-labs/threshold-zk-LHE) before it is uploaded to Arweave.

**Congratulations**! If everything is fine and there are no exceptions, you will get the `DATAID`, and you can subsequently query the data you uploaded based on that ID.

<br/>

The complete code can be found in [data_provider.ts](https://github.com/pado-labs/pado-ao-sdk/blob/main/src/demo/data_provider.ts).



### Data User

**Important**: Before you do the next step, make sure that the wallet you exported in the previous step has enough `AOCRED` in it. Refer to [here](https://cookbook_ao.g8way.io/welcome/testnet-info/cred-and-quests.html#how-do-i-earn-cred) to learn how to earn test token.

**generate key pair**

You should generates a pair of public and secret keys for encryption and decryption.

```ts
import { generateKey } from "@padolabs/pado-ao-sdk";
let key = await generateKey();
```
In practice, you **SHOULD** store the key to a file.

<br/>

**submit a task to AO process**

Here, you need a dataId, which is returned by the Data Provider through the `uploadData`.

```ts
import { submitTask } from "@padolabs/pado-ao-sdk";
let dataId = "xxxxxxxxxxxxxxxx";
const taskId = await submitTask(dataId, key.pk, wallet);
console.log(`TASKID=${taskId}`);
```

This will return a task id which used for getting the result.


<br/>

**get the result**

```ts
import { getResult } from "@padolabs/pado-ao-sdk";
const [err, data] = await getResult(taskId, key.sk, arweave).then(data => [null, data]).catch(err => [err, null]);
console.log(`err=${err}`);
console.log(`data=${data}`);
```

If nothing goes wrong, you will get the `data` of the Data Provider.

If you follow the previous steps for the Data Provider, you will get the following output:

```txt
err=null
data=1,2,3,4,5,6,7,8
```

<br/>

The complete code can be found in [data_user.ts](https://github.com/pado-labs/pado-ao-sdk/blob/main/src/demo/data_user.ts).


## FAQ

### Q1: connect ENETUNREACH while using default Arweave?

This is usually a network or proxy issue. There is a way to set up a proxy.

- Copy the following code into a js file such as `proxy.js`.

  ```js
  import { ProxyAgent } from 'undici';

  if (process.env.HTTPS_PROXY) {
    const proxyAgent = new ProxyAgent(process.env.HTTPS_PROXY);
    const nodeFetch = globalThis.fetch
    globalThis.fetch = function (url, options) {
      return nodeFetch(url, { ...options, dispatcher: proxyAgent })
    }
  }
  ```
- Add `import "./proxy.js"` to your `.ts` script.
- Export `HTTPS_PROXY=your-proxy` in your terminal.

