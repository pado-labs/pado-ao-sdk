
## Quick Start

**Preparations:**(If you have not prepared the following)

- Install an arweave wallet from [ArConnect](https://www.arconnect.io/download).
- Export the wallet from ArConnect and store it to somewhere, such as the current folder.
- Run `npx arlocal` to start a local testnet, then refer to [ArLocal](https://docs.arconnect.io/developer-tooling/arlocal-devtools), to mint some AR(TestToken) that will be used to interact with the local testnet.


We've provided two [demos](./src/demo) of how to use the SDK to get a quick overview of the entire process.


### Data Provider


```sh
# here set your own arweave-keyfile path
export ARWALLETPATH="arweave-keyfile-<ADDRESS>.json"
node dist/demo/data_provider.js $ARWALLETPATH
```

This will output like this:

```log
initialize ok
100% complete, 1/1
DATAID=Uw67d4qC-uGSQsuY-3c7SHCJZHPkT4HIUg-z2jSeLKk
```

We got the `DATAID`, which `Data User` will use it next.

## Data User

**Important**: Before you do the next step, make sure that the wallet you exported in the previous step has enough `AOCRED` in it. Refer to [the ao documentation](https://cookbook_ao.g8way.io/welcome/index.html) to learn how to transfer token and more.


```sh
# here set your own arweave-keyfile path
export ARWALLETPATH="arweave-keyfile-<ADDRESS>.json"
# here set a data id, the output of the previous step
DATAID="<DATA ID>"
node dist/demo/data_user.js $ARWALLETPATH $DATAID
```


This will output like this:

```log
initialize ok
...
data=...
```

This `data` is the data uploaded by the data provider.

