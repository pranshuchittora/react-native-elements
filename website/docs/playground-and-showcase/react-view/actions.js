/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { parseCode } from './ast';
import { Action, PropTypes } from './const';
export const updateCode = (dispatch, newCode) => {
    dispatch({
        type: Action.UpdateCode,
        payload: newCode,
    });
};
export const updateCodeAndProvider = (dispatch, newCode, providerValue) => {
    dispatch({
        type: Action.UpdateCodeAndProvider,
        payload: {
            code: newCode,
            providerValue,
        },
    });
};
export const updateAll = (dispatch, newCode, componentName, propsConfig, parseProvider, customProps) => {
    const propValues = {};
    const { parsedProps, parsedProvider } = parseCode(newCode, componentName, parseProvider);
    Object.keys(propsConfig).forEach(name => {
        propValues[name] = propsConfig[name].value;
        if (customProps && customProps[name] && customProps[name].parse) {
            // custom prop parser
            propValues[name] = customProps[name].parse(parsedProps[name], propsConfig);
        }
        else if (propsConfig[name].type === PropTypes.Date) {
            const match = parsedProps[name].match(/^new\s*Date\(\s*"([0-9-T:.Z]+)"\s*\)$/);
            if (match) {
                propValues[name] = match[1];
            }
            else {
                propValues[name] = parsedProps[name];
            }
        }
        else {
            propValues[name] = parsedProps[name];
        }
    });
    dispatch({
        type: Action.Update,
        payload: {
            code: newCode,
            updatedPropValues: propValues,
            providerValue: parsedProvider,
        },
    });
};
export const updatePropsAndCodeNoRecompile = (dispatch, newCode, propName, propValue) => {
    dispatch({
        type: Action.UpdatePropsAndCodeNoRecompile,
        payload: {
            codeNoRecompile: newCode,
            updatedPropValues: { [propName]: propValue },
        },
    });
};
export const updatePropsAndCode = (dispatch, newCode, propName, propValue) => {
    dispatch({
        type: Action.UpdatePropsAndCode,
        payload: {
            code: newCode,
            updatedPropValues: { [propName]: propValue },
        },
    });
};
export const updateProps = (dispatch, propName, propValue) => {
    dispatch({
        type: Action.UpdateProps,
        payload: { [propName]: propValue },
    });
};
export const reset = (dispatch, initialCode, providerValue, propsConfig) => {
    dispatch({
        type: Action.Reset,
        payload: {
            code: initialCode,
            props: propsConfig,
            providerValue,
        },
    });
};
//# sourceMappingURL=actions.js.map