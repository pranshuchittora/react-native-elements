/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { parse as babelParse } from '@babel/parser';
import { getAstJsxElement, formatAstAndPrint } from './code-generator';
export const parse = (code) => babelParse(code, {
    sourceType: 'module',
    plugins: [
        'jsx',
        'flowComments',
        'typescript',
        'asyncGenerators',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        [
            'decorators',
            {
                decoratorsBeforeExport: true,
            },
        ],
        'doExpressions',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'functionBind',
        'functionSent',
        'importMeta',
        'logicalAssignment',
        'nullishCoalescingOperator',
        'numericSeparator',
        'objectRestSpread',
        'optionalCatchBinding',
        'optionalChaining',
        'partialApplication',
        'throwExpressions',
        'topLevelAwait',
    ],
});
// creates a call expression that synchronizes view state
const getInstrumentOnChange = (what, into) => t.callExpression(t.identifier('__reactViewOnChange'), [
    t.identifier(what),
    t.stringLiteral(into),
]);
// appends a call expression to a function body
const fnBodyAppend = (path, callExpression) => {
    if (path.node.type !== 'JSXExpressionContainer') {
        return;
    }
    const callbackBody = path.get('expression').get('body');
    if (callbackBody.type === 'BlockStatement') {
        // when the callback body is a block
        // e.g.: e => { setValue(e.target.value) }
        callbackBody.pushContainer('body', callExpression);
    }
    else {
        // when it is a single statement like e => setValue(e.target.value)
        // we have to create a BlockStatement first
        callbackBody.replaceWith(t.blockStatement([
            t.expressionStatement(callbackBody.node),
            t.expressionStatement(callExpression),
        ]));
    }
};
// removing all imports, exports and top level
// variable declaration, add __reactViewOnChange instrumentation when needed
export const transformBeforeCompilation = (ast, elementName, propsConfig) => {
    try {
        traverse(ast, {
            VariableDeclaration(path) {
                if (path.parent.type === 'Program') {
                    //@ts-ignore
                    path.replaceWith(path.node.declarations[0].init);
                }
            },
            ImportDeclaration(path) {
                path.remove();
            },
            ExportDefaultDeclaration(path) {
                if (path.node.declaration.type === 'ArrowFunctionExpression' ||
                    path.node.declaration.type === 'FunctionDeclaration') {
                    path.replaceWith(path.node.declaration);
                }
                else {
                    path.remove();
                }
            },
            // adds internal state instrumentation through __reactViewOnChange callback
            JSXElement(path) {
                if (path.node.openingElement.type === 'JSXOpeningElement' &&
                    //@ts-ignore
                    path.node.openingElement.name.name === elementName) {
                    if (propsConfig['children'] && propsConfig['children'].propHook) {
                        const propHook = propsConfig['children'].propHook;
                        path.get('children').forEach(child => {
                            typeof propHook === 'object'
                                ? fnBodyAppend(child, getInstrumentOnChange(propHook.what, propHook.into))
                                : child.traverse(propHook({ getInstrumentOnChange, fnBodyAppend }));
                        });
                    }
                    path
                        .get('openingElement')
                        .get('attributes')
                        .forEach(attr => {
                        const name = attr.get('name').node.name;
                        const propHook = propsConfig[name].propHook;
                        if (typeof propHook !== 'undefined') {
                            typeof propHook === 'object'
                                ? fnBodyAppend(attr.get('value'), getInstrumentOnChange(propHook.what, propHook.into))
                                : attr.traverse(propHook({ getInstrumentOnChange, fnBodyAppend }));
                        }
                    });
                }
            },
        });
    }
    catch (e) { }
    return ast;
};
export function parseCode(code, elementName, parseProvider) {
    const propValues = {};
    const stateValues = {};
    let parsedProvider = undefined;
    try {
        const ast = parse(code);
        traverse(ast, {
            JSXElement(path) {
                if (Object.keys(propValues).length === 0 && // process just the first element
                    path.node.openingElement.type === 'JSXOpeningElement' &&
                    //@ts-ignore
                    path.node.openingElement.name.name === elementName) {
                    path.node.openingElement.attributes.forEach((attr) => {
                        const name = attr.name.name;
                        let value = null;
                        if (attr.value === null) {
                            //boolean prop without value
                            value = true;
                        }
                        else {
                            if (attr.value.type === 'StringLiteral') {
                                value = attr.value.value;
                            }
                            else if (attr.value.type === 'JSXExpressionContainer') {
                                if (attr.value.expression.type === 'BooleanLiteral') {
                                    value = attr.value.expression.value;
                                }
                                else {
                                    value = formatAstAndPrint(
                                    //@ts-ignore
                                    t.program([t.expressionStatement(attr.value.expression)]), 30);
                                    if (attr.value.expression.type === 'ObjectExpression') {
                                        // the generated code is ({ .... }), this removes the brackets to
                                        // keep the input more readable
                                        value = value.slice(1, -1);
                                    }
                                    if (attr.value.expression.type === 'MemberExpression' &&
                                        attr.value.expression.computed) {
                                        // turn a['hello-world'] into a.hello-world so we don't have to deal with two
                                        // variants in the enum knob UI
                                        value = `${attr.value.expression.object.name}.${attr.value.expression.property.value}`;
                                    }
                                }
                            }
                        }
                        propValues[name] = value;
                    });
                    propValues['children'] = formatAstAndPrint(getAstJsxElement('ViewRoot', [], path.node.children), 30)
                        .replace(/\n  /g, '\n')
                        .replace(/^<ViewRoot>\n?/, '')
                        .replace(/<\/ViewRoot>$/, '')
                        .replace(/\s*<ViewRoot \/>\s*/, '');
                }
            },
            VariableDeclarator(path) {
                // looking for React.useState()
                const node = path.node;
                if (node.id.type === 'ArrayPattern' &&
                    node.init.type === 'CallExpression' &&
                    node.init.callee.property.name === 'useState') {
                    const name = node.id.elements[0].name;
                    const valueNode = node.init.arguments[0];
                    if (valueNode.type === 'StringLiteral' ||
                        valueNode.type === 'BooleanLiteral') {
                        stateValues[name] = valueNode.value;
                    }
                    else {
                        stateValues[name] = generate(valueNode).code;
                    }
                }
            },
        });
        if (parseProvider) {
            parsedProvider = parseProvider(ast);
        }
    }
    catch (e) {
        throw new Error("Code is not valid and can't be parsed.");
    }
    // override props by local state (React hooks)
    Object.keys(stateValues).forEach(stateValueKey => {
        Object.keys(propValues).forEach(propValueKey => {
            if (propValues[propValueKey] === stateValueKey) {
                propValues[propValueKey] = stateValues[stateValueKey];
            }
        });
    });
    return { parsedProps: propValues, parsedProvider };
}
//# sourceMappingURL=ast.js.map