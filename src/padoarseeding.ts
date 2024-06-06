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
  console.log('signer', signer);
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
  console.log('config', config);
  // fileArrayBuffer = Buffer.from('This is test data!')
  // @ts-ignore
  const order = await createAndSubmitItem(data.buffer, options, config);
  console.log('order', order);

  return order;
};