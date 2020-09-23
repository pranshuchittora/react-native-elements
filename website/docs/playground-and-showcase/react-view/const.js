/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
export var Action;
(function (Action) {
    Action[Action["Update"] = 0] = "Update";
    Action[Action["UpdateCode"] = 1] = "UpdateCode";
    Action[Action["UpdateCodeAndProvider"] = 2] = "UpdateCodeAndProvider";
    Action[Action["UpdatePropsAndCodeNoRecompile"] = 3] = "UpdatePropsAndCodeNoRecompile";
    Action[Action["UpdatePropsAndCode"] = 4] = "UpdatePropsAndCode";
    Action[Action["UpdateProps"] = 5] = "UpdateProps";
    Action[Action["Reset"] = 6] = "Reset";
})(Action || (Action = {}));
export var PropTypes;
(function (PropTypes) {
    PropTypes["String"] = "string";
    PropTypes["ReactNode"] = "react node";
    PropTypes["Boolean"] = "boolean";
    PropTypes["Number"] = "number";
    PropTypes["Enum"] = "enum";
    PropTypes["Array"] = "array";
    PropTypes["Object"] = "object";
    PropTypes["Function"] = "function";
    PropTypes["Ref"] = "ref";
    PropTypes["Date"] = "date";
    PropTypes["Custom"] = "custom";
})(PropTypes || (PropTypes = {}));
//# sourceMappingURL=const.js.map