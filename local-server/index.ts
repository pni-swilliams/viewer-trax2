import { NstrumentaServer } from 'nstrumenta/dist/nodejs/server';
import { NstrumentaClient } from 'nstrumenta/dist/nodejs/client';
import { DEFAULT_HOST_PORT } from 'nstrumenta/dist/shared';
import ws from 'ws';

const wsUrl = 'ws://localhost:8088';
const apiKey = 'test-key';

const nstClient = new NstrumentaClient();
nstClient.addListener('open', () => {
  console.log('opened');
})
nstClient.addListener('close', () => {
  console.log('closed');
})
const nstServer = new NstrumentaServer({
  apiKey,
  port: DEFAULT_HOST_PORT,
  noBackplane: true,
  allowUnverifiedConnection: true,
});

nstServer.run().then(() => {
  nstClient.connect({
    nodeWebSocket: ws,
    wsUrl,
    apiKey,
    verify: false,
  });
});
