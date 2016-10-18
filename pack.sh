#!/bin/bash

set -e

mv node_modules node_modules_all
npm install --production
zip -r resetNetworks.zip index.js package.json env.json node_modules
rm -rf node_modules
mv node_modules_all node_modules
