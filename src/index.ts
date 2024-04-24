import {
    createDataItemSigner,
  } from "@permaweb/aoconnect";
import { encrypt, keygen, THRESHOLD_2_3} from "./algorithm";
import { nodes } from "./processes/noderegistry";
import { register as dataRegister, /*allData*/ } from "./processes/dataregistry";
import { submit, /*getCompletedTasksById*/ getPendingTasks } from "./processes/tasks";

import { readFileSync } from "node:fs";

/**
 * Encrypt data and upload data
 *
 * @param data - plain data need to encrypt and upload
 * @param dataTag - the data meta info
 * @param signer - The ar wallet signer
 * @param price - The data price using PADO Token
 * @returns The uploaded encrypted data id
 *
 */
export const uploadData = async (data: Uint8Array, dataTag: string, signer: any, price: string) => {
    // 1. get pado node public key
    // 2. invoke algorithm encrypt
    // 3. upload encrypted data to AR
    // 4. register encrypted keys and ar data url to ao data process
    // 5. return data id

    let nodesres = await nodes(signer);
    nodesres = JSON.parse(nodesres);

    let nodesPublicKey = [nodesres["testnode1"].publickey,
    nodesres["testnode2"].publickey, nodesres["testnode3"].publickey];
    const res = encrypt(nodesPublicKey, data);
    //console.log("encrypt res=", res);

    const encSksStr = JSON.stringify(res.enc_sks);
    const dataRes = await dataRegister(dataTag,
      price, encSksStr, res.nonce, res.enc_msg, signer);
    return dataRes;
}

export const submitTask = async (dataId: string, consumerPk: string, signer: any) => {
  let inputData = {...THRESHOLD_2_3, dataId: dataId, consumerPk: consumerPk};
  const taskId = await submit("ZKLHEDataSharing", JSON.stringify(inputData), "9000000000000", "512M", signer);
  console.log("taskId=", taskId);
  return taskId;
}

/*export const getResult = async (taskId: string, signer: any) => {
  // 1. get encrypted result
  // 2. invoke algorithm get plain data

  const task = await getCompletedTasksById(taskId, signer);
}*/

/*export const listData = async () => {
    // 1. get data list from data process
    // 2. return dataTag, data ar url, data id, data price
}

export const SubmitTaskAndGetResult = async (dataId: string, publicKey: string) => {
    
}*/

async function test() {
    const wallet = JSON.parse(
        readFileSync("/Users/fksyuan/.aos.json").toString(),
    );
    const signer = createDataItemSigner(wallet);

    const dataId = await uploadData(new Uint8Array([1,2,3]), "test", signer, "1");
    console.log("dataId=", dataId);
    //const allDataRes = await allData(signer);
    //console.log("allDataRes=", allDataRes);

    const taskId = await submitTask(dataId, keygen().pk, signer);
    console.log("taskId=", taskId);
    const pendingTasks = await getPendingTasks(signer);
    console.log("pendingTasks=", pendingTasks);

    /*setTimeout(async ()=> {
      await register("testnode3", keygen().pk, "testnode3desc", createDataItemSigner(wallet));
      await nodes(createDataItemSigner(wallet));
    }, 1000);*/
}
test();
