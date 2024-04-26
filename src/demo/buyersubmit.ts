import { createDataItemSigner } from "@permaweb/aoconnect";
import { THRESHOLD_2_3 } from "../algorithm";
import { submit } from "../processes/tasks";
import { readFileSync } from "node:fs";
import { exit } from "node:process";

export const submitTask = async (dataId: string, consumerPk: string, signer: any) => {
  let inputData = { ...THRESHOLD_2_3, dataId: dataId, consumerPk: consumerPk };
  const taskId = await submit("ZKLHEDataSharing", JSON.stringify(inputData), "9000000000000", "512M", ["testnode1", "testnode2", "testnode3"], signer);
  return taskId;
}

async function test() {
  setTimeout(async () => {
    const args = process.argv.slice(2)
    if (args.length < 3) {
      console.log("args: <dataId> <keyfile> <walletpath>");
      exit(2);
    }
    let dataId = args[0];
    let keyfile = args[1];
    let walletpath = args[2];

    const key = JSON.parse(readFileSync(keyfile).toString());
    const wallet = JSON.parse(readFileSync(walletpath).toString());
    const signer = createDataItemSigner(wallet);

    console.log(`dataId=${dataId}`);
    const taskId = await submitTask(dataId, key.pk, signer);
    console.log(`TASKID=${taskId}`);
  }, 1000)
}
test();
