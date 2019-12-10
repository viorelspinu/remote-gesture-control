window.subscribers = {};

function publish(event, data) {

    if (!window.subscribers[event]) return;
    window.subscribers[event].forEach(subscriberCallback =>
        subscriberCallback(data));
}

function subscribe(event, callback) {
    if (!window.subscribers[event]) {
        window.subscribers[event] = [];
    }
    window.subscribers[event].push(callback);
}

export { publish, subscribe }