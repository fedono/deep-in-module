const {existsSync, writeFileSync, readFileSync} = require('fs');
const {dirname, resolve, extname} = require('path');

const root = dirname(require.main.path[1]);

const funcWrapper = ['function (require, module, exports) {', '}'];
const getFilePath = modulePath => [modulePath, `${modulePath}.js`, `${modulePath}/index.js`].find(existsSync);

main(require(resolve(root, 'packer.config')));

function main(config) {

}

function deepTravel(fullPath, moduleList, moduleDepMapList, modulePathIdMap) {
    const modulePathMatcher = /require\(["'`](.+?)["'`]\)/g;
    const moduleText = readFileSync(getFilePath(fullPath), 'utf-8');
    const childModules = [];
    const moduleDepMap = {};
    let moduleContent = moduleText;
    let match = null;
    while ((match = modulePathMatcher.exec(moduleText)) !== null) {
        const [, modulePath] = match;
        const childModuleAbsolutePath = resolve(dirname(getFilePath(fullPath)), modulePath);
        if (modulePathIdMap.hasOwnProperty(childModuleAbsolutePath)) {
            moduleDepMap[modulePath] = modulePathIdMap[childModuleAbsolutePath];
            continue;
        }

        childModules.push(modulePath);
        deepTravel(childModuleAbsolutePath, moduleList, moduleDepMapList, modulePathIdMap);
        moduleDepMapList[modulePath] = modulePathIdMap[childModuleAbsolutePath];
    }

    const funcStr = `${funcWrapper[0]}\n${moduleContent}\n${funcWrapper[1]}`;
    cacheModule(moduleList, modulePathIdMap, funcStr, fullPath);
    moduleDepMapList.push(moduleDepMap);
}

function cacheModule(list, map, listVal, mapKey) {
    list.push(listVal);
    map[mapKey] = list.length - 1;
}