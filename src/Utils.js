import moment from "moment";

export const formattedDuration = (seconds) => {
    if (seconds >= 0 && seconds < 3600) {
        return moment.utc(seconds * 1000).format('mm:ss')
    } else if (seconds >= 3600)
        return moment.utc(seconds * 1000).format('HH:mm:ss');
    else return '--:--'
};

export const formattedCallerId = (call, domain) => {
    let callerId = call != null ? call.callerId : '';
    return callerId.replace(domain, '');
};