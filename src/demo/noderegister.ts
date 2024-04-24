import { createDataItemSigner } from "@permaweb/aoconnect";
import { register, update } from "../processes/noderegistry";
import { readFileSync } from "node:fs";
import { exit } from "node:process";


/**
 * 
 * Register node public key
 * 
 * @param name - the node name
 * @param pk - the node public key
 */
async function registerPublicKey(name: string, pk: string, signer: any) {
    return await register(name, pk, `the desc of ${name}`, signer);
}
async function updatePublicKey(name: string, pk: string, signer: any) {
    return await update(name, pk, `the desc of ${name}`, signer);
}

async function test() {
    setTimeout(async () => {
        const args = process.argv.slice(2)
        if (args.length < 3) {
            console.log("args: <name> <keyfile> <walletpath>");
            exit(2);
        }
        let name = args[0];
        let keyfile = args[1];
        let walletpath = args[2];

        const key = JSON.parse(readFileSync(keyfile).toString());
        const wallet = JSON.parse(readFileSync(walletpath).toString());
        const signer = createDataItemSigner(wallet);

        const res1 = await registerPublicKey(name, key.pk, signer);
        console.log(`res1=${res1}`);
        const res2 = await updatePublicKey(name, key.pk, signer);
        console.log(`res2=${res2}`);
    }, 1000)
}
test();



