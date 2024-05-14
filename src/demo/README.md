

## Overview






## Data Provider

Usage:

```sh
walletpath="arweave-keyfile-<ADDRESS>.json"
node dist/demo/data_provider.js ${walletpath}
```

Output:

```log
initialize ok
100% complete, 1/1
DATAID=Uw67d4qC-uGSQsuY-3c7SHCJZHPkT4HIUg-z2jSeLKk
```

## Data Consumer


Usage:

```sh
walletpath="arweave-keyfile-<ADDRESS>.json"
dataId="<DATA ID>"
node dist/demo/data_consumer.js ${walletpath} ${dataId}
```

Output:

```log
initialize ok
...
data=...
```


