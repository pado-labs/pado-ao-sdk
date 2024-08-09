import { ArweaveSigner, EthereumSigner, InjectedArweaveSigner, InjectedEthereumSigner } from 'arseeding-js';
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder';
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder';
import Everpay, { ChainType } from 'everpay';
import BaseStorage from './base-storage';
import { ethers } from 'ethers';
import { ARSEEDING_SYMBOL_MAPPING_WITH_TAG } from '../config';
import { SupportedSymbols } from '../types';

const arseedingUrl = 'https://arseed.web3infra.dev';
const tag =
  'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543';
const ethereumTag =
  'ethereum-eth-0x0000000000000000000000000000000000000000';

enum RuntimeEnv {
  Node = 'node',
  Explorer = 'explorer'
}

export default class ArseedingStorage extends BaseStorage {
  /**
   * Submits data to the network using either a Node.js environment or an explorer.
   *
   * @param data - The data to be submitted, in the form of a Uint8Array.
   * @param symbol - which symbol to pay
   * @returns A Promise that resolves to a string representing the item ID of the submitted data.
   */
  async submitData(data: Uint8Array, symbol: SupportedSymbols = 'ETH'): Promise<string> {
    if (this.runtimeEnv() === RuntimeEnv.Node) {
      throw new Error('Running in a node environment is not supported');
    }
    const wallet = this.wallet;
    let signer;
    let provider;
    let payTag = ARSEEDING_SYMBOL_MAPPING_WITH_TAG[symbol];
    const tag = (payTag as any).tag;
    const chainType = (payTag as any).chainType;
    // This is explorer
    if (wallet.walletType === 'arweave') {
      signer = new InjectedArweaveSigner(wallet.wallet);
      await signer.sign(data.buffer as Uint8Array);
    } else if (wallet.walletType === 'metamask') {
      provider = new ethers.providers.Web3Provider((window as any).ethereum);
      signer = new InjectedEthereumSigner(provider);
      await signer.sign(data);
    } else {
      throw new Error(`Not support walletType:${wallet.walletType}!`);
    }

    const options = {
      tags: [
        { name: 'k1', value: 'v1' },
        { name: 'Content-Type', value: 'application/octet-stream' }
      ]
    };
    const config = {
      signer: signer,
      path: '',
      arseedUrl: arseedingUrl,
      tag: tag
    };
    // @ts-ignore
    const order = await createAndSubmitItem(data.buffer, options, config);
    console.log('order', order);
    //pay for order
    if (wallet.walletType === 'arweave') {
      //explorer
      // TODO-ysm window.arweaveWallet why not param-wallet , or use window.arweaveWallet directly without pass wallet param?
      const arAddress = await window.arweaveWallet.getActiveAddress();
      console.log('chainType', chainType);
      const pay = new Everpay({
        account: arAddress,
        chainType: chainType as ChainType,
        arJWK: 'use_wallet'
      });
      // pay
      // const everHash = await payOrder(pay, order);
      // console.log(everHash);
    } else {
      // metamask
      if (!provider) {
        throw new Error('provider is undefined!');
      }
      signer = provider.getSigner();
      const pay = new Everpay({
        account: wallet.wallet.selectedAddress,
        chainType: chainType as ChainType,
        ethConnectedSigner: signer as any
      });
      // const everHash = await payOrder(pay, order);
      // console.log(everHash);
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

  //----------------------------internal function-----------------------------------
  /**
   * check current runtime environment
   */
  runtimeEnv() {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return RuntimeEnv.Node;
    }
    return RuntimeEnv.Explorer;
  }
}