import { createDataItemSigner } from "@permaweb/aoconnect";
import { encrypt, decrypt, keygen, THRESHOLD_2_3} from "./algorithm";
import { nodes } from "./processes/noderegistry";
import { register as dataRegister, getDataById } from "./processes/dataregistry";
import { submit, getCompletedTasksById, /*getPendingTasks*/ } from "./processes/tasks";
import { submitDataToAR, getDataFromAR } from "./padoarweave";
import Arweave from 'arweave';
import { readFileSync } from "node:fs";

export interface PriceInfo {
  price: string;
  symbol?: string;
}

/**
 * Encrypt data and upload data
 *
 * @param data - plain data need to encrypt and upload
 * @param dataTag - the data meta info
 * @param priceInfo - The data price symbol and price
 * @param wallet - The ar wallet
 * @param arweave - The ar object and default is ar production
 * @returns The uploaded encrypted data id
 *
 */
export const uploadData = async (data: Uint8Array, dataTag: any, priceInfo: PriceInfo,
  wallet: any, arweave: Arweave = Arweave.init({})): Promise<string> => {
    if (data.length === 0) {
      throw new Error("The Data to be uploaded can not be empty");
    }

    priceInfo.symbol = priceInfo.symbol || "PADO Token";

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

    const transactionId = await submitDataToAR(arweave, res.enc_msg, wallet);

    const signer = createDataItemSigner(wallet);
    const encSksStr = JSON.stringify(res.enc_sks);
    const dataRes = await dataRegister(JSON.stringify(dataTag),
      JSON.stringify(priceInfo), encSksStr, res.nonce, transactionId, signer);

    return dataRes;
}

export const submitTask = async (dataId: string, dataUserPk: string, wallet: any): Promise<string> => {
  const signer = createDataItemSigner(wallet);
  let inputData = {...THRESHOLD_2_3, dataId: dataId, consumerPk: dataUserPk};
  const taskId = await submit("ZKLHEDataSharing", JSON.stringify(inputData),
  "9000000000000", "512M",["testnode1", "testnode2", "testnode3"], signer);
  return taskId;
}

/**
 * Get the result of the task
 * @param taskId taskId
 * @param timeout Timeout in milliseconds
 */
const getResultPromise = (taskId: string, timeout: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const tick = async () => {
      const timeGap = performance.now() - start;
      const taskStr = await getCompletedTasksById(taskId);
      const task = JSON.parse(taskStr);
      if (task.id) {
        resolve(taskStr);
      } else if (timeGap > timeout) {
        reject('timeout');
      } else {
        setTimeout(tick, 500);
      }
    };
    tick();
  });
};

export const getResult = async (taskId: string, dataUserSk: string, timeout: number,
                                arweave: Arweave = Arweave.init({})) => {
  const taskStr = await getResultPromise(taskId, timeout);
  const task = JSON.parse(taskStr);
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
  //console.log("getResult ar encData=", encData);
  const encMsg = await getDataFromAR(arweave, encData.encMsg);
  console.log("getResult ar enc_msg=", encMsg);
  const res = decrypt(reencChosenSks, dataUserSk, encData.nonce, encMsg, chosenIndices);
  return new Uint8Array(res.msg);
}

/*export const listData = async () => {
    // 1. get data list from data process
    // 2. return dataTag, data ar url, data id, data price
}

export const SubmitTaskAndGetResult = async (dataId: string, publicKey: string) => {
    
}*/

async function test() {
    const wallet = JSON.parse(
        readFileSync("/Users/fksyuan/Downloads/arweave-keyfile-JNqOSFDeSAh_icEDVAVa_r9wJfGU9AYCAJUQb2ss7T8.json").toString(),
    );
    //const signer = createDataItemSigner(wallet);
    const arweave = Arweave.init({
      host: '127.0.0.1',
      port: 1984,
      protocol: 'http'
    });

    const dataId = await uploadData(new Uint8Array([1,2,3,4,5,6]), {"testtagkey": "testtagvalue"}, {price: "1"}, wallet, arweave);
    console.log("dataId=", dataId);
    const dataResRes = await getDataById(dataId);
    console.log("dataResRes=", dataResRes);

    const dataUserKey = keygen();
    //console.log("dataUserKey=", dataUserKey);
    const taskId = await submitTask(dataId, dataUserKey.pk, wallet);
    console.log("taskId=", taskId);
    //const pendingTasks = await getPendingTasks();
    //console.log("pendingTasks=", pendingTasks);*/

    const res = await getResult(taskId, dataUserKey.sk, 10000, arweave);
    console.log('res=', res);


    /*setTimeout(async ()=> {
      await register("testnode3", keygen().pk, "testnode3desc", createDataItemSigner(wallet));
      await nodes();
    }, 1000);*/
}
test();
