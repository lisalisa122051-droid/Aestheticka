const config = require('../config.js');
const libphonenumber = require('libphonenumber-js');

/**
 * Check if JID is a group JID
 * @param {string} jid 
 * @returns {boolean}
 */
function isGroupJid(jid) {
    return jid?.endsWith('@g.us') || jid?.endsWith('@g.us');
}

/**
 * Extract phone number from JID
 * @param {string} jid 
 * @returns {string}
 */
function extractPhoneFromJid(jid) {
    if (!jid) return '';
    return jid.split('@')[0]?.replace(/[^0-9]/g, '') || '';
}

/**
 * Normalize phone number to international format (62)
 * @param {string} phone 
 * @returns {string}
 */
function normalizePhoneNumber(phone) {
    if (!phone) return '';
    
    try {
        // Hapus semua karakter non-digit
        let cleaned = phone.replace(/[^0-9]/g, '');
        
        // Jika diawali dengan 0, ganti dengan 62
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1);
        }
        // Jika diawali dengan 8 (tanpa 62), tambahkan 62
        else if (cleaned.startsWith('8') && !cleaned.startsWith('62')) {
            cleaned = '62' + cleaned;
        }
        // Jika diawali dengan +62, hapus +
        else if (cleaned.startsWith('+62')) {
            cleaned = '62' + cleaned.substring(3);
        }
        
        // Pastikan panjang minimal 10 digit
        if (cleaned.length < 10) {
            return phone; // Return as-is jika terlalu pendek
        }
        
        return cleaned;
    } catch (error) {
        console.error('Error normalizing phone:', phone, error);
        return phone;
    }
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
    if (!message.key?.participant) return '';
    const participant = message.key.participant;
    return mapRawJidToOriginalNumber(participant);
}

/**
 * Check if sender is owner
 * @param {string} sender 
 * @returns {boolean}
 */
function isOwner(sender) {
    if (!sender) return false;
    
    const normalizedSender = normalizePhoneNumber(sender);
    const normalizedOwner = normalizePhoneNumber(config.owner);
    
    return normalizedSender === normalizedOwner;
}

/**
 * Check if user is admin in group
 * @param {string} jid 
 * @param {object} groupMetadata 
 * @returns {boolean}
 */
function isAdminInGroup(jid, groupMetadata) {
    if (!groupMetadata?.participants) return false;
    
    const participant = groupMetadata.participants.find(p => p.id === jid);
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

/**
 * Format JID for display
 * @param {string} jid 
 * @returns {string}
 */
function formatJidForDisplay(jid) {
    if (!jid) return '';
    const phone = extractPhoneFromJid(jid);
    return normalizePhoneNumber(phone);
}

module.exports = {
    isGroup: isGroupJid,
    extractPhoneFromJid,
    normalizePhoneNumber,
    mapRawJidToOriginalNumber,
    processJidFromGroupMessage,
    isOwner,
    isAdminInGroup,
    formatJidForDisplay,
};
