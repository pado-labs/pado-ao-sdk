import lhe from "./lib/lhe";

export const THRESHOLD_2_3 = {t: 2, n: 3, indices: [1, 2, 3]};

const lhe_call = (func: any, param_obj: any) => {
    let param_json = JSON.stringify(param_obj);
    let param_ptr = lhe.allocateUTF8(param_json);

    let cptr = func(param_ptr);
    lhe._free(param_ptr);

    let ret_json = lhe.UTF8ToString(cptr);
    lhe._free_cptr(cptr);

    let ret_obj = JSON.parse(ret_json);

    return ret_obj;
}

export const keygen = (param_obj: any = THRESHOLD_2_3) => {
    return lhe_call(lhe._keygen, param_obj); 
}

export const encrypt = (publicKeys: string[],
    data: Uint8Array,
    threshold: any = THRESHOLD_2_3) => {
    let param_obj = {...threshold, node_pks: publicKeys, msg:Array.from(data)};
    return lhe_call(lhe._encrypt, param_obj); 
}

export const reencrypt = (
    enc_sk: string,
    node_sk: string,
    consumer_pk: string,
    threshold: any = THRESHOLD_2_3) => {
        let param_obj = {...threshold, enc_sk: enc_sk, node_sk: node_sk, consumer_pk: consumer_pk};
        return lhe_call(lhe._reencrypt, param_obj); 
}

export const decrypt = (reenc_sks: string[],
    consumer_sk: string,
    nonce: string,
    enc_msg: string,
    chosen_indices: any = [1,2],
    threshold: any = THRESHOLD_2_3) => {
        let param_obj = {...threshold, reenc_sks: reenc_sks, consumer_sk: consumer_sk,
            nonce:nonce, enc_msg: enc_msg, chosen_indices: chosen_indices};
        return lhe_call(lhe._decrypt, param_obj); 
}
