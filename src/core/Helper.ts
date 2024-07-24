import { AOCRED_PROCESS_ID, TASKS_PROCESS_ID } from '../config';
import { transfer as utilsTransfer } from '../processes/utils';

interface IHelper {
  chainName: string;
  transfer(from: string, recipient: string, quantity: string, signer: any): void;
}

export default class Helper implements IHelper {
  chainName: string;

  constructor(chainName: string) {
    this.chainName = chainName;
  }

  getTag(Message: any, Tag: string) {
    const Tags = Message.Tags;
    for (let theTag of Tags) {
      if (theTag.name === Tag) {
        return theTag.value;
      }
    }
    return null;
  }

  /**
   * transfer accounts
   *
   * @param from - sender address.
   * @param recipient - recipient.
   * @param quantity - transfer quantity.
   * @param signer
   * @returns
   */
  async transfer(
    from: string = AOCRED_PROCESS_ID,
    recipient: string = TASKS_PROCESS_ID,
    quantity: string,
    signer: any
  ) {
    const res = utilsTransfer(from, recipient, quantity, signer);
    return res;
    // let msgId = await message({
    //   process: from,
    //   signer: signer,
    //   tags: [
    //     { name: 'Action', value: 'Transfer' },
    //     { name: 'Recipient', value: recipient },
    //     { name: 'Quantity', value: quantity }
    //   ]
    // });
    // let Result = await result({
    //   process: from,
    //   message: msgId
    // });
    // if (Result.Error) {
    //   console.log(Result.Error);
    // }
    // let Messages = Result.Messages;
    // if (this.getTag(Messages[0], 'Error')) {
    //   throw this.getTag(Messages[0], 'Error');
    // }

    // console.log('Messages', Messages);

    // const res = Messages[0].Data;
    // return res;
  }
}

