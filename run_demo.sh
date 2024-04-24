#!/bin/bash
set -ex
curdir=$(pwd)
demodir=${curdir}/dist/demo

# build
npm run build

# 0. keygen(nodes)
node ${demodir}/keygen.js testnode1
node ${demodir}/keygen.js testnode2
node ${demodir}/keygen.js testnode3

# 0. keygen(buyer)
node ${demodir}/keygen.js buyer

# 1. pado node register/update public key
node ${demodir}/noderegister.js testnode1 testnode1-key.json ~/.aos.json
node ${demodir}/noderegister.js testnode2 testnode2-key.json ~/.aos.json
node ${demodir}/noderegister.js testnode3 testnode3-key.json ~/.aos.json
