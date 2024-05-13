#!/bin/bash

set -ex
curdir=$(pwd)
distdir=${curdir}/dist

# build
npm run build


# 0. buyer keygen
node ${distdir}/keygen.js buyer
