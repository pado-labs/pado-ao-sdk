import {
    result,
    message,
    createDataItemSigner,
  } from "@permaweb/aoconnect";
import { encrypt, keygen } from "./algorithm";

import { readFileSync } from "node:fs";

const NODEREGISTRY_PROCESS_ID = "lsVh9GO7pzFXcFEuAfw7l_9WU7KAAqTRkU0kVH0lx2g";

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

    const msgId = await message({
        process: NODEREGISTRY_PROCESS_ID,
        // Tags that the process will use as input.
        tags: [
          { name: "Action", value: "Nodes" },
        ],
        // A signer function used to build the message "signature"
        signer: signer,
      });
    console.log("msgId=", msgId);
    let { Messages } = await result({
        // the arweave TXID of the message
        message: msgId,
        // the arweave TXID of the process
        process: NODEREGISTRY_PROCESS_ID,
      });
    const nodes = Messages[0].Data;
    console.log("nodes=", nodes);

    console.log("test data dataTag price=", data, dataTag, price);

    const node1Pubkey = keygen().pk;
    const node2Pubkey = keygen().pk;
    const node3Pubkey = keygen().pk;
    //console.log("test nodePubkey=", node1Pubkey, node2Pubkey, node3Pubkey);
    const res = encrypt([node1Pubkey, node2Pubkey, node3Pubkey], data);
    console.log("res=", res);
}

/*export const listData = async () => {
    // 1. get data list from data process
    // 2. return dataTag, data ar url, data id, data price
}

export const SubmitTask = async (dataId: string, publicKey: string) => {
    // 1. invoke task process submit task
    // 2. return task id
}

export const getResult = async (taskId: string) => {
    // 1. get encrypted result
    // 2. invoke algorithm get plain data
}

export const SubmitTaskAndGetResult = async (dataId: string, publicKey: string) => {
    
}*/

async function test() {
    const wallet = JSON.parse(
        readFileSync("/Users/fksyuan/.aos.json").toString(),
    );
    uploadData(new Uint8Array([1,2,3]), "test", createDataItemSigner(wallet), "1");
}
test();
