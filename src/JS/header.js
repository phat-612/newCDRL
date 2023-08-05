const wss = new WebSocket('wss://localhost:8181/howtosavealife?');
wss.onmessage = (event) => {
    if (event.data === 'reload') { window.location.reload(); }
};

const currentUrl = window.location.href;
const currentURLbase = window.location.protocol + "//" + window.location.host;