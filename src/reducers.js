import {
    APP_RUNNING,
    CALL_STATUS,
    CALL_TERMINATE,
    DIAL_SUCCESS,
    HANGUP,
    HANGUP_ALL,
    HOLD,
    LOADER,
    LOGIN_SUCCESS,
    LOGOUT,
    SET_ACCOUNTS,
    UNHOLD,
    WS_EVENT
} from './constant';
import {SoftphoneState} from './Enum.ts';
import {toast} from 'react-toastify';

const intialState = {
    loggedIn: false,
    accounts: [],
    message: '',
    accountName: '',
    selectAccount: null,
    loading: false,
    clientState: SoftphoneState.Default,
    callDialed: false,
    calls:[],
};

export function AppReducer(state = intialState, action) {
    switch (action.type) {
        case APP_RUNNING: {
            const {accounts, message} = action;
            const selectAccount = Array.isArray(accounts) ? accounts.find((account, i) => i === 0) : state.selectAccount;
            const {name} = selectAccount || {}
            return Object.assign({}, state, {
                accounts,
                message,
                selectAccount,
                loggedIn: accounts.length > 0,
                accountName: name || '',
                loading: false,
                clientState: SoftphoneState.Running
            })
        }
        case LOGIN_SUCCESS: {
            const {data} = action;
            const {account_name} = data;
            return Object.assign({}, state, {
                loggedIn: true,
                accountName: account_name,
                loading: false,
                clientState: SoftphoneState.Running
            })
        }
        case SET_ACCOUNTS: {
            const {accounts, message} = action;
            const selectAccount = Array.isArray(accounts) ? accounts.find((account, i) => i === 0) : state.selectAccount;
            const {name, active, status} = selectAccount || {}
            if (!active) {
                toast.error(status)
            }
            return Object.assign({}, state, {
                accounts,
                message,
                selectAccount,
                loggedIn: accounts.length > 0,
                accountName: name || '',
                loading: false,
                clientState: SoftphoneState.Running
            })
        }
        case LOGOUT: {
            return Object.assign({}, state, {loggedIn: false, loading: false, clientState: SoftphoneState.Running})
        }
        case LOADER: {
            return Object.assign({}, state, {
                loading: action.state,
                clientState: action.clientState ? action.clientState : state.clientState
            })
        }
        case DIAL_SUCCESS: {
            const {data} = action;
            const {call_id, message} = data;
            return Object.assign({}, state, {
                message: message,
                callDialed: true,
                loading: false,
            })
           
        }
        case CALL_STATUS: {
            const {calls} = action;
            const isCallDialed = Array.isArray(calls) ? calls.length > 0 : false
            const CallstatusState = {}
            if (isCallDialed && state.customerCallId == null) { //Page was refresh restore the call states.
                if (calls.length === 1) {
                    const customerCall =  calls[0]
                    const {id} = Object.assign({},customerCall);
                    CallstatusState.customerCallId = id;
                    CallstatusState.customerCall = customerCall;
                } 
                else if ( calls.length == 2 ) {
                    const customerCall =  calls[0]
                    var {id} = Object.assign({},customerCall);
                    CallstatusState.customerCallId = id;
                    CallstatusState.customerCall = customerCall;

                    const consultCall =  calls[1]
                    var {id} = Object.assign({},consultCall);
                    CallstatusState.consultCallId = id;
                    CallstatusState.consultCall = consultCall;
                }
            }
            return Object.assign({}, state, { calls : calls, loading: false, callDialed: isCallDialed , ...CallstatusState})

        }
        case WS_EVENT: {
            // {"callerId":"+917829869145","displayName":"","id":1,"party":"sip:+917829869145@maa-ena.fktel.in","sid":"5pyVCNPZYNB9WZN2Jylp1hm.Qa.n792F","state":"DISCONNCTD","type":"CALL"}
            const {event} = action;
            const {data} = event;
            let calls = state.calls.slice()
            const edata = JSON.parse(data)
            console.log("Got WS Event", edata)

            if ( edata.type == "CALL") {
                const pos = calls.findIndex((call) => call.id ===  edata.id)
                if (pos < 0) {
                    calls.push(edata)
                } else {
                    calls[pos] = Object.assign({}, calls[pos], {state : edata.state});
                }
                return Object.assign({}, state, { calls : calls, loading: false})
            }
         }
        case HOLD: {
            const {data} = action;
            const {call_id} = Object.assign({},data);
            return Object.assign({}, state, {loading: false, callOnHold: true, callId: call_id})
        }
        case UNHOLD: {
            const {data} = action;
            const {call_id} = Object.assign({},data);
            return Object.assign({}, state, {loading: false, callOnHold: false, callId: call_id})
        }
        case HANGUP:
        case CALL_TERMINATE: {
            const {call_id} = action;
            const calls = state.calls;
            const pos = calls.findIndex((call) => call.id === call_id)
            if (pos >= 0){
                calls.splice(pos, 1);
            }                 
            return Object.assign({}, state, {loading: false, calls: calls, callDialed: state.calls.length > 1});

        }
        case HANGUP_ALL: {
            return Object.assign({}, state, {calls: [], callDialed: false, loading: false})
        }
        default:
            return state
    }
}
