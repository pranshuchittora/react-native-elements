/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import * as React from 'react';
import SimpleEditor from 'react-simple-code-editor';
import Highlight, { Prism } from 'prism-react-renderer';
import { useValueDebounce, lightTheme, } from '../index';
import { getStyles } from '../utils';
const highlightCode = ({ code, theme, transformToken, language, }) => (React.createElement(Highlight, { Prism: Prism, code: code, theme: theme, language: language || 'jsx' }, ({ tokens, getLineProps, getTokenProps }) => (React.createElement(React.Fragment, null, tokens.map((line, i) => (React.createElement("div", Object.assign({ key: i }, getLineProps({ line, key: i })), line.map((token, key) => {
    const tokenProps = getTokenProps({ token, key });
    if (transformToken) {
        return transformToken(tokenProps);
    }
    return React.createElement("span", Object.assign({ key: key }, tokenProps));
}))))))));
const Editor = ({ code: globalCode, transformToken, onChange, placeholder, language, theme, ['data-testid']: testid, className, }) => {
    const [focused, setFocused] = React.useState(false);
    const editorTheme = Object.assign(Object.assign({}, (theme || lightTheme)), { plain: Object.assign({ whiteSpace: 'break-spaces' }, (theme || lightTheme).plain) });
    const [code, setCode] = useValueDebounce(globalCode, onChange);
    return (React.createElement("div", Object.assign({ "data-testid": testid }, getStyles({
        boxSizing: 'border-box',
        paddingLeft: '4px',
        paddingRight: '4px',
        maxWidth: 'auto',
        overflow: 'hidden',
        border: focused ? '1px solid #276EF1' : '1px solid #CCC',
        borderRadius: '5px',
    }, className)),
        React.createElement("style", { dangerouslySetInnerHTML: {
                __html: `.npm__react-simple-code-editor__textarea { outline: none !important }`,
            } }),
        React.createElement(SimpleEditor, { value: code || '', placeholder: placeholder, highlight: code => highlightCode({ code, theme: editorTheme, transformToken, language }), onValueChange: code => setCode(code), onFocus: () => setFocused(true), onBlur: () => setFocused(false), padding: 8, style: editorTheme.plain })));
};
export default Editor;
//# sourceMappingURL=editor.js.map