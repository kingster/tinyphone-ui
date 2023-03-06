import {
    APP_RUNNING,
    CALL_STATUS,
    DIAL_SUCCESS,
    HANGUP,
    HANGUP_ALL,
    HOLD,
    LOADER,
    LOGIN_SUCCESS,
    LOGOUT,
    SET_ACCOUNTS,
    UNHOLD,
    WS_EVENT,
    DTMF_SENT
} from './constant';
import {SoftphoneState} from './Enum.ts'
import {toast} from 'react-toastify';
import axios from 'axios';
import {DtmfPlayer} from 'play-dtmf';
axios.defaults.withCredentials = false

const URL = "http://localhost:6060";


export function loginSync(payload){
    return dispatch => {
        dispatch({type: LOADER,state: true})
        return axios({
            url:`${URL}/login?sync`,
            method: "POST",
            data: JSON.stringify(payload)
        }).then(res => {
            const { data } = res;
            dispatch({type: LOGIN_SUCCESS, data })
            dispatch(getAccounts())
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}


export function dial(party){
    return dispatch => {
        dispatch({type: LOADER,state: true});
        return axios({
            url:`${URL}/dial`,
            method: "POST",
            data: { 
                "uri" : party
            }
        }).then(res => {
            const { data } = res;
            dispatch({type: DIAL_SUCCESS, data});
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}


export function dtmf(callId, chars){
    return dispatch => {
        // dispatch({type: LOADER,state: true});
        let dtmfPlayer = new DtmfPlayer();
        dtmfPlayer.play(chars);
        setTimeout(() => {
            dtmfPlayer.stop();
            dtmfPlayer.close();
        }, 500);
        return axios({
            url:`${URL}/calls/${callId}/dtmf/${chars}`,
            method: "POST",
            data: null
        }).then(res => {
            const { data } = res;
            dispatch({type: DTMF_SENT, data});
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}

export function hangUp(callId, isConsultCall){
    return dispatch => {
        dispatch({type: LOADER,state: true});
        return axios({
            url:`${URL}/calls/${callId}/hangup`,
            method: "POST",
            data: ""
        }).then(res => {
            dispatch(callStatus());
            const { data } = res;
            dispatch({type: HANGUP, data, isConsultCall})
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}

export function hangUpAll(){
    return dispatch => {
        dispatch({type: LOADER,state: true});
        return axios({
            url:`${URL}/hangup_all`,
            method: "POST",
            data: ""
        }).then(res => {
            const { data } = res;
            dispatch({type: HANGUP_ALL, data })
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}

export function callStatus(){
    return dispatch => {
        dispatch({type: LOADER,state: true});
        return axios.get(`${URL}/calls`, {timeout: 2000}).then(res => {
            const { data } = res;
            const { calls } = data;
            dispatch({
                type:CALL_STATUS,
                calls
            });
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}

export function updateCallStatus(event) {
    return dispatch => {
        dispatch({
            type:WS_EVENT,
            event
        });
    }
}


export function hold(callId){
    return dispatch => {
        dispatch({type: LOADER,state: true});
        return axios.put(`${URL}/calls/${callId}/hold`).then(res => {
            const { data } = res;
            dispatch({type: HOLD, data })
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}

export function unHold(callId){
    return dispatch => {
        dispatch({type: LOADER,state: true});
        return axios.delete(`${URL}/calls/${callId}/hold`).then(res => {
            const { data } = res;
            dispatch({type: UNHOLD, data })
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}

export function getSoftphoneStatus(){
    return async dispatch => {
        dispatch({type: LOADER,state: true})
        return axios.get(`${URL}/accounts`, {timeout: 5000}).then(res => {
            const { data } = res;
            const { accounts } = data
            dispatch({
                type:APP_RUNNING,
                accounts
            })
            //dispatch(hangUpAll())
            dispatch(callStatus());
        }).catch(e => {
            console.log("softphone not running")
            dispatch({type: LOADER,state: false , clientState: SoftphoneState.NotRunning})
        });
    }
}


export function getAccounts(){
    return async dispatch => {
        dispatch({type: LOADER,state: true})
        return axios.get(`${URL}/accounts`).then(res => {
            const { data } = res;
            const { accounts, message } = data
            dispatch({
                type:SET_ACCOUNTS,
                accounts,
                message
            })
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}

export function logout(){
    return async dispatch => {
        dispatch({type: LOADER,state: true})
        return axios.post(`${URL}/logout`).then(res => {
            dispatch({
                type:LOGOUT
            })
        }).catch(e => {
            const { response = {} } = e;
            const { data = {} } = response;
            data.message ? toast.error(data.message) : toast.error(e.message);
            dispatch({type: LOADER,state: false})
        });
    }
}
