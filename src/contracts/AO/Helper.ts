import { message, result } from '@permaweb/aoconnect';

export default class Helper {
  constructor() {}
  async transfer(from: string, recipient: string, quantity: string, signer: any) {
    let msgId = await message({
      process: from,
      signer: signer,
      tags: [
        { name: 'Action', value: 'Transfer' },
        { name: 'Recipient', value: recipient },
        { name: 'Quantity', value: quantity }
      ]
    });
    let Result = await result({
      process: from,
      message: msgId
    });
    if (Result.Error) {
      console.log(Result.Error);
    }
    let Messages = Result.Messages;
    if (this._getTag(Messages[0], 'Error')) {
      throw this._getTag(Messages[0], 'Error');
    }

    console.log('Messages', Messages);

    const res = Messages[0].Data;
    return res;
  }

  private _getTag(Message: any, Tag: string) {
    const Tags = Message.Tags;
    for (let theTag of Tags) {
      if (theTag.name === Tag) {
        return theTag.value;
      }
    }
    return null;
  }
}
