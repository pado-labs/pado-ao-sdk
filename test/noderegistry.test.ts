import { readFileSync } from 'node:fs';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { addWhiteList } from '../src/processes/noderegistry';


const path = require('path');
const os = require('os');

describe('noderegistry', () => {
  it('adds an address to the whitelist,Will return an error message', async () => {
    const homeDir = os.homedir();
    const walletpath = path.join(homeDir, 'aos.json');
    const wallet = JSON.parse(readFileSync(walletpath).toString());
    expect(typeof wallet).toBe('object');
    const signer = await createDataItemSigner(wallet);
    expect(signer).not.toBeNull();
    const addr = 'lutTYfSqBYttLyHGU1B7k3wPChVqFJmOe6c6eOLtj1M';
    await expect(addWhiteList(addr, signer)).rejects.toMatch('Forbitten to operate white list');
  });
});