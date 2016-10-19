#!/bin/bash

set -e

mv node_modules node_modules_all
npm install --production
mv index.js _src_index.js
./node_modules_all/.bin/babel _src_index.js -o index.js
zip -r resetNetworks.zip index.js package.json env.json node_modules
mv _src_index.js index.js
rm -rf node_modules
mv node_modules_all node_modules
