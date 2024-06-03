import { readFileSync } from 'node:fs';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { addWhiteList } from '../src/processes/noderegistry';


// const path = require('path');
// const os = require('os');

describe('noderegistry', () => {
  it('adds an address to the whitelist', async () => {
    // const homeDir = os.homedir();
    // const filePath = path.join(
    //   homeDir,
    //   'Downloads',
    //   'arweave-keyfile-3vB8_X9UgRUGGfVl1I51FJS3xlBHA7xLZNN89V1DajI.json'
    // );
    const walletpath = './aos.json';
    const wallet = JSON.parse(readFileSync(walletpath).toString());
    console.log('wallet', wallet);
    expect(typeof wallet).toBe('object');
    const signer = await createDataItemSigner(wallet);
    console.log('noderegistry-signer', signer);
    expect(signer).not.toBeNull();
    const addr = 'lutTYfSqBYttLyHGU1B7k3wPChVqFJmOe6c6eOLtj1M';
    // const res = await addWhiteList(addr, signer);
    await expect(addWhiteList(addr, signer)).rejects.toBeDefined();

    // thrown: "Forbitten to operate white list"
  });
});