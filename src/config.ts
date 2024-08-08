export const NODEREGISTRY_PROCESS_ID = "Vlq4jWP6PLRo0Msjnxp8-vg9HalZv9e8tiz13OTK3gk";
export const DATAREGISTRY_PROCESS_ID = "daYyE-QRXg2MBrX1E1lUmJ1hMR-GEmyrdUiUnv3dWLY";
export const TASKS_PROCESS_ID = "fX6ek4jPhcpM0XIOw2CNO2xiOUYGPuaRHXztW9_JWsY";
export const AOCRED_PROCESS_ID = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc";
export const WAR_PROCESS_ID = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10";

export const TASKTYPE = 'ZKLHEDataSharing';
export const COMPUTELIMIT = '9000000000000';
export const MEMORYLIMIT = '512M';


export const PADO_NETWORK_CONTRACT_ADDRESS={
  ao:{},
  ethereum: {
    dataMgt:'',
    feeMgt:'',
    taskMgt:'',
    workerMgt:''
  },
  holesky: {
    dataMgt:'0x4C5A3707578b1481bf60CC75177d13B9b7998D19',
    feeMgt:'0x1b6dc34B40743Ac59178a6114C73796111f77E79',
    taskMgt:'0x26A9B77CA4f230dD7292f8e1159D979006094c9F',
    workerMgt:'0x33387A204E8bD02ac2309a35aAa46dFd33148F00'
  }
}


export const DATACONTRACTADDRESSES = {
  ao: '0x0',
  ethereum: '0x0',
  holesky: '0x41Cd32758A3fFc04565047D4AF1248DE455c705F'
};
export const FEECONTRACTADDRESSES = {
  ao: '0x0',
  ethereum: '0x0',
  holesky: '0x1EbAC1C782Aa9f611daAE19CE77effB8fe8913bD'};
export const TASKCONTRACTADDRESSES = {
  ao: '0x0',
  ethereum: '0x0',
  holesky: '0x00430BF32B6799E58C48C6a5be5DF9fef7D314ED'};

export const DEFAULTENCRYPTIONSCHEMA = {
  t: '2',
  n: '3'
};


export const SUPPORTSYMBOLSONAO = ['AOCRED', 'wAR'];
export const SUPPORTSYMBOLONAOFROMADDRESSMAP = {
  AOCRED: AOCRED_PROCESS_ID,
  wAR: WAR_PROCESS_ID
};