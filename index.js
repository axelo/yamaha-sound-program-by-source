const udp = require('dgram');
const server = udp.createSocket('udp4');
const http = require('http');

const YAMAHA_IP = process.env.YAMAHA_IP || '192.168.1.216';
const LOCAL_IP = process.env.LOCAL_IP || '192.168.1.187';
const INCOMING_EVENT_SERVER_PORT = parseInt(process.env.PORT) || 41100;

const inputSourceToSoundProgam = inputSource => {
  switch (inputSource) {
    case 'airplay':
    case 'spotify':
      return 'music';

    case 'tv':
    case 'bd_dvd':
      return 'tv_program';

    default:
      return undefined;
  }
};

const inputSourceShouldUseClearVoice = inputSource => {
  switch (inputSource) {
    case 'tv':
    case 'bd_dvd':
      return true;

    default:
      return false;
  }
};

const send = (path, headers) =>
  http
    .get(
      {
        localAddress: LOCAL_IP,
        host: YAMAHA_IP,
        path,
        timeout: 3000,
        headers: {
          'User-Agent': 'yamaha-sound-program-by-source',
          Accept: 'application/vnd.musiccast.v1+json',
          ...headers
        }
      },
      resp => {
        let data = '';

        resp.on('data', chunk => {
          data += chunk;
        });

        resp.on('end', () => {
          // console.log(data);
        });
      }
    )
    .on('error', err => {
      console.error('Error', err.message);
    });

const sendSetSoundProgram = soundProgram =>
  send(
    `/YamahaExtendedControl/v1/main/setSoundProgram?program=${soundProgram}`
  );

const sendSetClearVoice = enabled =>
  send(
    `/YamahaExtendedControl/v1/main/setClearVoice?enabled=${
      enabled ? 'true' : 'false'
    }`
  );

const sendEventServerAddress = port =>
  send('/YamahaExtendedControl/v1', {
    'X-AppName': 'MusicCast/1',
    'X-AppPort': port
  });

const handleIncomingEvent = event => {
  const isInputChanged = event.main && typeof event.main.input !== 'undefined';

  if (isInputChanged) {
    const soundProgram = inputSourceToSoundProgam(event.main.input);
    const setClearVoice = inputSourceShouldUseClearVoice(event.main.input);

    if (soundProgram) {
      console.log('Changing sound program to', soundProgram);
      sendSetSoundProgram(soundProgram);
    }

    console.log('Setting clear voice to', setClearVoice);
    sendSetClearVoice(setClearVoice);
  }
};

server.on('close', () => {
  console.log('Server is closed!');
});

server.on('error', error => {
  console.error('Error', error);
  server.close();
});

server.on('message', (msg, _info) => {
  let body = '';

  try {
    body = JSON.parse(msg.toString('utf8'));
  } catch (err) {
    console.warn('Could not parse event', msg.toString());
    return;
  }

  // console.log(body);
  handleIncomingEvent(body);
});

server.on('listening', () => {
  const address = server.address();
  const port = address.port;
  const ipaddr = address.address;

  console.log(
    'Incoming event server is listening at port',
    ipaddr + ':' + port
  );

  sendEventServerAddress(port);
});

server.bind(INCOMING_EVENT_SERVER_PORT, LOCAL_IP);
