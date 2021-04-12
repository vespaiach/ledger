/**
 *
 * Ledger Web App Source Code.
 *
 * @license MIT
 * @copyright Toan Nguyen <nta.toan@gmail.com>
 *
 */

import { BUSY, CLEAR_MESSAGE, IDLE, SHOW_MESSAGE } from '../../actions/system';
import { Action, AppBusyCode, AppMessageCode, WholeAppState } from '../../types.d';
import { createReducer } from '../../utils/reducer';

const defaultState: WholeAppState = {
    retainedAction: null,
    showSigninDialog: false,
    messageCode: null,
    busyCode: AppBusyCode.Idle,
};

export default createReducer<WholeAppState>(defaultState, {
    [SHOW_MESSAGE]: (state, { payload }: Action<string, AppMessageCode>) => {
        if (payload) {
            return {
                ...state,
                messageCode: payload,
            };
        }
        return state;
    },

    [CLEAR_MESSAGE]: (state) => ({
        ...state,
        messageCode: null,
    }),

    [BUSY]: (state, { payload }: Action<string, AppBusyCode>) => {
        if (payload) {
            return {
                ...state,
                busyCode: payload,
            };
        }
        return state;
    },

    [IDLE]: (state) => ({
        ...state,
        busyCode: AppBusyCode.Idle,
    }),
});
