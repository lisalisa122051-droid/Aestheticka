const { isJidGroup } = require('@adiwajshing/baileys');
const { normalizePhoneNumber, extractPhoneFromJid, isOwner } = require('./jidUtils.js');

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

        if (type === 'conversation') {
            body = msg.message.conversation;
        } else if (type === 'extendedTextMessage') {
            body = msg.message.extendedTextMessage.text || '';
            mentionedJid = msg.message.extendedTextMessage.contextInfo?.mentionedJid || [];
        } else if (type === 'imageMessage') {
            body = msg.message.imageMessage.caption || '';
        } else if (type === 'videoMessage') {
            body = msg.message.videoMessage.caption || '';
        } else if (type === 'buttonsResponseMessage') {
            body = msg.message.buttonsResponseMessage.selectedButtonId || '';
        } else if (type === 'listResponseMessage') {
            body = msg.message.listResponseMessage.singleSelectReply.selectedRowId || '';
        } else if (type === 'templateButtonReplyMessage') {
            body = msg.message.templateButtonReplyMessage.selectedId || '';
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

        // Serialize
        const serialized = {
            original: msg,
            from,
            sender: normalizedSender,
            senderJid: sender,
            pushName,
            body,
            type,
            isGroup: isGroupMsg,
            isBot,
            isOwner: owner,
            groupMetadata,
            mentionedJid,
            reply: async (text, options = {}) => {
                return await sock.sendMessage(from, { text }, { quoted: msg, ...options });
            },
            sendMessage: async (content, options = {}) => {
                return await sock.sendMessage(from, content, { quoted: msg, ...options });
            },
            sendListMessage: async (listMessage) => {
                return await sock.sendMessage(from, listMessage);
            }
        };

        return serialized;
    } catch (error) {
        console.error('Serialize error:', error);
        return null;
    }
}

module.exports = { serializeMessage };
