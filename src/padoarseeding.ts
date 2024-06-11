import { ArweaveSigner, InjectedArweaveSigner } from 'arseeding-js';
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder';
import Arweave from 'arweave';
import { newEverpayByRSA, payOrder } from 'arseeding-js/cjs/payOrder';
import Everpay, { ChainType } from 'everpay';


const arseedingUrl = 'https://arseed.web3infra.dev';


export const submitDataToArseeding = async (arweave: Arweave,data: Uint8Array, wallet: any, tag: any) => {

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
    tag: tag
  };
  // @ts-ignore
  const order = await createAndSubmitItem(data.buffer, options, config);
  console.log('order', order);
  //pay for order
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    //nodejs
    const address = await arweave.wallets.jwkToAddress(wallet);
    const pay = newEverpayByRSA(wallet, address);
    // pay
    const everHash = await payOrder(pay, order);
    console.log('everHash:', everHash);
  } else {
    //explorer
    const arAddress = await window.arweaveWallet.getActiveAddress();
    let chainTyp =  tag.split('-')[0];
    if (chainTyp.indexOf(',') !== -1) {
      chainTyp = chainTyp.split(',')[0];
    }
    console.log('chainType',chainTyp);
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
};

export const getDataFromArseeding = async (transactionId: string): Promise<Uint8Array> => {
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
};
