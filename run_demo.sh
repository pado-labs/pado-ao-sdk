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
