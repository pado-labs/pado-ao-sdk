#!/bin/bash
ps -ef | grep nodetask | grep -v grep | awk '{print $2}' | xargs kill -9 >/dev/null 2>&1

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

# 2. start pado node task in the background
nohup node ${demodir}/nodetask.js testnode1 testnode1-key.json ~/.aos.json >${demodir}/nodetask1.log &
nohup node ${demodir}/nodetask.js testnode2 testnode2-key.json ~/.aos.json >${demodir}/nodetask2.log &
nohup node ${demodir}/nodetask.js testnode3 testnode3-key.json ~/.aos.json >${demodir}/nodetask3.log &
sleep 1

# 3. seller upload data
dataId=$(node ${demodir}/sellerupload.js ~/.aos.json | grep DATAID | awk -F= 'DATAID=$1 {print $2}')
