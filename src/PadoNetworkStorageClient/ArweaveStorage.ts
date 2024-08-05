import type { createTransactionParamsTuple, signParamsTuple } from '../index.d';
import BaseStorage from './BaseStorage';


export default class ArweaveStorage extends BaseStorage {
  /**
   * Submits data to the Arweave network by creating and signing a transaction, then uploading it.
   * Supports both small and large data submissions through different methods.
   *
   * @param data - The data to be submitted, can be in the form of a string, Uint8Array, or ArrayBuffer.
   * @param wallet - The wallet object used for creating and signing the transaction; could be `window.arweave` in browser context.
   * @returns A Promise that resolves to the transaction ID once the data has been successfully submitted.
   */
  async submitData(data: Uint8Array, wallet: any): Promise<string> {
    let createTransactionParams: createTransactionParamsTuple = [
      {
        data
      }
    ];
    let signParams: signParamsTuple = [undefined];
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // This is Node.js
      createTransactionParams[1] = wallet;
      signParams[1] = wallet;
    }
    // Create a data transaction
    let transaction = await this.arweave.createTransaction(...createTransactionParams);
    signParams[0] = transaction;
    // Optional. Add tags to a transaction
    // GraphQL uses tags when searching for transactions.
    transaction.addTag('Type', 'PADO-EncryptedData');

    // Sign a transaction
    await this.arweave.transactions.sign(...signParams);

    // Submit a transaction
    // {
    //   // way1: for small
    //   const response = await this.arweave.transactions.post(transaction);
    //   console.log(`response.status: ${response.status}`);
    // }

    // way2: for big
    let uploader = await this.arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

    return transaction.id;
  }

  /**
   * Asynchronously retrieves the data of a transaction from Arweave.
   *
   * @param transactionId - The ID of the transaction to fetch the data from.
   * @returns A promise that resolves to the transaction's data as a Uint8Array.
   */
  async getData(transactionId: string): Promise<Uint8Array> {
    const res = (await this.arweave.transactions.getData(transactionId, { decode: true })) as Uint8Array;
    return res;
  }
}