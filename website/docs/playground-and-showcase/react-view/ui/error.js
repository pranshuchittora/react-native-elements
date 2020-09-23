/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import * as React from 'react';
import Popover from '@miksu/react-tiny-popover';
import { formatBabelError, frameError, getStyles } from '../utils';
const PopupError = ({ enabled, children, }) => {
    if (!enabled)
        return React.createElement(React.Fragment, null, children);
    return (React.createElement(Popover, { isOpen: enabled, position: 'bottom', content: React.createElement("div", null, children) },
        React.createElement("div", null)));
};
const Error = ({ msg, code, isPopup, className }) => {
    if (msg === null)
        return null;
    return (React.createElement(PopupError, { enabled: Boolean(isPopup) },
        React.createElement("div", Object.assign({}, getStyles({
            borderRadius: '5px',
            backgroundColor: '#892C21',
            whiteSpace: 'pre',
            fontSize: '11px',
            fontFamily: `Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace`,
            color: '#FFF',
            padding: '16px',
            margin: `${isPopup ? 4 : 8}px 0px`,
            overflowX: 'scroll',
        }, className)), code ? frameError(msg, code) : formatBabelError(msg))));
};
export default Error;
//# sourceMappingURL=error.js.map