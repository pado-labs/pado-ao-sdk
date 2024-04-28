import {
    createDataItemSigner,
  } from "@permaweb/aoconnect";
import { encrypt, decrypt, keygen, THRESHOLD_2_3} from "./algorithm";
import { nodes } from "./processes/noderegistry";
import { register as dataRegister, getDataById } from "./processes/dataregistry";
import { submit, getCompletedTasksById, /*getPendingTasks*/ } from "./processes/tasks";

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

    let nodesres = await nodes();
    nodesres = JSON.parse(nodesres);

    let nodepks =Object();
    for(let i in nodesres) {
        let node = nodesres[i];
        nodepks[node.name] = node.publickey;
    }
    let nodesPublicKey = [
        nodepks["testnode1"],
        nodepks["testnode2"],
        nodepks["testnode3"],
    ];
    const res = encrypt(nodesPublicKey, data);
    //console.log("encrypt res=", res);

    const encSksStr = JSON.stringify(res.enc_sks);
    const dataRes = await dataRegister(dataTag,
      price, encSksStr, res.nonce, res.enc_msg, signer);
    return dataRes;
}

export const submitTask = async (dataId: string, dataUserPk: string, signer: any) => {
  let inputData = {...THRESHOLD_2_3, dataId: dataId, consumerPk: dataUserPk};
  const taskId = await submit("ZKLHEDataSharing", JSON.stringify(inputData),
  "9000000000000", "512M",["testnode1", "testnode2", "testnode3"], signer);
  return taskId;
}

export const getResult = async (taskId: string, dataUserSk: string) => {
  // 1. get encrypted result
  // 2. invoke algorithm get plain data

  const taskStr = await getCompletedTasksById(taskId);
  const task = JSON.parse(taskStr);
  if (!task.id) {
    return "no task or task is not completed";
  }
  const chosenIndices = [1, 2];
  let reencSks = [];
  const computeNodes = JSON.parse(task.computeNodes);
  for(let nodeName of computeNodes) {
    const reencSksObj = JSON.parse(task.result[nodeName]);
    reencSks.push(reencSksObj.reenc_sk);
  }
  const reencChosenSks = [reencSks[0], reencSks[1]];

  let dataId = (JSON.parse(task.inputData)).dataId;
  let encData = await getDataById(dataId);
  encData = JSON.parse(encData);

  const res = decrypt(reencChosenSks, dataUserSk, encData.nonce, encData.encMsg, chosenIndices);
  return res;
}

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
    //const allDataRes = await allData();
    //console.log("allDataRes=", allDataRes);

    const dataUserKey = keygen();
    //console.log("dataUserKey=", dataUserKey);
    const taskId = await submitTask(dataId, dataUserKey.pk, signer);
    console.log("taskId=", taskId);
    //const pendingTasks = await getPendingTasks();
    //console.log("pendingTasks=", pendingTasks);*/

    setTimeout(async()=>{
      const res = await getResult(taskId, dataUserKey.sk);
      console.log("res=", res);
    }, 10000);


    /*setTimeout(async ()=> {
      await register("testnode3", keygen().pk, "testnode3desc", createDataItemSigner(wallet));
      await nodes();
    }, 1000);*/
}
test();
