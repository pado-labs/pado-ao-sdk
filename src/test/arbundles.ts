import { readFileSync } from "node:fs";
import { getDataFromAR, submitDataToAR } from "../padoarweave";
import Arweave from "arweave";
import "./proxy.js";

const test = async (data_len: number) => {
  const walletpath = "your-ar-wallet.json"
  // const walletpath = "arweave-keyfile-0bWT2PB_TeUUDZStfVjVzuP2ChaePiRAR3Y9AesTnws.json"
  console.log('walletpath', walletpath)
  const wallet = JSON.parse(readFileSync(walletpath).toString());

  let data = new Uint8Array(data_len);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.floor(Math.random() * 100);
  }

  // init arweave (production)
  // const arweave = Arweave.init({
  //   host: 'arweave.net',
  //   port: 443,
  //   protocol: 'https'
  // });
  // [OR] init arweave (ArLocal)
  const arweave = Arweave.init({
    host: '127.0.0.1',
    port: 1984,
    protocol: 'http'
  });
  const transactionId = await submitDataToAR(arweave, data, wallet);
  console.log('transactionId', transactionId)
  // KnDXqeurJT4KIowMDiZpGSUe3xxPI5EoDM0djF97xdM

  let data2 = await getDataFromAR(arweave, transactionId);
  console.log('data', data)
  console.log('data2', data2)
}

// test(10);
test(1 * 1024 * 1024);
// test(10 * 1024 * 1024);
// test(100 * 1024 * 1024);
// test(200 * 1024 * 1024);
