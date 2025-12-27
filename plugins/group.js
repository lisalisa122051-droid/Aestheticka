const { isJidGroup } = require('@adiwajshing/baileys');
const { extractPhoneFromJid, normalizePhoneNumber } = require('../lib/jidUtils.js');
const database = require('../lib/database.js');

module.exports = async (sock, message) => {
    const { from, sender, senderJid, command, args, reply, isGroup, isOwner, groupMetadata, sendListMessage } = message;

    // Command group utama (List Message)
    if (command === 'group') {
        if (!isGroup) {
            await reply('Command ini hanya bisa digunakan di dalam grup!');
            return true;
        }

        const sections = [
            {
                title: "👥 GROUP SETTINGS",
                rows: [
                    { 
                        title: "Welcome On/Off", 
                        description: "Aktifkan/Nonaktifkan welcome message", 
                        rowId: `${command} welcome` 
                    },
                    { 
                        title: "Antilink On/Off", 
                        description: "Aktifkan/Nonaktifkan anti link", 
                        rowId: `${command} antilink` 
                    },
                    { 
                        title: "Set Group Name", 
                        description: "Ubah nama grup", 
                        rowId: `${command} setname` 
                    },
                    { 
                        title: "Set Description", 
                        description: "Ubah deskripsi grup", 
                        rowId: `${command} setdesc` 
                    }
                ]
            },
            {
                title: "🛡️ ADMIN TOOLS",
                rows: [
                    { 
                        title: "Add Member", 
                        description: "Tambah anggota ke grup", 
                        rowId: `${command} add` 
                    },
                    { 
                        title: "Kick Member", 
                        description: "Keluarkan anggota dari grup", 
                        rowId: `${command} kick` 
                    },
                    { 
                        title: "Promote to Admin", 
                        description: "Jadikan anggota sebagai admin", 
                        rowId: `${command} promote` 
                    },
                    { 
                        title: "Demote Admin", 
                        description: "Turunkan admin menjadi anggota", 
                        rowId: `${command} demote` 
                    }
                ]
            },
            {
                title: "⚙️ GROUP CONTROLS",
                rows: [
                    { 
                        title: "Open Group", 
                        description: "Buka grup (semua bisa chat)", 
                        rowId: `${command} open` 
                    },
                    { 
                        title: "Close Group", 
                        description: "Tutup grup (hanya admin)", 
                        rowId: `${command} close` 
                    },
                    { 
                        title: "Group Info", 
                        description: "Lihat informasi grup", 
                        rowId: `${command} info` 
                    }
                ]
            }
        ];

        const listMessage = {
            text: `*👥 GROUP MENU*\n\nGrup: ${groupMetadata?.subject || 'Unknown'}\n\nPilih opsi pengaturan grup:`,
            footer: `Admin: ${groupMetadata?.participants?.filter(p => p.admin).length || 0} orang`,
            title: "GROUP MANAGEMENT",
            buttonText: "PILIH MENU",
            sections: sections
        };

        await sendListMessage(listMessage);
        return true;
    }

    // Hanya proses di grup
    if (!isGroup) return false;

    // Validasi admin
    const participants = groupMetadata?.participants || [];
    const isAdmin = participants.find(p => p.id === senderJid)?.admin || false;
    
    if (!isAdmin && !isOwner) {
        // Jika bukan admin, tampilkan pesan error
        if (['welcome', 'setname', 'setdesc', 'open', 'close', 'kick', 'add', 'promote', 'demote', 'antilink'].includes(command)) {
            await reply('Hanya admin grup yang bisa menggunakan command ini!');
            return true;
        }
    }

    // Welcome on/off
    if (command === 'welcome') {
        const status = args[0]?.toLowerCase();
        if (status === 'on') {
            database.updateGroupData(from, { welcome: true });
            await reply('✅ Welcome message diaktifkan!');
        } else if (status === 'off') {
            database.updateGroupData(from, { welcome: false });
            await reply('❌ Welcome message dinonaktifkan!');
        } else {
            const current = database.getGroupData(from).welcome;
            await reply(`Status welcome: ${current ? '✅ AKTIF' : '❌ NONAKTIF'}\n\nGunakan: .welcome on/off`);
        }
        return true;
    }

    // Antilink on/off
    if (command === 'antilink') {
        const status = args[0]?.toLowerCase();
        if (status === 'on') {
            database.updateGroupData(from, { antilink: true });
            await reply('✅ Antilink diaktifkan! Link akan dihapus otomatis.');
        } else if (status === 'off') {
            database.updateGroupData(from, { antilink: false });
            await reply('❌ Antilink dinonaktifkan!');
        } else {
            const current = database.getGroupData(from).antilink;
            await reply(`Status antilink: ${current ? '✅ AKTIF' : '❌ NONAKTIF'}\n\nGunakan: .antilink on/off`);
        }
        return true;
    }

    // Set group name
    if (command === 'setname') {
        const name = args.join(' ');
        if (!name) {
            await reply('Contoh: .setname Nama Grup Baru');
            return true;
        }
        try {
            await sock.groupUpdateSubject(from, name);
            await reply(`✅ Nama grup berhasil diubah menjadi: ${name}`);
        } catch (error) {
            await reply(`❌ Gagal mengubah nama grup: ${error.message}`);
        }
        return true;
    }

    // Set group description
    if (command === 'setdesc') {
        const desc = args.join(' ');
        if (!desc) {
            await reply('Contoh: .setdesc Deskripsi grup baru');
            return true;
        }
        try {
            await sock.groupUpdateDescription(from, desc);
            await reply('✅ Deskripsi grup berhasil diubah!');
        } catch (error) {
            await reply(`❌ Gagal mengubah deskripsi: ${error.message}`);
        }
        return true;
    }

    // Open group
    if (command === 'open') {
        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await reply('✅ Grup dibuka! Semua anggota bisa mengirim pesan.');
        } catch (error) {
            await reply(`❌ Gagal membuka grup: ${error.message}`);
        }
        return true;
    }

    // Close group
    if (command === 'close') {
        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await reply('✅ Grup ditutup! Hanya admin yang bisa mengirim pesan.');
        } catch (error) {
            await reply(`❌ Gagal menutup grup: ${error.message}`);
        }
        return true;
    }

    // Kick member
    if (command === 'kick') {
        const mentioned = message.mentionedJid || [];
        if (mentioned.length === 0) {
            await reply('Tag atau sebutkan anggota yang akan dikeluarkan!');
            return true;
        }
        
        try {
            await sock.groupParticipantsUpdate(from, mentioned, 'remove');
            await reply(`✅ Berhasil mengeluarkan ${mentioned.length} anggota.`);
        } catch (error) {
            await reply(`❌ Gagal mengeluarkan anggota: ${error.message}`);
        }
        return true;
    }

    // Add member
    if (command === 'add') {
        const numbers = args.map(arg => arg.replace(/[^0-9]/g, ''));
        if (numbers.length === 0) {
            await reply('Contoh: .add 6281234567890 6289876543210');
            return true;
        }
        
        const jids = numbers.map(num => {
            if (num.startsWith('0')) num = '62' + num.substring(1);
            if (num.startsWith('8')) num = '62' + num;
            return num + '@s.whatsapp.net';
        });
        
        try {
            await sock.groupParticipantsUpdate(from, jids, 'add');
            await reply(`✅ Mengundang ${jids.length} anggota ke grup.`);
        } catch (error) {
            await reply(`❌ Gagal menambahkan anggota: ${error.message}`);
        }
        return true;
    }

    // Promote to admin
    if (command === 'promote') {
        const mentioned = message.mentionedJid || [];
        if (mentioned.length === 0) {
            await reply('Tag anggota yang akan dijadikan admin!');
            return true;
        }
        
        try {
            await sock.groupParticipantsUpdate(from, mentioned, 'promote');
            await reply(`✅ Berhasil menjadikan ${mentioned.length} anggota sebagai admin.`);
        } catch (error) {
            await reply(`❌ Gagal promote anggota: ${error.message}`);
        }
        return true;
    }

    // Demote admin
    if (command === 'demote') {
        const mentioned = message.mentionedJid || [];
        if (mentioned.length === 0) {
            await reply('Tag admin yang akan diturunkan!');
            return true;
        }
        
        try {
            await sock.groupParticipantsUpdate(from, mentioned, 'demote');
            await reply(`✅ Berhasil menurunkan ${mentioned.length} admin.`);
        } catch (error) {
            await reply(`❌ Gagal demote admin: ${error.message}`);
        }
        return true;
    }

    return false;
};
