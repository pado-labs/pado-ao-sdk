import {
    result,
    message,
  } from "@permaweb/aoconnect";

const NODEREGISTRY_PROCESS_ID = "lsVh9GO7pzFXcFEuAfw7l_9WU7KAAqTRkU0kVH0lx2g";

export const register = async (name: string, 
    pk: string, desc: string, signer: any) => {
    const msgId = await message({
        process: NODEREGISTRY_PROCESS_ID,
        // Tags that the process will use as input.
        tags: [
          { name: "Action", value: "Register" },
          { name: "Name", value: name},
          { name: "Desc", value: desc},
        ],
        // A signer function used to build the message "signature"
        signer: signer,
        data: pk,
      });
    console.log("register msgId=", msgId);
    let { Messages } = await result({
        // the arweave TXID of the message
        message: msgId,
        // the arweave TXID of the process
        process: NODEREGISTRY_PROCESS_ID,
      });
    const res = Messages[0].Data;
    console.log("register res=", res);
    return res;
}

export const nodes = async (signer: any) => {
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
    return nodes;
}
