import { result, message } from "@permaweb/aoconnect";
import { AOCRED_PROCESS_ID, TASKS_PROCESS_ID } from "../config";

export const getTag = (Message: any, Tag: string) => {
  const Tags = Message.Tags
  for (let theTag of Tags) {
    if (theTag.name === Tag) {
      return theTag.value
    }
  }
  return null
}

export const transfer = async (from: string, recipient: string, quantity: string, signer: any) => {
  let msgId = await message({
    "process": from,
    "signer": signer,
    "tags": [
      { "name": "Action", "value": "Transfer" },
      { "name": "Recipient", "value": recipient },
      { "name": "Quantity", "value": quantity },
    ]
  });
  let Result = await result({
    "process": from,
    "message": msgId,
  });
  if (Result.Error) {
    console.log(Result.Error)
  }
  let Messages = Result.Messages
  if (getTag(Messages[0], "Error")) {
    throw getTag(Messages[0], "Error")
  }


  console.log("Messages", Messages);

  const res = Messages[0].Data;
  return res;
}

export const transferAOCREDToTask = async (quantity: string, signer: any) => {
  const res = await transfer(AOCRED_PROCESS_ID, TASKS_PROCESS_ID, quantity, signer);
  return res;
}

