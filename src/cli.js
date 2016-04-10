#!/usr/bin/env node

const currentDir = __dirname;

const spm = require('./index.js');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

spm(argv._.map((passedPath => (path.join(process.cwd(), passedPath)))), path.join(process.cwd(), argv.d));
