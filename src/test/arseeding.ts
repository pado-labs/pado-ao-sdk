
import { readFileSync } from "node:fs"
import { exec } from "node:child_process"

import Arweave from "arweave"

import { ArweaveSigner, getTokenTagByEver, getItemMeta, getBundleFee, getOrders } from "arseeding-js"
import { Config } from "arseeding-js/cjs/types"
import { createAndSubmitItem } from "arseeding-js/cjs/submitOrder"
import { payOrder, newEverpayByRSA } from "arseeding-js/cjs/payOrder"


const arseedingUrl = "https://arseed.web3infra.dev"
console.log("arseedingUrl", arseedingUrl)

const printFee = async (currency: string) => {
  for (let i = 1; i <= 1024 * 1024 * 1024; i = i * 2) {
    const size = i.toString();
    const bundleFee = await getBundleFee(arseedingUrl, size, currency)
    console.log("size:", size, "bundleFee:", bundleFee)
  }
}

const printTokenTag = async (symbol: string) => {
  const tag = await getTokenTagByEver(symbol)
  console.log("symbol:", symbol, "tag:", tag)
}

// npm i arseeding-js
const run = async () => {
  if (false /*OK, FOR TEST*/) {
    await printFee("usdt");
    await printFee("ar");

    await printTokenTag("usdt");
    await printTokenTag("usdc");
    await printTokenTag("eth");
    await printTokenTag("ar");
    await printTokenTag("aocred");
  }

  // const walletpath = "your-ar-wallet.json"
  const walletpath = "arweave-keyfile-0bWT2PB_TeUUDZStfVjVzuP2ChaePiRAR3Y9AesTnws.json"
  console.log("walletpath", walletpath)
  const wallet = JSON.parse(readFileSync(walletpath).toString())
  const signer = new ArweaveSigner(wallet)
  console.log("signer", signer)

  const data = Buffer.from("hi, hello world? 123")
  console.log("data", data)
  const options = {
    tags: [
      { name: "k1", value: "v1" },
      { name: "Content-Type", value: "text/plain" }
    ]
  }
  console.log("options", options)

  const tag = "arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543"
  console.log("tag", tag)

  const config: Config = {
    signer: signer,
    path: "",
    arseedUrl: arseedingUrl,
    tag: tag
  }
  console.log("config", config)

  const order = await createAndSubmitItem(data, options, config)
  console.log("order", order)
  /*
  order {
    itemId: "FgwbbN03jlC_3RwyjDQ4XrW4O9a1rB3AibNGuB7aGqs",
    size: 1096,
    bundler: "uDA8ZblC-lyEFfsYXKewpwaX-kkNDDw8az3IW9bDL68",
    currency: "AR",
    decimals: 12,
    fee: "185021129",
    paymentExpiredTime: 1719489586,
    expectedBlock: 1433497,
    tag: "arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543"
  }
  */
  {
    const itemMeta = await getItemMeta(arseedingUrl, order.itemId)
    console.log("itemMeta", itemMeta)
  }

  {
    // pay for the response order
    const arAddress = await Arweave.init({}).wallets.jwkToAddress(wallet);
    console.log("arAddress", arAddress)
    {
      // Get all orders for address.
      const orders = await getOrders(arseedingUrl, arAddress)
      console.log("orders", orders)
    }

    const everpay = newEverpayByRSA(wallet, arAddress)
    console.log("everpay", everpay)

    everpay.balance({
      tag: tag,
      account: arAddress
    }).then(result => {
      console.log("address:", arAddress, "balance:", result)
    })

    {
      // cannot work? - you should transfer some token to everpay first.
      const everHash = await payOrder(everpay, order)
      console.log("everHash", everHash)
      // everHash 0x4d3f6c25217f4b047867b24991040bd10058c4a256c24de0521c15ef97a2db70
    }
  }


  /*
  Download Data according to order.itemId
  curl --location --request GET "https://arseed.web3infra.dev/FgwbbN03jlC_3RwyjDQ4XrW4O9a1rB3AibNGuB7aGqs"
  */
  {
    const itemId = order.itemId
    const cmd = `curl --location --request GET "https://arseed.web3infra.dev/${itemId}"`
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }
}

run()
