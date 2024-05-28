import { readFileSync } from 'fs'
import { ArweaveSigner } from 'arseeding-js'
import { getTokenTagByEver } from 'arseeding-js'
import { Config } from 'arseeding-js/cjs/types'
import { createAndSubmitItem } from 'arseeding-js/cjs/submitOrder'
import { payOrder, newEverpayByRSA } from 'arseeding-js/cjs/payOrder'
import { exec } from "node:child_process";
import Arweave from "arweave";


// npm i arseeding-js
const run = async () => {
  const walletpath = 'your-ar-wallet.json'
  console.log('walletpath', walletpath)
  const wallet = JSON.parse(readFileSync(walletpath).toString())
  const signer = new ArweaveSigner(wallet)
  console.log('signer', signer)


  const data = Buffer.from('hi, hello world? 123')
  console.log('data', data)
  const options = {
    tags: [
      { name: 'k1', value: 'v1' },
      { name: 'Content-Type', value: 'text/plain' }
    ]
  }
  console.log('options', options)
  const arseedingUrl = 'https://arseed.web3infra.dev'
  console.log('arseedingUrl', arseedingUrl)


  {
    const tag = await getTokenTagByEver('usdt')
    console.log('usdt tag', tag)
    // usdt tag [
    //   'ethereum-usdt-0xdac17f958d2ee523a2206206994597c13d831ec7',
    //   'bsc-usdt-0x55d398326f99059ff775485246999027b3197955'
    // ]
  }
  {
    const tag = await getTokenTagByEver('usdc')
    console.log('usdc tag', tag)
    // usdc tag [ 'ethereum-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' ]
  }
  {
    const tag = await getTokenTagByEver('eth')
    console.log('eth tag', tag)
    // eth tag [ 'ethereum-eth-0x0000000000000000000000000000000000000000' ]
  }
  {
    const tag = await getTokenTagByEver('ar')
    console.log('ar tag', tag)
    // ar tag [
    //   'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543'
    // ]
  }
  const tag = 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543'
  console.log('tag', tag)

  const config: Config = {
    signer: signer,
    path: '',
    arseedUrl: arseedingUrl,
    tag: tag
  }
  console.log('config', config)

  const order = await createAndSubmitItem(data, options, config)
  console.log('order', order)
  /*
    order {
      itemId: 'T7QI0YKQVXKtcTID6b-sJya7p6nzHH4vejQYrwoXlYA',
      size: 1096,
      bundler: 'uDA8ZblC-lyEFfsYXKewpwaX-kkNDDw8az3IW9bDL68',
      currency: 'AR',
      decimals: 12,
      fee: '185021129',
      paymentExpiredTime: 1719474009,
      expectedBlock: 1433377,
      tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543'
    }
  */

  {
    // pay for the response order
    const arAddress = await Arweave.init({}).wallets.jwkToAddress(wallet);
    console.log('arAddress', arAddress)
    const everpay = newEverpayByRSA(wallet, arAddress)
    console.log('everpay', everpay)

    if (false) {
      // cannot work ??
      const everHash = await payOrder(everpay, order)
      console.log('everHash', everHash)
    }
  }


  /*
  Download Data according to order.itemId
  curl --location --request GET 'https://arseed.web3infra.dev/T7QI0YKQVXKtcTID6b-sJya7p6nzHH4vejQYrwoXlYA'
  */
  {
    const itemId = order.itemId
    const cmd = `curl --location --request GET 'https://arseed.web3infra.dev/${itemId}'`
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
