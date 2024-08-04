import { ethers } from 'ethers';


export default class Helper {
  signer: any;
  constructor(provider = window.ethereum) {
    this._init(provider);
  }

  _init(provider: any) {
    let providerT: ethers.providers.Web3Provider = new ethers.providers.Web3Provider(provider);
    this.signer = providerT.getSigner();
  }

  /**
   * Asynchronously transfers Ether to a specified recipient.
   *
   * @param {string} recipient - The Ethereum address of the recipient.
   * @param {bigint} amount - The amount of Ether to send, represented as a bigint for precision.
   */
  async transferEth(recipient: string, amount: bigint) {
    try {
      const transaction = await this.signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount.toString())
      });
      console.log('ETH transfer has been sent', transaction.hash);
    } catch (error) {
      console.error('ETH transfer failed', error);
    }
  }

  /**
   * Asynchronously transfers tokens.
   * @param tokenAddress The address of the token contract.
   * @param recipient The address of the recipient.
   * @param amount The amount to transfer, represented as a string.
   * @param spender The address of the spender, who is authorized to operate the token transfer.
   * This function first approves the spender to withdraw a specified amount of tokens from our account,
   * then executes the token transfer operation.
   */
  async transferToken(tokenAddress: string, recipient: string, amount: string, spender: string) {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [] as Array<ethers.utils.FunctionFragment>,
        this.signer
      ) as ethers.Contract & {
        approve(spender: string, amount: ethers.BigNumberish): Promise<ethers.providers.TransactionResponse>;
        transfer(recipient: string, amount: ethers.BigNumberish): Promise<ethers.providers.TransactionResponse>;
      };

      //Firstly, approve the spender to withdraw tokens from our account
      await tokenContract.approve(spender, ethers.utils.parseUnits(amount, 18)); // 假设代币有18位小数

      // Waiting for approval transactions to be mined (optional, but recommended)
      // Note: More precise transaction tracking may be required here, as the above method will not directly return the just sent transaction
      // You can track it by listening to the provider's transaction events or using other mechanisms

      //Then, execute the transfer
      await tokenContract.transfer(recipient, ethers.utils.parseUnits(amount, 18));
      console.log('Token transfer has been sent');
    } catch (error) {
      console.error('Token transfer failed', error);
    }
  }
}