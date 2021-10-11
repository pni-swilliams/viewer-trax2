var nstrumenta;

function initNstrumenta() {
  console.log('initNstrumenta');
  nstrumenta = new Nstrumenta.SandboxClient();

  console.log('subscribing to channel server-status');
  nstrumenta.subscribe('server-status', (channelMessage) => {
    console.log('sandbox index.js subscribe', channelMessage);
    const { message } = channelMessage;
    document.getElementById('server-status').innerText = message;
  });
}

function send() {
  const channel = document.getElementById('channel').value;
  const message = document.getElementById('message').value;

  nstrumenta.send(channel, message);
}

const receivedMessages = [];
function subscribe() {
  const channel = document.getElementById('subscribeChannel').value;
  nstrumenta.subscribe(channel, (channelMessage) => {
    receivedMessages.push(JSON.stringify(channelMessage));
    document.getElementById('outputTextArea').value = receivedMessages.slice(-100).join('\n');
  });
}
