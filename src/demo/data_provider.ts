import { uploadData } from "../index";
import { readFileSync } from "node:fs";
import { exit } from "node:process";
import Arweave from 'arweave';

//TODO: Local test with ArLocal(`npx arlocal` to start)
const arweave = Arweave.init({
  host: '127.0.0.1',
  port: 1984,
  protocol: 'http'
});

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.log("args: <arwalletpath>");
    exit(2);
  }
  let walletpath = args[0];
  const wallet = JSON.parse(readFileSync(walletpath).toString());

  let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  let dataTag = { "testtagkey": "testtagvalue" };
  let priceInfo = { price: "1", symbol: "AOCRED" };
  const dataId = await uploadData(data, dataTag, priceInfo, wallet, arweave);
  console.log(`DATAID=${dataId}`);
}
main();
