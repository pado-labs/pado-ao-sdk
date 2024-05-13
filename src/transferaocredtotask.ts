import { createDataItemSigner } from "@permaweb/aoconnect";
import { transferAOCREDToTask } from "./processes/utils";
import { readFileSync } from "node:fs";
import { exit } from "node:process";

/**
 * Note: transfer aocred to task process
 * 
 * only for test
 */
async function test() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.log("args: <arwalletpath> <count>");
    exit(2);
  }
  let arwalletpath = args[0];
  let count = args[1];

  const wallet = JSON.parse(readFileSync(arwalletpath).toString());
  const signer = createDataItemSigner(wallet);

  let transferRes = transferAOCREDToTask(count.toString(), signer);
  console.log(`transferRes=${transferRes}`);
}
test();
