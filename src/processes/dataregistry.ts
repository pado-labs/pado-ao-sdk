import {
    result,
    message,
  } from "@permaweb/aoconnect";

import { DATAREGISTRY_PROCESS_ID } from "../config";

export const register = async (dataTag: string, 
    price: string, encSks: string, nonce: string, 
    encMsg: string, signer: any) => {
    const msgId = await message({
        process: DATAREGISTRY_PROCESS_ID,
        // Tags that the process will use as input.
        tags: [
          { name: "Action", value: "Register" },
          { name: "DataTag", value: dataTag},
          { name: "Price", value: price},
          { name: "Nonce", value: nonce},
          { name: "EncMsg", value: encMsg},
        ],
        // A signer function used to build the message "signature"
        signer: signer,
        data: encSks,
      });
    let { Messages } = await result({
        // the arweave TXID of the message
        message: msgId,
        // the arweave TXID of the process
        process: DATAREGISTRY_PROCESS_ID,
      });
    const res = Messages[0].Data;
    return res;
}

export const getDataById = async (dataId:string, signer: any) => {
  const msgId = await message({
      process: DATAREGISTRY_PROCESS_ID,
      // Tags that the process will use as input.
      tags: [
        { name: "Action", value: "GetDataById" },
        { name: "DataId", value: dataId },
      ],
      // A signer function used to build the message "signature"
      signer: signer,
    });
    let { Messages } = await result({
        // the arweave TXID of the message
        message: msgId,
        // the arweave TXID of the process
        process: DATAREGISTRY_PROCESS_ID,
      });
    const res = Messages[0].Data;
    return res;
}

export const allData = async (signer: any) => {
    const msgId = await message({
        process: DATAREGISTRY_PROCESS_ID,
        // Tags that the process will use as input.
        tags: [
          { name: "Action", value: "AllData" },
        ],
        // A signer function used to build the message "signature"
        signer: signer,
      });
    let { Messages } = await result({
        // the arweave TXID of the message
        message: msgId,
        // the arweave TXID of the process
        process: DATAREGISTRY_PROCESS_ID,
      });
    const res = Messages[0].Data;
    return res;
}