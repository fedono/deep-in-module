var map = {
    './moduleA': moduleA
}

function require(id) {
    var moduleFunc = map[id];
    var exportModule = {exports: {}};
    moduleFunc(exportModule);
    return exportModule.exports;
}

// moduleA.js
function moduleA(module) {
    module.exports = new Date().getTime();
}

// index.js
var a = require('./moduleA');
console.log(a);