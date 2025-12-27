const { isJidGroup, areJidsSameUser, jidNormalizedUser } = require('@whiskeysockets/baileys');
const { normalizePhoneNumber, extractPhoneFromJid, isOwner } = require('./jidUtils.js');
const config = require('../config.js');

async function serializeMessage(msg, sock) {
    try {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroupMsg = isJidGroup(from);
        const isBot = msg.key.fromMe;
        const pushName = msg.pushName || 'User';
        
        // Extract message type and content
        let type = Object.keys(msg.message || {})[0] || '';
        let body = '';
        let mentionedJid = [];
        let quotedMessage = null;

        // Extract text body based on message type
        switch(type) {
            case 'conversation':
                body = msg.message.conversation;
                break;
            case 'extendedTextMessage':
                body = msg.message.extendedTextMessage.text || '';
                mentionedJid = msg.message.extendedTextMessage.contextInfo?.mentionedJid || [];
                quotedMessage = msg.message.extendedTextMessage.contextInfo?.quotedMessage;
                break;
            case 'imageMessage':
                body = msg.message.imageMessage.caption || '';
                break;
            case 'videoMessage':
                body = msg.message.videoMessage.caption || '';
                break;
            case 'buttonsResponseMessage':
                body = msg.message.buttonsResponseMessage.selectedButtonId || '';
                break;
            case 'listResponseMessage':
                body = msg.message.listResponseMessage.singleSelectReply.selectedRowId || '';
                break;
            case 'templateButtonReplyMessage':
                body = msg.message.templateButtonReplyMessage.selectedId || '';
                break;
            case 'ephemeralMessage':
                // Handle ephemeral messages
                const ephemeralType = Object.keys(msg.message.ephemeralMessage.message || {})[0];
                if (ephemeralType === 'extendedTextMessage') {
                    body = msg.message.ephemeralMessage.message.extendedTextMessage.text || '';
                }
                break;
        }

        // Extract phone numbers
        const senderNumber = extractPhoneFromJid(sender);
        const normalizedSender = normalizePhoneNumber(senderNumber);
        const fromNumber = extractPhoneFromJid(from);
        const normalizedFrom = normalizePhoneNumber(fromNumber);

        // Determine owner status
        const owner = isOwner(normalizedSender);

        // Get group metadata for group messages
        let groupMetadata = null;
        if (isGroupMsg) {
            try {
                groupMetadata = await sock.groupMetadata(from);
            } catch (err) {
                console.error('Failed to fetch group metadata:', err);
            }
        }

        // Check if it's a command
        const isCommand = body.startsWith(config.prefix);
        const command = isCommand ? body.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = isCommand ? body.slice(config.prefix.length + command.length).trim().split(/ +/) : [];

        // Serialized message object
        const serialized = {
            // Original data
            original: msg,
            from,
            sender: normalizedSender,
            senderJid: sender,
            pushName,
            body,
            type,
            
            // Status flags
            isGroup: isGroupMsg,
            isBot,
            isOwner: owner,
            isCommand,
            command,
            args,
            
            // Metadata
            groupMetadata,
            mentionedJid,
            quotedMessage,
            
            // Helper methods
            reply: async (text, options = {}) => {
                return await sock.sendMessage(from, { text }, { 
                    quoted: msg, 
                    ...options 
                });
            },
            
            sendMessage: async (content, options = {}) => {
                return await sock.sendMessage(from, content, { 
                    quoted: msg, 
                    ...options 
                });
            },
            
            sendListMessage: async (listMessage) => {
                return await sock.sendMessage(from, listMessage);
            },
            
            sendImage: async (buffer, caption = '', options = {}) => {
                return await sock.sendMessage(from, { 
                    image: buffer, 
                    caption: caption 
                }, { 
                    quoted: msg, 
                    ...options 
                });
            },
            
            sendVideo: async (buffer, caption = '', options = {}) => {
                return await sock.sendMessage(from, { 
                    video: buffer, 
                    caption: caption 
                }, { 
                    quoted: msg, 
                    ...options 
                });
            },
            
            sendSticker: async (buffer, options = {}) => {
                return await sock.sendMessage(from, { 
                    sticker: buffer 
                }, { 
                    quoted: msg, 
                    ...options 
                });
            },
            
            downloadMedia: async () => {
                try {
                    const stream = await require('@whiskeysockets/baileys').downloadContentFromMessage(
                        msg.message[type] || msg.message, 
                        type.replace('Message', '')
                    );
                    
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    return buffer;
                } catch (error) {
                    console.error('Error downloading media:', error);
                    return null;
                }
            }
        };

        return serialized;
        
    } catch (error) {
        console.error('Serialize error:', error);
        return null;
    }
}

module.exports = { serializeMessage };
