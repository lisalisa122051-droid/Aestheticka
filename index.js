const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const pino = require('pino');
const path = require('path');

// Config
const config = require('./config.js');
const { startHandler } = require('./handler.js');
const { serializeMessage } = require('./lib/serialize.js');

// Session folder
const sessionFolder = path.join(__dirname, 'session');
if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
    },
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      return null;
    },
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('Connection lost. Reconnecting...');
        setTimeout(() => connectToWhatsApp(), 5000);
      } else {
        console.log('Connection closed. You are logged out.');
      }
    } else if (connection === 'open') {
      console.log('Bot is online!');
      // Update config
      config.owner = sock.user?.id?.split(':')[0] || config.owner;
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

    // Serialize message
    const serialized = await serializeMessage(msg, sock);
    if (!serialized) return;

    // Start handler
    await startHandler(sock, serialized);
  });

  return sock;
}

connectToWhatsApp();
