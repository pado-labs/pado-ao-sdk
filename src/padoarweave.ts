import Arweave from 'arweave';

export const ARConfig = {
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
};

// submit data to AR
export const submitDataToAR = async (arweave: Arweave, data: string | Uint8Array | ArrayBuffer, wallet: any) => {
    // Create a data transaction
    let transaction = await arweave.createTransaction({
      data: data
    }, wallet);
  
    // Optional. Add tags to a transaction
    // GraphQL uses tags when searching for transactions.
    transaction.addTag('Type', 'PADO-EncryptedData');
  
    // Sign a transaction
    await arweave.transactions.sign(transaction, wallet);
  
    // Submit a transaction
    // {
    //   // way1: for small
    //   const response = await arweave.transactions.post(transaction);
    //   console.log(`response.status: ${response.status}`);
    // }
  
    {
      // way2: for big
      let uploader = await arweave.transactions.getUploader(transaction);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }
    }
  
    return transaction.id;
}

export const getDataFromAR = async (arweave: Arweave, transactionId: string): Promise<string> => {
  const res = await arweave.transactions.getData(transactionId, { decode: true, string: true }) as string;
  return res;
}
  