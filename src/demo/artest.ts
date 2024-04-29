import Arweave from 'arweave';
import { readFileSync } from "node:fs";
import { ARWEAVE_KEYFILE } from "../config";

// web version without options
// const arweave = Arweave.init({});

// ArConnect
// const arweave = Arweave.init({
//   host: 'arweave.net',
//   port: 443,
//   protocol: 'https'
// });

// ArLocal(`npx arlocal` to start)
const arweave = Arweave.init({
  host: '127.0.0.1',
  port: 1984,
  protocol: 'http'
});
console.log(arweave)

async function loadKey() {
  return JSON.parse(readFileSync(ARWEAVE_KEYFILE).toString());

}

async function logBalance(address: string) {
  await arweave.wallets.getBalance(address).then((balance) => {
    let winston = balance;
    let ar = arweave.ar.winstonToAr(balance);
    console.log('winston', winston);
    console.log('ar', ar);
  });
}

// submit data to AR
async function submitData(data: string | Uint8Array | ArrayBuffer, key: any) {
  // Create a data transaction
  let transaction = await arweave.createTransaction({
    data: data
  }, key);


  // Optional. Add tags to a transaction
  // GraphQL uses tags when searching for transactions.
  transaction.addTag('key1', 'this is test data');
  transaction.addTag('somekey2', 'value2');

  // Sign a transaction
  await arweave.transactions.sign(transaction, key);


  // Submit a transaction
  // {
  //   // way1: for small
  //   const response = await arweave.transactions.post(transaction);
  //   console.log(`response.status: ${response.status}`);
  // }

  {
    // way2: for big
    let uploader = await arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }
  }

  return transaction.id;
}

// get data from AR by transactionId
async function getData(transactionId: string) {
  // Get a transaction status
  await arweave.transactions.getStatus(transactionId).then(res => {
    console.log('transaction status:', res);
  });

  // Get a transaction
  await arweave.transactions.get(transactionId).then(transaction => {
    console.log('transaction:', transaction);
  });

  // Get the base64url encoded string
  await arweave.transactions.getData(transactionId).then(data => {
    console.log('data(base64url):', data);
  });

  // Get the data decoded to a Uint8Array for binary data
  await arweave.transactions.getData(transactionId, { decode: true }).then(data => {
    console.log('data(Uint8Array):', data);
  });

  // Get the data decode as string data
  await arweave.transactions.getData(transactionId, { decode: true, string: true }).then(data => {
    console.log('data(string):', data);
  });
}


async function test() {
  const key = await loadKey();
  // console.log('key', key);

  const address = await arweave.wallets.jwkToAddress(key);
  await logBalance(address);

  // simulate upload data (type: string | Uint8Array | ArrayBuffer)
  // let data = new Uint8Array([1, 2, 3]);
  let data = "some test data";
  let transactionId = await submitData(data, key);
  console.log('transactionId', transactionId);

  // Do Getter
  await getData(transactionId);
}

test();

