const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    proto,
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const pino = require('pino');
const path = require('path');
const { Boom } = require('@hapi/boom');

// Config
const config = require('./config.js');
const { startHandler } = require('./handler.js');
const { serializeMessage } = require('./lib/serialize.js');

// Session folder
const sessionFolder = path.join(__dirname, 'session');
if (!fs.existsSync(sessionFolder)) {
    fs.mkdirSync(sessionFolder, { recursive: true });
}

async function connectToWhatsApp() {
    try {
        console.log('🚀 Starting WhatsApp Bot with @whiskeysockets/baileys v6.5.0...');
        
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
        const { version } = await fetchLatestBaileysVersion();
        
        console.log('📦 Using Baileys Version:', version);
        console.log('🔗 Session location:', sessionFolder);

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'error' }),
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
            },
            browser: Browsers.macOS('Desktop'),
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                return null;
            },
            // Performance optimization
            retryRequestDelayMs: 1000,
            maxMsgRetryCount: 3,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 30000,
        });

        // Save credentials when updated
        sock.ev.on('creds.update', saveCreds);

        // Handle connection updates
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('📱 Scan this QR code with WhatsApp Mobile!');
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`❌ Connection closed. Should reconnect: ${shouldReconnect}`);
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnecting in 5 seconds...');
                    setTimeout(() => connectToWhatsApp(), 5000);
                } else {
                    console.log('👋 Bot logged out. Please restart.');
                }
            } 
            else if (connection === 'open') {
                console.log('✅ Bot successfully connected!');
                console.log('👤 User ID:', sock.user?.id);
                
                // Update owner number
                if (sock.user?.id) {
                    const phoneNumber = sock.user.id.split(':')[0];
                    console.log('📞 Bot phone number:', phoneNumber);
                    config.owner = phoneNumber;
                }
            }
        });

        // Handle incoming messages
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            
            // Skip if: no message, status broadcast, or from bot itself
            if (!msg.message || 
                msg.key.remoteJid === 'status@broadcast' || 
                msg.key.fromMe ||
                (msg.message.protocolMessage && msg.message.protocolMessage.type === 0)) {
                return;
            }

            try {
                // Serialize message
                const serialized = await serializeMessage(msg, sock);
                if (!serialized) return;

                // Start handler
                await startHandler(sock, serialized);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        // Handle group participants updates (welcome message)
        sock.ev.on('group-participants.update', async (update) => {
            try {
                const { id, participants, action } = update;
                const database = require('./lib/database.js');
                const groupData = database.getGroupData(id);
                
                if (action === 'add' && groupData.welcome) {
                    for (const participant of participants) {
                        const user = participant.split('@')[0];
                        await sock.sendMessage(id, { 
                            text: `🎉 Welcome @${user} to the group!\n\nPlease introduce yourself! 😊` 
                        });
                    }
                }
            } catch (error) {
                console.error('Error in group update handler:', error);
            }
        });

        return sock;
        
    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        console.log('🔄 Retrying in 10 seconds...');
        setTimeout(() => connectToWhatsApp(), 10000);
    }
}

// Start the bot
connectToWhatsApp();

// Handle process exit
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
