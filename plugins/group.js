const { isJidGroup } = require('@whiskeysockets/baileys');
const { extractPhoneFromJid, normalizePhoneNumber, isAdminInGroup } = require('../lib/jidUtils.js');
const database = require('../lib/database.js');
const config = require('../config.js');

module.exports = async (sock, message) => {
    const { from, sender, senderJid, command, args, reply, isGroup, isOwner, groupMetadata, sendListMessage } = message;

    // Command group utama (List Message)
    if (command === 'group') {
        if (!isGroup) {
            await reply('This command can only be used in groups!');
            return true;
        }

        // Check if user is admin
        const isAdmin = isAdminInGroup(senderJid, groupMetadata);
        if (!isAdmin && !isOwner) {
            await reply('Only group admins can use group commands!');
            return true;
        }

        const sections = [
            {
                title: "👥 GROUP SETTINGS",
                rows: [
                    { 
                        title: "Welcome On/Off", 
                        description: "Enable/disable welcome message", 
                        rowId: `${config.prefix}welcome` 
                    },
                    { 
                        title: "Antilink On/Off", 
                        description: "Enable/disable anti-link", 
                        rowId: `${config.prefix}antilink` 
                    },
                    { 
                        title: "Set Group Name", 
                        description: "Change group name", 
                        rowId: `${config.prefix}setname` 
                    },
                    { 
                        title: "Set Description", 
                        description: "Change group description", 
                        rowId: `${config.prefix}setdesc` 
                    }
                ]
            },
            {
                title: "🛡️ ADMIN TOOLS",
                rows: [
                    { 
                        title: "Add Member", 
                        description: "Add members to group", 
                        rowId: `${config.prefix}add` 
                    },
                    { 
                        title: "Kick Member", 
                        description: "Remove members from group", 
                        rowId: `${config.prefix}kick` 
                    },
                    { 
                        title: "Promote to Admin", 
                        description: "Make member admin", 
                        rowId: `${config.prefix}promote` 
                    },
                    { 
                        title: "Demote Admin", 
                        description: "Remove admin status", 
                        rowId: `${config.prefix}demote` 
                    }
                ]
            },
            {
                title: "⚙️ GROUP CONTROLS",
                rows: [
                    { 
                        title: "Open Group", 
                        description: "Open group (all can chat)", 
                        rowId: `${config.prefix}open` 
                    },
                    { 
                        title: "Close Group", 
                        description: "Close group (admins only)", 
                        rowId: `${config.prefix}close` 
                    },
                    { 
                        title: "Group Info", 
                        description: "View group information", 
                        rowId: `${config.prefix}groupinfo` 
                    }
                ]
            }
        ];

        const listMessage = {
            text: `*👥 GROUP MANAGEMENT*\n\nGroup: ${groupMetadata?.subject || 'Unknown'}\n\nSelect a group management option:`,
            footer: `Admins: ${groupMetadata?.participants?.filter(p => p.admin).length || 0}`,
            title: "GROUP MENU",
            buttonText: "SELECT OPTION",
            sections: sections
        };

        await sendListMessage(listMessage);
        return true;
    }

    // Hanya proses di grup
    if (!isGroup) return false;

    // Validasi admin untuk commands berikut
    const isAdmin = isAdminInGroup(senderJid, groupMetadata);
    const adminCommands = ['welcome', 'setname', 'setdesc', 'open', 'close', 'kick', 'add', 'promote', 'demote', 'antilink'];
    
    if (adminCommands.includes(command) && !isAdmin && !isOwner) {
        await reply('Only group admins can use this command!');
        return true;
    }

    // Welcome on/off
    if (command === 'welcome') {
        const status = args[0]?.toLowerCase();
        if (status === 'on') {
            database.updateGroupData(from, { welcome: true });
            await reply('✅ Welcome message enabled!');
        } else if (status === 'off') {
            database.updateGroupData(from, { welcome: false });
            await reply('❌ Welcome message disabled!');
        } else {
            const current = database.getGroupData(from).welcome;
            await reply(`Welcome status: ${current ? '✅ ENABLED' : '❌ DISABLED'}\n\nUsage: .welcome on/off`);
        }
        return true;
    }

    // Antilink on/off
    if (command === 'antilink') {
        const status = args[0]?.toLowerCase();
        if (status === 'on') {
            database.updateGroupData(from, { antilink: true });
            await reply('✅ Antilink enabled! Links will be deleted automatically.');
        } else if (status === 'off') {
            database.updateGroupData(from, { antilink: false });
            await reply('❌ Antilink disabled!');
        } else {
            const current = database.getGroupData(from).antilink;
            await reply(`Antilink status: ${current ? '✅ ENABLED' : '❌ DISABLED'}\n\nUsage: .antilink on/off`);
        }
        return true;
    }

    // Set group name
    if (command === 'setname') {
        const name = args.join(' ');
        if (!name) {
            await reply('Usage: .setname <new group name>');
            return true;
        }
        try {
            await sock.groupUpdateSubject(from, name);
            await reply(`✅ Group name changed to: ${name}`);
        } catch (error) {
            await reply(`❌ Failed to change group name: ${error.message}`);
        }
        return true;
    }

    // Set group description
    if (command === 'setdesc') {
        const desc = args.join(' ');
        if (!desc) {
            await reply('Usage: .setdesc <new group description>');
            return true;
        }
        try {
            await sock.groupUpdateDescription(from, desc);
            await reply('✅ Group description updated!');
        } catch (error) {
            await reply(`❌ Failed to update description: ${error.message}`);
        }
        return true;
    }

    // Open group
    if (command === 'open') {
        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await reply('✅ Group opened! All members can send messages.');
        } catch (error) {
            await reply(`❌ Failed to open group: ${error.message}`);
        }
        return true;
    }

    // Close group
    if (command === 'close') {
        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await reply('✅ Group closed! Only admins can send messages.');
        } catch (error) {
            await reply(`❌ Failed to close group: ${error.message}`);
        }
        return true;
    }

    // Kick member
    if (command === 'kick') {
        const mentioned = message.mentionedJid || [];
        if (mentioned.length === 0) {
            await reply('Mention or tag members to kick!');
            return true;
        }
        
        try {
            await sock.groupParticipantsUpdate(from, mentioned, 'remove');
            await reply(`✅ Successfully kicked ${mentioned.length} member(s).`);
        } catch (error) {
            await reply(`❌ Failed to kick members: ${error.message}`);
        }
        return true;
    }

    // Add member
    if (command === 'add') {
        const numbers = args.map(arg => arg.replace(/[^0-9]/g, ''));
        if (numbers.length === 0) {
            await reply('Usage: .add <phone number> <phone number> ...');
            return true;
        }
        
        const jids = numbers.map(num => {
            if (num.startsWith('0')) num = '62' + num.substring(1);
            if (num.startsWith('8')) num = '62' + num;
            return num + '@s.whatsapp.net';
        });
        
        try {
            await sock.groupParticipantsUpdate(from, jids, 'add');
            await reply(`✅ Invited ${jids.length} member(s) to the group.`);
        } catch (error) {
            await reply(`❌ Failed to add members: ${error.message}`);
        }
        return true;
    }

    // Promote to admin
    if (command === 'promote') {
        const mentioned = message.mentionedJid || [];
        if (mentioned.length === 0) {
            await reply('Mention members to promote to admin!');
            return true;
        }
        
        try {
            await sock.groupParticipantsUpdate(from, mentioned, 'promote');
            await reply(`✅ Promoted ${mentioned.length} member(s) to admin.`);
        } catch (error) {
            await reply(`❌ Failed to promote members: ${error.message}`);
        }
        return true;
    }

    // Demote admin
    if (command === 'demote') {
        const mentioned = message.mentionedJid || [];
        if (mentioned.length === 0) {
            await reply('Mention admins to demote!');
            return true;
        }
        
        try {
            await sock.groupParticipantsUpdate(from, mentioned, 'demote');
            await reply(`✅ Demoted ${mentioned.length} admin(s).`);
        } catch (error) {
            await reply(`❌ Failed to demote admins: ${error.message}`);
        }
        return true;
    }

    // Group info
    if (command === 'groupinfo') {
        if (!groupMetadata) {
            await reply('Failed to get group information.');
            return true;
        }
        
        const admins = groupMetadata.participants.filter(p => p.admin).length;
        const members = groupMetadata.participants.length;
        const createdAt = new Date(groupMetadata.creation * 1000).toLocaleDateString();
        
        const info = `*📊 GROUP INFORMATION*\n\n` +
                     `*Name:* ${groupMetadata.subject}\n` +
                     `*Description:* ${groupMetadata.desc || 'No description'}\n` +
                     `*Members:* ${members}\n` +
                     `*Admins:* ${admins}\n` +
                     `*Created:* ${createdAt}\n` +
                     `*Group ID:* ${groupMetadata.id}`;
        
        await reply(info);
        return true;
    }

    return false;
};
