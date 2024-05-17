import { generateKey, submitTask, getResult } from "../index";
import { exit } from "node:process";
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


  // step 2: submit a task(transfers is also included)
  const wallet = JSON.parse(readFileSync(walletpath).toString());
  const taskId = await submitTask(dataId, key.pk, wallet);
  console.log(`TASKID=${taskId}`);

  // step 3: get the result
  const [err, data] = await getResult(taskId, key.sk, arweave).then(data => [null, data]).catch(err => [err, null]);
  console.log(`err=${err}`);
  console.log(`data=${data}`);

  // You can also easily combine steps 3 and 4 by calling submitTaskAndGetResult, as follows:
  /*{
    const [err, data] = await submitTaskAndGetResult(dataId, key.pk, key.sk, wallet, arweave).then(data => [null, data]).catch(err => [err, null]);
    console.log(`err=${err}`);
    console.log(`data=${data}`);
  }*/

}
main();
