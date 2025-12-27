const { isGroup } = require('../lib/jidUtils.js');
const database = require('../lib/database.js');

module.exports = async (sock, message) => {
  const { from, sender, command, args, reply, isGroup, isOwner } = message;

  // Only works in groups
  if (!isGroup) return false;

  // Get group metadata
  const groupMetadata = await sock.groupMetadata(from);
  const participants = groupMetadata.participants;
  const isAdmin = participants.find(p => p.id === sender)?.admin || false;

  // Welcome on/off
  if (command === 'welcome') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const status = args[0];
    if (status === 'on') {
      database.updateGroupData(from, { welcome: true });
      await reply('Welcome message enabled.');
    } else if (status === 'off') {
      database.updateGroupData(from, { welcome: false });
      await reply('Welcome message disabled.');
    } else {
      await reply('Usage: .welcome on/off');
    }
    return true;
  }

  // Set group name
  if (command === 'setname') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const name = args.join(' ');
    if (!name) {
      await reply('Please provide a new group name.');
      return true;
    }
    await sock.groupUpdateSubject(from, name);
    await reply(`Group name changed to: ${name}`);
    return true;
  }

  // Set group description
  if (command === 'setdesc') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const desc = args.join(' ');
    if (!desc) {
      await reply('Please provide a new group description.');
      return true;
    }
    await sock.groupUpdateDescription(from, desc);
    await reply(`Group description updated.`);
    return true;
  }

  // Open group (allow all members to send messages)
  if (command === 'open') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    await sock.groupSettingUpdate(from, 'not_announcement');
    await reply('Group opened. All members can send messages.');
    return true;
  }

  // Close group (only admins can send messages)
  if (command === 'close') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    await sock.groupSettingUpdate(from, 'announcement');
    await reply('Group closed. Only admins can send messages.');
    return true;
  }

  // Kick member
  if (command === 'kick') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const mentioned = message.original.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length === 0) {
      await reply('Please mention the user to kick.');
      return true;
    }
    await sock.groupParticipantsUpdate(from, mentioned, 'remove');
    await reply(`Kicked ${mentioned.length} member(s).`);
    return true;
  }

  // Add member
  if (command === 'add') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const numbers = args.map(arg => arg.replace(/[^0-9]/g, ''));
    if (numbers.length === 0) {
      await reply('Please provide phone numbers to add.');
      return true;
    }
    const jids = numbers.map(num => num + '@s.whatsapp.net');
    await sock.groupParticipantsUpdate(from, jids, 'add');
    await reply(`Added ${jids.length} member(s).`);
    return true;
  }

  // Promote to admin
  if (command === 'promote') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const mentioned = message.original.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length === 0) {
      await reply('Please mention the user to promote.');
      return true;
    }
    await sock.groupParticipantsUpdate(from, mentioned, 'promote');
    await reply(`Promoted ${mentioned.length} member(s) to admin.`);
    return true;
  }

  // Demote admin
  if (command === 'demote') {
    if (!isAdmin && !isOwner) {
      await reply('Only group admins can use this command.');
      return true;
    }
    const mentioned = message.original.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length === 0) {
      await reply('Please mention the admin to demote.');
      return true;
    }
    await sock.groupParticipantsUpdate(from, mentioned, 'demote');
    await reply(`Demoted ${mentioned.length} admin(s).`);
    return true;
  }

  return false;
};
