// ######### Common Config #########

export const DEFAULT_ENCRYPTION_SCHEMA = {
  t: '2',
  n: '3'
};
// AOCRED and wAR are used for AO, AR and ETH are used for EVM chains

export const TASK_TYPE = 'ZKLHEDataSharing';
export const COMPUTE_LIMIT = '9000000000000';
export const MEMORY_LIMIT = '512M';
// ######### ao Config ##########
export const NODE_REGISTRY_PROCESS_ID = 'Vlq4jWP6PLRo0Msjnxp8-vg9HalZv9e8tiz13OTK3gk';
export const DATA_REGISTRY_PROCESS_ID = 'daYyE-QRXg2MBrX1E1lUmJ1hMR-GEmyrdUiUnv3dWLY';
export const TASKS_PROCESS_ID = 'fX6ek4jPhcpM0XIOw2CNO2xiOUYGPuaRHXztW9_JWsY';
export const AOCRED_PROCESS_ID = 'Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc';
export const WAR_PROCESS_ID = 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10';

export const SUPPORT_SYMBOLS_ON_AO = ['AOCRED', 'wAR'];
export const SUPPORT_SYMBOL_ON_AO_FROM_ADDRESS_MAP = {
  AOCRED: AOCRED_PROCESS_ID,
  wAR: WAR_PROCESS_ID
};


// ######### evm Config ##########
export const PADO_NETWORK_CONTRACT_ADDRESS = {
  ao: {},
  // mainnet
  ethereum: {
    dataMgt: '',
    feeMgt: '',
    taskMgt: '',
    workerMgt: ''
  },
  // holesky
  holesky: {
    dataMgt: '0x4C5A3707578b1481bf60CC75177d13B9b7998D19',
    feeMgt: '0x1b6dc34B40743Ac59178a6114C73796111f77E79',
    taskMgt: '0x26A9B77CA4f230dD7292f8e1159D979006094c9F',
    workerMgt: '0x33387A204E8bD02ac2309a35aAa46dFd33148F00'
  }
};

// ###### ArSeeding Config #####
export const ARSEEDING_SYMBOL_MAPPING_WITH_TAG = {
  ETH: {
    tag: 'ethereum-eth-0x0000000000000000000000000000000000000000',
    chainType: 'ethereum'
  },
  AR: {
    tag: 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543',
    chainType: 'arweave'
  },
  AOCRED: {},
  wAR: {}
};
