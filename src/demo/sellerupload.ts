import { createDataItemSigner } from "@permaweb/aoconnect";
import { encrypt } from "../algorithm";
import { nodes } from "../processes/noderegistry";
import { register as dataRegister } from "../processes/dataregistry";
import { readFileSync } from "node:fs";
import { exit } from "node:process";


/**
 * Encrypt data and upload data
 *
 * @param data - plain data need to encrypt and upload
 * @param dataTag - the data meta info
 * @param signer - The ar wallet signer
 * @param price - The data price using PADO Token
 * @returns The uploaded encrypted data id
 *
 */
export const uploadData = async (data: Uint8Array, dataTag: string, signer: any, price: string) => {
    // 1. get pado node public key
    // 2. invoke algorithm encrypt
    // 3. upload encrypted data to AR
    // 4. register encrypted keys and ar data url to ao data process
    // 5. return data id

    let nodesres = await nodes();
    nodesres = JSON.parse(nodesres);
    // console.log('nodesres:', nodesres);

    let nodepks = Object();
    for (var i in nodesres) {
        var node = nodesres[i];
        nodepks[node.name] = node.publickey;
    }
    let nodesPublicKey = [
        nodepks["testnode1"],
        nodepks["testnode2"],
        nodepks["testnode3"],
    ];
    const res = encrypt(nodesPublicKey, data);
    //console.log("encrypt res=", res);

    const encSksStr = JSON.stringify(res.enc_sks);
    const dataRes = await dataRegister(dataTag,
        price, encSksStr, res.nonce, res.enc_msg, signer);
    return dataRes;
}

async function test() {
    setTimeout(async () => {
        const args = process.argv.slice(2)
        if (args.length < 1) {
            console.log("args: <walletpath>");
            exit(2);
        }
        let walletpath = args[0];

        const wallet = JSON.parse(readFileSync(walletpath).toString());
        const signer = createDataItemSigner(wallet);

        const dataId = await uploadData(new Uint8Array([1, 2, 3]), "test", signer, "1");
        console.log(`DATAID=${dataId}`);
    }, 1000)
}
test();



