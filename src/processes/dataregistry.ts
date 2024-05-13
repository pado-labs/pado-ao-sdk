import {
  result,
  message,
  dryrun,
} from "@permaweb/aoconnect";

import { DATAREGISTRY_PROCESS_ID } from "../config";
import { getMessageResultData } from "./utils";

export const register = async (dataTag: string,
  price: string, encSks: string, nonce: string,
  encMsg: string, signer: any) => {
  const msgId = await message({
    process: DATAREGISTRY_PROCESS_ID,
    tags: [
      { name: "Action", value: "Register" },
      { name: "DataTag", value: dataTag },
      { name: "Price", value: price },
      { name: "Nonce", value: nonce },
      { name: "EncMsg", value: encMsg },
    ],
    signer: signer,
    data: encSks,
  });

  let Result = await result({
    message: msgId,
    process: DATAREGISTRY_PROCESS_ID,
  });

  const res = getMessageResultData(Result);
  return res;
}

export const getDataById = async (dataId: string) => {
  let { Messages } = await dryrun({
    process: DATAREGISTRY_PROCESS_ID,
    tags: [
      { name: "Action", value: "GetDataById" },
      { name: "DataId", value: dataId },
    ],
  });
  const res = Messages[0].Data;
  return res;
}

export const allData = async () => {
  let { Messages } = await dryrun({
    process: DATAREGISTRY_PROCESS_ID,
    tags: [
      { name: "Action", value: "AllData" },
    ],
  });
  const res = Messages[0].Data;
  return res;
}
