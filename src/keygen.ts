import { exit } from "node:process";
import { keygen } from "./algorithm";
import { writeFileSync } from "node:fs";


/**
 * Generate key pair
 *
 * @returns The key-pair object
 */
export const generateKey = async (): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return keygen();
}

async function test() {
    const args = process.argv.slice(2)
    if (args.length < 1) {
        console.log("args: <name>");
        exit(2);
    }
    let name = args[0];

    let key = await generateKey();
    writeFileSync(`${name}-key.json`, JSON.stringify(key));
}
test();
