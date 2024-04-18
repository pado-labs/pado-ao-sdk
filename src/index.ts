
export const uploadData = async (data: Uint8Array, dataTag: string, owner: string, price: string) => {
    // 1. get pado node public key
    // 2. invoke algorithm encrypt
    // 3. upload encrypted data to AR
    // 4. register encrypted keys and ar data url to ao data process
    // 5. return data id
}

export const listData = async () => {
    // 1. get data list from data process
    // 2. return dataTag, data ar url, data id, data price
}

export const SubmitTask = async (dataId: string, publicKey: string) => {
    // 1. invoke task process submit task
    // 2. return task id
}

export const getResult = async (taskId: string) => {
    // 1. get encrypted result
    // 2. invoke algorithm get plain data
}

export const SubmitTaskAndGetResult = async (dataId: string, publicKey: string) => {
    
}
