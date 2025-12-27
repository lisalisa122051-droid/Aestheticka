const config = require('../config.js');

/**
 * Check if JID is a group JID
 * @param {string} jid 
 * @returns {boolean}
 */
function isGroupJid(jid) {
  return jid.endsWith('@g.us');
}

/**
 * Extract phone number from JID
 * @param {string} jid 
 * @returns {string}
 */
function extractPhoneFromJid(jid) {
  if (!jid) return '';
  const phone = jid.split('@')[0];
  return phone;
}

/**
 * Normalize phone number to international format (62)
 * @param {string} phone 
 * @returns {string}
 */
function normalizePhoneNumber(phone) {
  if (!phone) return '';
  let normalized = phone.replace(/[^0-9]/g, '');
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.substring(1);
  } else if (normalized.startsWith('8')) {
    normalized = '62' + normalized;
  }
  return normalized;
}

/**
 * Map raw JID to original number
 * @param {string} rawJid 
 * @returns {string}
 */
function mapRawJidToOriginalNumber(rawJid) {
  const phone = extractPhoneFromJid(rawJid);
  return normalizePhoneNumber(phone);
}

/**
 * Process JID from group message
 * @param {object} message 
 * @param {object} sock 
 * @returns {Promise<string>}
 */
async function processJidFromGroupMessage(message, sock) {
  if (!message.key.participant) return '';
  const participant = message.key.participant;
  return mapRawJidToOriginalNumber(participant);
}

/**
 * Check if sender is owner
 * @param {string} sender 
 * @returns {boolean}
 */
function isOwner(sender) {
  const normalizedSender = normalizePhoneNumber(sender);
  const normalizedOwner = normalizePhoneNumber(config.owner);
  return normalizedSender === normalizedOwner;
}

module.exports = {
  isGroup: isGroupJid,
  extractPhoneFromJid,
  normalizePhoneNumber,
  mapRawJidToOriginalNumber,
  processJidFromGroupMessage,
  isOwner,
};
