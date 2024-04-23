import lhe from "./lib/lhe";

const THRESHOLD_2_3 = {t: 2, n: 3, indices: [1, 2, 3]};

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
    let param_obj = threshold;
    param_obj.node_pks = publicKeys;
    param_obj.msg = Array.from(data);
    return lhe_call(lhe._encrypt, param_obj); 
}

export const decrypt = (reenc_sks: string[],
    consumer_sk: string,
    nonce: string,
    enc_msg: string,
    chosen_indices: any = [1,2],
    threshold: any = THRESHOLD_2_3) => {
        let param_obj = threshold;
        param_obj.reenc_sks = reenc_sks;
        param_obj.consumer_sk = consumer_sk;
        param_obj.nonce = nonce;
        param_obj.enc_msg = enc_msg;
        param_obj.chosen_indices = chosen_indices;
        return lhe_call(lhe._decrypt, param_obj); 
}
