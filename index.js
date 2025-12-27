const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers 
} = require('@adiwajshing/baileys');
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
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
        },
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        getMessage: async (key) => {
            return null;
        },
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('Scan QR Code di atas!');
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus, reconnect:', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(() => connectToWhatsApp(), 5000);
            }
        } else if (connection === 'open') {
            console.log('Bot berhasil terhubung!');
            console.log('User ID:', sock.user?.id);
            // Update owner number dari user yang login
            if (sock.user?.id) {
                const phoneNumber = sock.user.id.split(':')[0];
                if (phoneNumber) {
                    console.log('Bot number:', phoneNumber);
                }
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) return;

        // Serialize message
        const serialized = await serializeMessage(msg, sock);
        if (!serialized) return;

        // Start handler
        await startHandler(sock, serialized);
    });

    // Handle group updates
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const groupData = require('./lib/database.js').getGroupData(id);
        
        if (action === 'add' && groupData.welcome) {
            for (const participant of participants) {
                const user = participant.split('@')[0];
                await sock.sendMessage(id, { 
                    text: `Selamat datang @${user} di grup! 🎉\n\nPerkenalkan diri kamu ya!` 
                });
            }
        }
    });

    return sock;
}

connectToWhatsApp().catch(err => {
    console.error('Failed to connect:', err);
    process.exit(1);
});
