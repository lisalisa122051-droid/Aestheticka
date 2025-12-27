const { isGroup, extractPhoneFromJid, normalizePhoneNumber, isOwner } = require('./jidUtils.js');
const config = require('../config.js');

async function serializeMessage(msg, sock) {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroupMsg = isGroup(from);
    const isBot = msg.key.fromMe;
    const pushName = msg.pushName || 'User';
    const type = Object.keys(msg.message || {})[0] || '';

    // Extract phone numbers
    const senderNumber = extractPhoneFromJid(sender);
    const normalizedSender = normalizePhoneNumber(senderNumber);
    const fromNumber = extractPhoneFromJid(from);
    const normalizedFrom = normalizePhoneNumber(fromNumber);

    // Determine owner status
    const owner = isOwner(normalizedSender);

    // Body text
    let body = '';
    if (type === 'conversation') {
      body = msg.message.conversation;
    } else if (type === 'extendedTextMessage') {
      body = msg.message.extendedTextMessage.text;
    } else if (type === 'imageMessage') {
      body = msg.message.imageMessage.caption || '';
    } else if (type === 'videoMessage') {
      body = msg.message.videoMessage.caption || '';
    } else if (type === 'buttonsResponseMessage') {
      body = msg.message.buttonsResponseMessage.selectedButtonId || '';
    } else if (type === 'listResponseMessage') {
      body = msg.message.listResponseMessage.singleSelectReply.selectedRowId || '';
    }

    // Serialize
    const serialized = {
      original: msg,
      from,
      sender: normalizedSender,
      pushName,
      body,
      type,
      isGroup: isGroupMsg,
      isBot,
      isOwner: owner,
      reply: async (text, options = {}) => {
        return await sock.sendMessage(from, { text }, { quoted: msg, ...options });
      },
      sendMessage: async (content, options = {}) => {
        return await sock.sendMessage(from, content, { quoted: msg, ...options });
      },
    };

    return serialized;
  } catch (error) {
    console.error('Serialize error:', error);
    return null;
  }
}

module.exports = { serializeMessage };
