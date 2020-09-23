/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import * as React from 'react';
import { useView, Compiler, Knobs, Editor, Error, ActionButtons, Placeholder, } from '../index';
import { getStyles } from '../utils';
const View = args => {
    const params = useView(args);
    return (React.createElement("div", Object.assign({}, getStyles({ maxWidth: '600px' }, args.className)),
        React.createElement(Compiler, Object.assign({}, params.compilerProps, { minHeight: 62, placeholder: Placeholder })),
        React.createElement(Error, { msg: params.errorProps.msg, isPopup: true }),
        React.createElement(Knobs, Object.assign({}, params.knobProps)),
        React.createElement(Editor, Object.assign({}, params.editorProps, { "data-testid": "rv-editor" })),
        React.createElement(Error, Object.assign({}, params.errorProps)),
        React.createElement(ActionButtons, Object.assign({}, params.actions))));
};
export default View;
//# sourceMappingURL=view.js.map