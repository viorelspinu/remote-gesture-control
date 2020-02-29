
const pubSub = require("./pubsub");

function log(text) {
    console.log(text);
}

function initSocket() {
    let port = location.port;
    port = 8181;

    var scheme = window.location.protocol == "https:" ? 'wss://' : 'ws://';
    var webSocketUri = scheme
        + window.location.hostname
        + (port ? ':' + port : '')
        + '/socket';

    window.websocket = new WebSocket(webSocketUri);

    websocket.onopen = function () {
        log('Connected');
    };

    websocket.onclose = function () {
        //window.location.reload();
        initSocket();
        log('Closed');
    };

    websocket.onmessage = function (e) {
        var text = e.data;

        log(text);

    };

    websocket.onerror = function (e) {
        log('Error (see console)');
        console.log(e);
    };


}

export function socketSend(data) {
    window.websocket.send(data);
}

$(function () {
    initSocket();
    pubSub.subscribe("SOCKET_SEND_EVENT", data => {
        socketSend(data);
    });
});
