const currentUrl = window.location.href;
const currentURLbase = window.location.protocol + "//" + window.location.host;
const currentURLsub = currentUrl.replace(currentURLbase, "");
function connectWebSocket() {
    const wss = new WebSocket('wss://localhost:8181/howtosavealife?');
    wss.onopen = function () {
        wss.send('ok ko e?');
    };
    wss.onmessage = (event) => {
        if (event.data === 'reload') { window.location.reload(); }
    };


    wss.onclose = function (event) {
        if (!currentURLsub.startsWith(currentURLsub)) {
            console.log('Reconnect');
            // Khi bị mất kết nối, ta sẽ gọi hàm reconnect sau khoảng thời gian xác định
            setTimeout(connectWebSocket, 15000);
        }
    }
}
connectWebSocket();