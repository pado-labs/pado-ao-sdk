import { ArweaveSigner, InjectedArweaveSigner } from 'arseeding-js';
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder';


const arseedingUrl = 'https://arseed.web3infra.dev';


export const submitDataToArseeding = async (data: Uint8Array, wallet: any, tag: any) => {

  let signer;
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // This is Node.js
    signer = new ArweaveSigner(wallet);
  } else {
    // This is explorer
    signer = new InjectedArweaveSigner(wallet);
  }
  // @ts-ignore
  await signer.sign(data.buffer);
  const options = {
    tags: [
      { name: 'k1', value: 'v1' },
      { name: 'Content-Type', value: 'application/octet-stream' }
      // {name: "Content-Type", value: "text/plain"}
    ]
  };
  console.log('options', options);
  console.log('tag', tag);
  // const rsp  getTokenTagByEver('ar')
  const config = {
    signer: signer,
    path: '',
    arseedUrl: arseedingUrl,
    tag: tag
  };
  // @ts-ignore
  const order = await createAndSubmitItem(data.buffer, options, config);
  console.log('order', order);

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
