import { Action } from './const';
import { assertUnreachable, buildPropsObj } from './utils';
export default function reducer(state, action) {
    switch (action.type) {
        case Action.UpdateCode:
            return Object.assign(Object.assign({}, state), { code: action.payload, codeNoRecompile: '' });
        case Action.UpdateCodeAndProvider:
            return Object.assign(Object.assign({}, state), { code: action.payload.code, providerValue: action.payload.providerValue, codeNoRecompile: '' });
        case Action.Update:
            return Object.assign(Object.assign({}, state), { code: action.payload.code, providerValue: action.payload.providerValue, codeNoRecompile: '', props: buildPropsObj(state.props, action.payload.updatedPropValues) });
        case Action.UpdatePropsAndCodeNoRecompile:
            return Object.assign(Object.assign({}, state), { codeNoRecompile: action.payload.codeNoRecompile, props: buildPropsObj(state.props, action.payload.updatedPropValues) });
        case Action.UpdateProps:
            return Object.assign(Object.assign({}, state), { codeNoRecompile: '', props: buildPropsObj(state.props, action.payload) });
        case Action.UpdatePropsAndCode:
            return Object.assign(Object.assign({}, state), { code: action.payload.code, codeNoRecompile: '', props: buildPropsObj(state.props, action.payload.updatedPropValues) });
        case Action.Reset:
            return Object.assign(Object.assign({}, state), { code: action.payload.code, codeNoRecompile: '', props: action.payload.props, providerValue: action.payload.providerValue });
        default:
            return assertUnreachable();
    }
}
//# sourceMappingURL=reducer.js.map