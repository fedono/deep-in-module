/*
* 封装一个打包的工具
*
* */
const path = require('path');
const fs = require('fs');

const root = path.dirname(require.main.paths[0]);
// 有时候使用 require 会加上.js后缀，有的不加，所以这里做一下兼容
const getFilePath = (modulePath) => [modulePath, `${modulePath}.js`].find(fs.existsSync);
const funcWrapper = [
    'function (require, module, exports) {',
    '}'
];
const absolutePathToModuleStr = {};
const requireIdToModule = {};
// 给每个文件加上这个，map 就是所有文件路径与内容的映射，然后在文件中使用 require 某个文件的路径就能获取到内容
// 定义一个 require 函数，从全局的文件路径与文件内容的映射中，通过路径获取到对应文件的内容
const template = `
    var map = @@map;
    function require(id) {
        var moduleFunc = map[id];
        var exportModule = {exports: {}};
        moduleFunc(exportModule);
        return exportModule.exports;
    }
`

const main = function (id, isFirstComponent) {
    const pathToModule = getFilePath(path.resolve(root, id));
    const content = fs.readFileSync(pathToModule, 'utf-8');
    const modulePathMatcher = /require\(["'`](.+?)["'`]\)/g;
    const moduleContent = fs.readFileSync(pathToModule, 'utf-8');
    let match = null;
    // 通过正则来匹配到文件中是否有 require
    while (match = modulePathMatcher.exec(content)) {
        const [, modulePath] = match;
        const childPath = getFilePath(path.resolve(path.dirname(pathToModule), modulePath));
        if (requireIdToModule[modulePath]) {
            continue;
        }
        // 当前文件中还有 require，递归来找到所有的 require 的文件
        main(childPath, false);
        
        const childModuleStr = absolutePathToModuleStr[childPath];
        requireIdToModule[modulePath] = childModuleStr;
    }
    // 封装一下每个文件，加上 require, module, exports 这些参数
    const funcStr = `${funcWrapper[0]}\n${moduleContent}\n${funcWrapper[1]}`;
    absolutePathToModuleStr[pathToModule] = funcStr;
    // 将所有的文件映射放到每个文件中，那么每个文件就可以通过 require 来找到所需文件中的内容
    const tpl = template.replace('@@map', JSON.stringify(requireIdToModule));
    if (!isFirstComponent) return tpl;
    // 如果是入口文件，还需要执行一下
    return `${tpl}; (function(){
        ${funcStr}()
    })();`
}

module.exports = main;