import { createDataItemSigner } from "@permaweb/aoconnect";
import { register as dataRegister } from "./processes/dataregistry";
import { readFileSync } from "node:fs";
import { exit } from "node:process";
import { encrypt } from "./algorithm";
import { nodes } from "./processes/noderegistry";
import { submitDataToAR } from "./padoarweave";
import { NODE_NAMES } from "./config";
import Arweave from 'arweave';


export interface PriceInfo {
    price: string;
    symbol?: string;
}

/**
 * Encrypt data and upload data
 *
 * @param data - plain data need to encrypt and upload
 * @param dataTag - the data meta info
 * @param priceInfo - The data price symbol and price
 * @param wallet - The ar wallet
 * @param arweave - The ar object and default is ar production
 * @returns The uploaded encrypted data id
 */
export const uploadData = async (data: Uint8Array, dataTag: any, priceInfo: PriceInfo,
    wallet: any, arweave: Arweave = Arweave.init({})): Promise<string> => {
    if (data.length === 0) {
        throw new Error("The Data to be uploaded can not be empty");
    }

    priceInfo.symbol = priceInfo.symbol || "PADO Token";

    let nodesres = await nodes();
    nodesres = JSON.parse(nodesres);
    let nodepks = Object();
    for (let i in nodesres) {
        let node = nodesres[i];
        nodepks[node.name] = node.publickey;
    }
    let nodesPublicKey = [];
    for (let i in NODE_NAMES) {
        nodesPublicKey.push(nodepks[NODE_NAMES[i]]);
    }

    const res = encrypt(nodesPublicKey, data);

    const transactionId = await submitDataToAR(arweave, res.enc_msg, wallet);

    const signer = createDataItemSigner(wallet);
    const encSksStr = JSON.stringify(res.enc_sks);
    // console.log('encSksStr', encSksStr);
    // console.log('res.nonce', res.nonce);
    const dataRes = await dataRegister(JSON.stringify(dataTag),
        JSON.stringify(priceInfo), encSksStr, res.nonce, transactionId, signer);

    // console.log('res.dataRes', dataRes);
    return dataRes;
}

async function test() {
    const args = process.argv.slice(2)
    if (args.length < 1) {
        console.log("args: <arwalletpath>");
        exit(2);
    }
    let walletpath = args[0];
    const wallet = JSON.parse(readFileSync(walletpath).toString());

    //TODO: Local test with ArLocal(`npx arlocal` to start)
    const arweave = Arweave.init({
        host: '127.0.0.1',
        port: 1984,
        protocol: 'http'
    });

    let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    let dataTag = { "testtagkey": "testtagvalue" };
    let priceInfo = { price: "1", symbol: "AOCRED" };
    const dataId = await uploadData(data, dataTag, priceInfo, wallet, arweave);
    console.log(`DATAID=${dataId}`);
}
test();


