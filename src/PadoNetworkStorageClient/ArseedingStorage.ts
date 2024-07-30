import { ArweaveSigner, InjectedArweaveSigner } from 'arseeding-js';
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder';
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder';
import Everpay, { ChainType } from 'everpay';
import BaseStorage from './BaseStorage';

const arseedingUrl = 'https://arseed.web3infra.dev';
const tag =
  'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543';

export default class ArseedingStorage extends BaseStorage {
  /**
   * Submits data to the network using either a Node.js environment or an explorer.
   *
   * @param data - The data to be submitted, in the form of a Uint8Array.
   * @param wallet - The wallet object used for signing transactions.
   * @returns A Promise that resolves to a string representing the item ID of the submitted data.
   */
  async submitData(data: Uint8Array, wallet: any): Promise<string> {
    let signer;
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // This is Node.js
      signer = new ArweaveSigner(wallet);
    } else {
      // This is explorer
      signer = new InjectedArweaveSigner(wallet);
      // @ts-ignore
      await signer.sign(data.buffer);
    }

    const options = {
      tags: [
        { name: 'k1', value: 'v1' },
        { name: 'Content-Type', value: 'application/octet-stream' }
        // {name: "Content-Type", value: "text/plain"}
      ]
    };
    const config = {
      signer: signer,
      path: '',
      arseedUrl: arseedingUrl,
      tag
    };
    // @ts-ignore
    const order = await createAndSubmitItem(data.buffer, options, config);
    console.log('order', order);
    //pay for order
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      //nodejs
      const address = await this.arweave.wallets.jwkToAddress(wallet);
      const pay = newEverpayByRSA(wallet, address);
      // pay
      const everHash = await payOrder(pay, order);
      console.log('everHash:', everHash);
    } else {
      //explorer
      // TODO-ysm window.arweaveWallet why not param-wallet , or use window.arweaveWallet directly without pass wallet param?
      const arAddress = await window.arweaveWallet.getActiveAddress();
      let chainTyp = tag.split('-')[0];
      if (chainTyp.indexOf(',') !== -1) {
        chainTyp = chainTyp.split(',')[0];
      }
      console.log('chainType', chainTyp);
      const pay = new Everpay({
        account: arAddress,
        chainType: chainTyp as ChainType,
        arJWK: 'use_wallet'
      });
      // pay
      const everHash = await payOrder(pay, order);
      console.log(everHash);
    }
    return order.itemId;
  }

  /**
   * Asynchronously retrieves data associated with the specified transaction ID.
   * @param transactionId - The unique identifier of the transaction to fetch data for.
   * @returns A promise that resolves to a Uint8Array containing the fetched data.
   */
  async getData(transactionId: string): Promise<Uint8Array> {
    try {
      const response = await fetch(arseedingUrl + '/' + transactionId, { method: 'GET' });
      if (!response.ok) {
        console.log(response);
        throw new Error(`Get data failed! Status: ${response.status}`);
      }
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('get data failed:', error);
      throw error;
    }
  }
}