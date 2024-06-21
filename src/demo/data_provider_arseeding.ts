import { uploadData } from "../index";
import { readFileSync } from "node:fs";
import { exit } from "node:process";
import "./proxy.js";
import Arweave from 'arweave';

/**
 * Usage:
 *   node /path/to/data_provider.js <your-wallet-path>
 */
async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.log("args: <walletpath>");
    exit(2);
  }
  let walletpath = args[0];
  console.log(`walletpath=${walletpath}`);

  // load your arweave wallet
  const wallet = JSON.parse(readFileSync(walletpath).toString());


  // prepare some data
  let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

  // tag for the data
  let dataTag = { "testtagkey": "testtagvalue" };

  // price for the data
  let priceInfo = { price: "200000000", symbol: "wAR" };

  // upload your data (If you want to do a local test, refer to the README to initialize arweave and then pass it to uploadData)
  const extParam = {
    uploadParam: {
      storageType: 'arseeding', symbolTag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543'
    }
  }
  const ARConfig = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  };
  const arweave = Arweave.init(ARConfig)
  const dataId = await uploadData(data, dataTag, priceInfo, wallet, arweave, extParam);
  console.log(`DATAID=${dataId}`);
}
main();
