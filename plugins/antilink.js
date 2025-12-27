const { isGroup } = require('../lib/jidUtils.js');
const database = require('../lib/database.js');

module.exports = async (sock, message) => {
  const { from, sender, body, command, args, reply, isGroup, isOwner } = message;

  if (!isGroup) return false;

  const groupMetadata = await sock.groupMetadata(from);
  const participants = groupMetadata.participants;
  const isAdmin = participants.find(p => p.id === sender)?.admin || false;

  // Antilink on/off
  if (command === 'antilink') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const status = args[0];
    if (status === 'on') {
      database.updateGroupData(from, { antilink: true });
      await reply('Antilink enabled. Links will be deleted and sender may be kicked.');
    } else if (status === 'off') {
      database.updateGroupData(from, { antilink: false });
      await reply('Antilink disabled.');
    } else {
      await reply('Usage: .antilink on/off');
    }
    return true;
  }

  // Auto detect links
  const groupData = database.getGroupData(from);
  if (groupData.antilink && !isAdmin && !isOwner) {
    const linkRegex = /(https?:\/\/[^\s]+)/gi;
    if (linkRegex.test(body)) {
      // Delete message
      await sock.sendMessage(from, { delete: message.original.key });
      // Send warning
      await sock.sendMessage(from, { text: `@${sender}, sending links is not allowed!`, mentions: [sender] });
      // Kick after 3 warnings (placeholder)
      // Implement warning system if needed
    }
  }

  return false;
};
