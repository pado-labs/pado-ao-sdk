import { addWhiteList } from "../processes/noderegistry"
import { readFileSync } from "node:fs";
import { createDataItemSigner } from "@permaweb/aoconnect";

const addWhiteNodeOwner = async (addr: string) => {
    const wallet = JSON.parse(readFileSync("/Users/fksyuan/.aos.json").toString());
    const signer = createDataItemSigner(wallet);
    const res = await addWhiteList(addr, signer);
    console.log("addWhiteNodeOwner res=", res);
}

addWhiteNodeOwner("lutTYfSqBYttLyHGU1B7k3wPChVqFJmOe6c6eOLtj1M");
addWhiteNodeOwner("XLmW13GJTV5Xn7K3jyNZQ4Dg5yHnfbzwtDmdE3DB92s");
addWhiteNodeOwner("raZlGBd-pj2n0svwMOIV3WZePDVvTEV-PCYHJKlSrQ8");
