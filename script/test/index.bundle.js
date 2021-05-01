
    var map = {"./moduleA":"function (require, module, exports) {\nmodule.exports = function () {\n    return new Date().getTime();\n}\n}"};
    function require(id) {
        var moduleFunc = map[id];
        var exportModule = {exports: {}};
        moduleFunc(exportModule);
        return exportModule.exports;
    }
