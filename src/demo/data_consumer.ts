import { generateKey, transferAOCREDToTask, submitTask, getResult } from "../index";
import { exit } from "node:process";
import { createDataItemSigner } from "@permaweb/aoconnect";
import { readFileSync } from "node:fs";
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
    console.log("args: <walletpath> <dataId>");
    exit(2);
  }
  let walletpath = args[0];
  let dataId = args[1];
  console.log(`walletpath=${walletpath}`);
  console.log(`    dataId=${dataId}`);

  // step 1: generate key pair
  let key = await generateKey();

  // step 2: transfer some AOCRED to TASK-PROCESS
  //    2.1: set your wallet, and the quantity
  const wallet = JSON.parse(readFileSync(walletpath).toString());
  const signer = createDataItemSigner(wallet);

  const quantity = "1";
  let transferRes = transferAOCREDToTask(quantity, signer);
  console.log(`transferRes=${transferRes}`);


  // step 3: submit a task
  const taskId = await submitTask(dataId, key.pk, wallet);
  console.log(`TASKID=${taskId}`);

  // step 4: get the result
  const [err, data] = await getResult(taskId, key.sk, arweave).then(data => [null, data]).catch(err => [err, null]);
  console.log(`err=${err}`);
  console.log(`data=${data}`);
}
main();
