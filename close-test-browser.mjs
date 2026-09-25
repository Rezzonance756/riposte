// Close only the separate browser listening on the verification port.
const response = await fetch('http://127.0.0.1:9223/json/version').catch(() => null);
if (!response) {
  console.log('The separate verification browser is already closed.');
} else {
  const info = await response.json();
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  const closed = new Promise(resolve => { ws.onclose = resolve; });
  ws.send(JSON.stringify({id:1,method:'Browser.close'}));
  await closed;
  console.log('Closed the separate verification browser.');
}
