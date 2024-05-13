#!/bin/bash

set -ex
curdir=$(pwd)
distdir=${curdir}/dist

# build
npm run build

# 0. seller upload data
arwalletpath="arweave-keyfile-xxxxx.json"
if [ ! -f "${arwalletpath}" ]; then
  echo "set your ar wallet file path"
  exit 1
fi
dataId=$(node ${distdir}/uploaddata.js ${arwalletpath} | grep DATAID | awk -F= 'DATAID=$1 {print $2}')

# 0. buyer keygen
node ${distdir}/keygen.js buyer