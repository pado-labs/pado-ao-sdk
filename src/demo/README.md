
- [Overview](#overview)
  - [Preparations](#preparations)
- [Data Provider](#data-provider)
- [Data User](#data-user)


## Overview


We've provided two demos, [data_provider.ts](data_provider.ts) and [data_user.ts](data_user.ts),  of how to use the **PADO AO SDK** to get a quick overview of the entire process.


### Preparations


- Install an arweave wallet from [ArConnect](https://www.arconnect.io/download).
- Export the wallet from ArConnect and store it to somewhere, such as the current folder.
- Run `npx arlocal` to start a local testnet, then refer to [ArLocal](https://docs.arconnect.io/developer-tooling/arlocal-devtools), to mint some AR(TestToken) that will be used to interact with the local testnet.



## Data Provider

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

**Importantly**, you can set a price for your data, and data users will pay you this defined price each time they use the data

```ts
let priceInfo = { price: "1", symbol: "AOCRED" };
```

**NOTE:** Currently, only AOCRED(TestToken) is supported in 0.001 units. In the example above, 1 means 0.001 AOCRED(TestToken).


<br/>

**init arweave**

Make sure you have started arlocal, as mentioned earlier in the preparation phase.

```ts
import Arweave from "arweave";
const arweave = Arweave.init({
  host: '127.0.0.1',
  port: 1984,
  protocol: 'http'
});
```

<br/>

**load your arweave wallet**

Referring to the previous preparation stage, export the wallet from ArConnect.

```ts
import { readFileSync } from "node:fs";
let walletpath = "/path/to/your/arweave/wallet";
const wallet = JSON.parse(readFileSync(walletpath).toString());
```

<br/>

**upload your data**

```ts
import { uploadData } from "@padolabs/pado-ao-sdk";
const dataId = await uploadData(data, dataTag, priceInfo, wallet, arweave);
```

Without doubt, your data is encrypted before it's uploaded.

Congratulations! If everything is fine and there are no exceptions, you will get the `dataId`, and you can subsequently query the data you uploaded (encrypted) based on that ID.


## Data User

**Important**: Before you do the next step, make sure that the wallet you exported in the previous step has enough `AOCRED` in it. Refer to [the ao documentation](https://cookbook_ao.g8way.io/welcome/index.html) to learn how to transfer token and more.


**generate key pair**

You should generates a pair of public and secret keys for encryption and decryption.

```ts
import { generateKey } from "@padolabs/pado-ao-sdk";
let key = await generateKey();
```
In practice, you **SHOULD** store the key to a file.

<br/>

**load your arweave wallet**

Referring to the previous preparation stage, export the wallet from ArConnect.

```ts
import { readFileSync } from "node:fs";
let walletpath = "/path/to/your/arweave/wallet";
const wallet = JSON.parse(readFileSync(walletpath).toString());
```



<br/>

**submit a task to AO process**

Here, you need a dataId, which is returned by the Data Provider through the `uploadData`.

```ts
import { submitTask } from "@padolabs/pado-ao-sdk";
let dataId = "xxxxxxxxxxxxxxxx";
const taskId = await submitTask(dataId, key.pk, wallet);
```

This will return a task id which used for getting the result.

<br/>

**init arweave**

Make sure you have started arlocal, as mentioned earlier in the preparation phase.

```ts
import Arweave from "arweave";
const arweave = Arweave.init({
  host: '127.0.0.1',
  port: 1984,
  protocol: 'http'
});
```



<br/>

**get the result**

```ts
import { getResult } from "@padolabs/pado-ao-sdk";
const [err, data] = await getResult(taskId, key.sk, arweave).then(data => [null, data]).catch(err => [err, null]);
console.log(`err=${err}`);
console.log(`data=${data}`);
```

If nothing goes wrong, you will get the `data` from Data Provider.

If you follow the previous steps for the Data Provider, you will get the following output:

```txt
err=null
data=1,2,3,4,5,6,7,8
```

