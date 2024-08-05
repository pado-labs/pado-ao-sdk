// import { generateKey, submitTask, getResult } from "../index";
// import { readFileSync } from "node:fs";
// import { exit } from "node:process";
// import "./proxy.js";
//
// /**
//  * Usage:
//  *   node /path/to/data_user.js <your-wallet-path> <data-id>
//  */
// async function main() {
//   const args = process.argv.slice(2)
//   if (args.length < 1) {
//     console.log("args: <walletpath> <dataId>");
//     exit(2);
//   }
//   let walletpath = args[0];
//   let dataId = args[1];
//   console.log(`walletpath=${walletpath}`);
//   console.log(`    dataId=${dataId}`);
//
//   // load your arweave wallet
//   const wallet = JSON.parse(readFileSync(walletpath).toString());
//
//
//   // generate key pair
//   let key = await generateKey();
//
//   // submit a task to AO process
//   const taskId = await submitTask(dataId, key.pk, wallet);
//   console.log(`TASKID=${taskId}`);
//
//   // get the result (If you want to do a local test, refer to the README to initialize arweave and then pass it to getResult)
//   const [err, data] = await getResult(taskId, key.sk).then(data => [null, data]).catch((err: any) => [err, null]);
//   console.log(`err=${err}`);
//   console.log(`data=${data}`);
//
//   // You can also easily combine submitTask and getResult by calling submitTaskAndGetResult, as follows:
//   /*{
//     const [err, data] = await submitTaskAndGetResult(dataId, key.pk, key.sk, wallet, arweave).then(data => [null, data]).catch(err => [err, null]);
//     console.log(`err=${err}`);
//     console.log(`data=${data}`);
//   }*/
// }
// main();
