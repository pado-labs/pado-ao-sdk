import { ArweaveSigner, EthereumSigner, InjectedArweaveSigner, InjectedEthereumSigner } from 'arseeding-js';
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder';
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder';
import Everpay, { ChainType } from 'everpay';
import BaseStorage from './BaseStorage';
import { WalletWithType } from 'types';
import { ethers } from 'ethers';

const arseedingUrl = 'https://arseed.web3infra.dev';
const tag =
  'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543';
const ethereumTag =
  'ethereum-eth-0x0000000000000000000000000000000000000000';

export default class ArseedingStorage extends BaseStorage {
  /**
   * Submits data to the network using either a Node.js environment or an explorer.
   *
   * @param data - The data to be submitted, in the form of a Uint8Array.
   * @param wallet - The wallet object used for signing transactions.
   * @returns A Promise that resolves to a string representing the item ID of the submitted data.
   */
  async submitData(data: Uint8Array, wallet: WalletWithType): Promise<string> {
    let signer;
    let provider;
    let payTag = tag;
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // This is Node.js
      if (wallet.walletType !== 'arweave') {
        throw new Error(`Not support walletType:${wallet.walletType} in node environment!`);
      }
      signer = new ArweaveSigner(wallet.wallet);
    } else {
      // This is explorer
      if (wallet.walletType === 'arweave') {
        signer = new InjectedArweaveSigner(wallet.wallet);
        await signer.sign(data.buffer as Uint8Array);
      } else if (wallet.walletType === 'metamask') {
        provider = new ethers.providers.Web3Provider((window as any).ethereum);
        signer = new InjectedEthereumSigner(provider);
        // await provider.send("eth_requestAccounts", []);
        // const signer = await provider.getSigner()
        payTag = ethereumTag;
        await signer.sign(data);
      }else{
        throw new Error(`Not support walletType:${wallet.walletType}!`);
      }
      // @ts-ignore
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
      tag:payTag
    };
    // @ts-ignore
    const order = await createAndSubmitItem(data.buffer, options, config);
    console.log('order', order);
    //pay for order
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      //nodejs
      if (wallet.walletType === 'arweave') {
        const address = await this.arweave.wallets.jwkToAddress(wallet.wallet);
        const pay = newEverpayByRSA(wallet.wallet, address);
        // pay todo
        // const everHash = await payOrder(pay, order);
        // console.log('everHash:', everHash);
      }else {
        throw new Error('Not support walletType:'+wallet.walletType+' in node environment!')
      }
    } else {
      if(wallet.walletType === 'arweave') {
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
        // const everHash = await payOrder(pay, order);
        // console.log(everHash);
      }else{
        // metamask
        if(!provider){
          throw new Error('provider is undefined!');
        }
        signer = provider.getSigner();
        const pay = new Everpay({
          account: wallet.wallet.selectedAddress,
          chainType: 'ethereum' as  ChainType,
          ethConnectedSigner: signer as any
        })

        // const everHash = await payOrder(pay, order);
        // console.log(everHash);
      }
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