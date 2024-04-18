import {
    result,
    message,
    createDataItemSigner,
  } from "@permaweb/aoconnect";

import { readFileSync } from "node:fs";

const NODEREGISTRY_PROCESS_ID = "lsVh9GO7pzFXcFEuAfw7l_9WU7KAAqTRkU0kVH0lx2g";

/**
 * Encrypt data and upload
 *
 * @param data - plain data need to encrypt and upload
 * @param dataTag - the data meta info
 * @param signer - The ar wallet signer
 * @param price - The data price using PADO Token
 * @returns The uploaded encrypted data id
 *
 */
export const uploadData = async (/*data: Uint8Array, dataTag: string, */signer: any/*, price: string*/) => {
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
    let { Messages } = await result({
        // the arweave TXID of the message
        message: msgId,
        // the arweave TXID of the process
        process: NODEREGISTRY_PROCESS_ID,
      });
    const nodes = Messages[0].Data;
    console.log("nodes=", nodes);
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

function test() {
    const wallet = JSON.parse(
        readFileSync("/Users/fksyuan/.aos.json").toString(),
    );
    uploadData(createDataItemSigner(wallet));
}
test();

/*async function getTest() {
    let { Messages, Spawns, Output, Error } = await result({
        // the arweave TXID of the message
        message: "ri_NM3HYd3rwdQ2r67F0oR8D2fEeEERZGUPDsMFHpYs",
        // the arweave TXID of the process
        process: NODEREGISTRY_PROCESS_ID,
      });
    console.log(Messages, Spawns, Output, Error);
}

getTest();*/