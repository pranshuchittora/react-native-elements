/*
Copyright (c) 2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import * as React from 'react';
import { getStyles } from '../utils';
export const ActionButton = props => React.createElement("button", Object.assign({ className: "react-view-button" }, props));
export const ActionButtons = ({ formatCode, copyCode, copyUrl, reset, className }) => (React.createElement(React.Fragment, null,
    React.createElement("style", { dangerouslySetInnerHTML: {
            __html: `
    .react-view-button {
      font-size: 14px;
      font-family: 'Helvetica Neue', Arial;
      padding: 8px;
      margin: 0px;
      border-radius: 5px;
      border: 1px solid #CCC;
      background-color: #FFF;
      color: #000;
    }

    .react-view-button:hover {
      background-color: #EEE;
      color: #000;
    }

    .react-view-button:active {
      border-color: #276EF1;
      color: #000;
    }
  `,
        } }),
    React.createElement("div", Object.assign({}, getStyles({ margin: '10px 0px' }, className)),
        React.createElement(ActionButton, { "data-testid": "rv-format", style: { marginRight: '8px' }, onClick: formatCode }, "Format code"),
        React.createElement(ActionButton, { "data-testid": "rv-copy-code", style: { marginRight: '8px' }, onClick: copyCode }, "Copy code"),
        React.createElement(ActionButton, { "data-testid": "rv-copy-url", style: { marginRight: '8px' }, onClick: copyUrl }, "Copy URL"),
        React.createElement(ActionButton, { "data-testid": "rv-reset", style: { marginRight: '8px' }, onClick: reset }, "Reset"))));
//# sourceMappingURL=action-buttons.js.map