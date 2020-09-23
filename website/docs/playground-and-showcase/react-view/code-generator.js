var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import template from '@babel/template';
import * as t from '@babel/types';
import { clone } from './utils';
import { PropTypes } from './const';
import { parse } from './ast';
// forked prettier on a diet
//@ts-ignore
import prettier from '@miksu/prettier/lib/standalone';
//@ts-ignore
import parsers from '@miksu/prettier/lib/language-js/parser-babylon';
const reactImport = template.ast(`import * as React from 'react';`);
export const getAstPropValue = (prop, name, customProps) => {
    const value = prop.value;
    switch (prop.type) {
        case PropTypes.String:
            return t.stringLiteral(String(value));
        case PropTypes.Boolean:
            return t.booleanLiteral(Boolean(value));
        case PropTypes.Enum:
            if (!value) {
                return t.identifier(String(value));
            }
            if (!prop.imports) {
                return t.stringLiteral(String(value));
            }
            const [object, property] = String(value).split('.');
            return t.memberExpression(t.identifier(object), property.includes('-')
                ? t.stringLiteral(property)
                : t.identifier(property), property.includes('-') ? true : false);
        case PropTypes.Date:
            return t.newExpression(t.identifier('Date'), value ? [t.stringLiteral(String(value))] : []);
        case PropTypes.Ref:
            return null;
        case PropTypes.Object:
            // need to add this bogus assignment so the value is recognized as an ObjectExpression
            return template.ast(`a = ${value}`, { plugins: ['jsx'] })
                .expression.right;
        case PropTypes.Array:
        case PropTypes.Number:
        case PropTypes.Function:
        case PropTypes.ReactNode:
            const output = template.ast(String(value), { plugins: ['jsx'] })
                .expression;
            // we never expect that user would input a variable as the value
            // treat it as a string instead
            if (output.type === 'Identifier') {
                return t.stringLiteral(output.name);
            }
            return output;
        case PropTypes.Custom:
            if (!customProps[name] || !customProps[name].generate) {
                console.error(`Missing customProps.${name}.generate definition.`);
            }
            return customProps[name].generate(value);
    }
};
export const getAstPropsArray = (props, customProps) => {
    return Object.entries(props).map(([name, prop]) => {
        const { value, stateful, defaultValue } = prop;
        if (stateful)
            return t.jsxAttribute(t.jsxIdentifier(name), t.jsxExpressionContainer(t.identifier(name)));
        // When the `defaultValue` is set and `value` is the same as the `defaultValue`
        // we don't add it to the list of props.
        // It handles boolean props where `defaultValue` set to true,
        // and enum props that have a `defaultValue` set to be displayed
        // in the view correctly (checked checkboxes and selected default value in radio groups)
        // and not rendered in the component's props.
        if ((typeof value !== 'boolean' && !value) ||
            value === defaultValue ||
            (typeof value === 'boolean' && !value && !defaultValue)) {
            return null;
        }
        const astValue = getAstPropValue(prop, name, customProps);
        if (!astValue)
            return null;
        // shortcut render "isDisabled" vs "isDisabled={true}"
        if (astValue.type === 'BooleanLiteral' && astValue.value === true) {
            return t.jsxAttribute(t.jsxIdentifier(name), null);
        }
        return t.jsxAttribute(t.jsxIdentifier(name), astValue.type === 'StringLiteral'
            ? astValue
            : t.jsxExpressionContainer(astValue));
    });
};
export const getAstReactHooks = (props, customProps) => {
    const hooks = [];
    const buildReactHook = template(`const [%%name%%, %%setName%%] = React.useState(%%value%%);`);
    Object.keys(props).forEach(name => {
        if (props[name].stateful === true) {
            hooks.push(buildReactHook({
                name: t.identifier(name),
                setName: t.identifier(`set${name[0].toUpperCase() + name.slice(1)}`),
                value: getAstPropValue(props[name], name, customProps),
            }));
        }
    });
    return hooks;
};
export const getAstImport = (identifiers, source, defaultIdentifier) => {
    return t.importDeclaration([
        ...(defaultIdentifier
            ? [t.importDefaultSpecifier(t.identifier(defaultIdentifier))]
            : []),
        ...identifiers.map(identifier => t.importSpecifier(t.identifier(identifier), t.identifier(identifier))),
    ], t.stringLiteral(source));
};
export const getAstJsxElement = (name, attrs, children) => {
    const isSelfClosing = children.length === 0;
    return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(name), attrs.filter(attr => !!attr), isSelfClosing), isSelfClosing ? null : t.jsxClosingElement(t.jsxIdentifier(name)), children, true);
};
export const addToImportList = (importList, imports) => {
    for (const [importFrom, importNames] of Object.entries(imports)) {
        if (!importList.hasOwnProperty(importFrom)) {
            importList[importFrom] = {
                named: [],
                default: '',
            };
        }
        if (importNames.default) {
            importList[importFrom].default = importNames.default;
        }
        if (importNames.named && importNames.named.length > 0) {
            if (!importList[importFrom].hasOwnProperty('named')) {
                importList[importFrom]['named'] = [];
            }
            importList[importFrom].named = [
                ...new Set(importList[importFrom].named.concat(importNames.named)),
            ];
        }
    }
};
export const getAstImports = (importsConfig, providerImports, props) => {
    // global scoped import that are always displayed
    const importList = clone(importsConfig);
    // prop level imports (typically enums related) that are displayed
    // only when the prop is being used
    Object.values(props).forEach(prop => {
        if (prop.imports &&
            prop.value &&
            prop.value !== '' &&
            prop.value !== prop.defaultValue) {
            addToImportList(importList, prop.imports);
        }
    });
    addToImportList(importList, providerImports);
    return Object.keys(importList).map(from => getAstImport(importList[from].named || [], from, importList[from].default));
};
const getChildrenAst = (value) => {
    return template.ast(`<>${value}</>`, {
        plugins: ['jsx'],
    }).expression.children;
};
export const getAst = (props, componentName, provider, providerValue, importsConfig, customProps) => {
    const { children } = props, restProps = __rest(props, ["children"]);
    const buildExport = template(`export default () => {%%body%%}`);
    return t.file(t.program([
        reactImport,
        ...getAstImports(importsConfig, providerValue ? provider.imports : {}, props),
        buildExport({
            body: [
                ...getAstReactHooks(restProps, customProps),
                t.returnStatement(provider.generate(providerValue, getAstJsxElement(componentName, getAstPropsArray(restProps, customProps), children && children.value
                    ? getChildrenAst(String(children.value))
                    : []))),
            ],
        }),
    ]), [], []);
};
export const formatAstAndPrint = (ast, printWidth) => {
    const result = prettier.__debug.formatAST(ast, {
        originalText: '',
        parser: 'babel',
        printWidth: printWidth ? printWidth : 58,
        plugins: [parsers],
    });
    return (result.formatted
        // add a new line before export
        .replace('export default', `${result.formatted.startsWith('import ') ? '\n' : ''}export default`)
        // remove newline at the end of file
        .replace(/[\r\n]+$/, '')
        // remove ; at the end of file
        .replace(/[;]+$/, ''));
};
export const formatCode = (code) => {
    return formatAstAndPrint(parse(code));
};
export const getCode = ({ props, componentName, provider, providerValue, importsConfig, customProps, }) => {
    if (Object.keys(props).length === 0) {
        return '';
    }
    const ast = getAst(props, componentName, provider, providerValue, importsConfig, customProps);
    return formatAstAndPrint(ast);
};
//# sourceMappingURL=code-generator.js.map