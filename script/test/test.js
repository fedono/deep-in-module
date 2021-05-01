const bundler = require('../src');
const fs = require('fs');
const path = require('path');

// const content = bundler(fs.readFileSync(path.resolve(__dirname, './index.js'), 'utf-8'));

// 这里通过执行 index 中的打包逻辑，然后将所有文件打包到 index.bundle.js 中
const content = bundler('./index.js');
fs.writeFileSync(path.resolve(__dirname, './index.bundle.js'), content, 'utf-8');