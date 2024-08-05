import { message, result } from '@permaweb/aoconnect';


export default class Helper {
  constructor() {}

  /**
   * Asynchronously processes a fund transfer.
   *
   * This function is responsible for transferring a specified amount of funds from one account to another.
   * It first creates and sends a transfer message, then awaits confirmation of the transaction result.
   * If the operation is successful, it returns the message data produced by the transaction;
   * if the operation fails, it throws an error.
   *
   * @param from The address of the account initiating the transfer.
   * @param recipient The address of the account receiving the funds.
   * @param quantity The amount of funds to be transferred.
   * @param signer The signing object used to sign the transaction.
   * @returns Returns the message data produced by the transaction.
   * @throws Throws an exception containing the error message if the transaction fails.
   */
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


  /**
   * Asynchronously processes a fund transfer.
   *
   * This function is responsible for transferring a specified amount of funds from one account to another.
   * It first creates and sends a transfer message, then awaits confirmation of the transaction result.
   * If the operation is successful, it returns the message data produced by the transaction;
   * if the operation fails, it throws an error.
   *
   * @param from The address of the account initiating the transfer.
   * @param recipient The address of the account receiving the funds.
   * @param quantity The amount of funds to be transferred.
   * @param signer The signing object used to sign the transaction.
   * @returns Returns the message data produced by the transaction.
   * @throws Throws an exception containing the error message if the transaction fails.
   */
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