const config = require('../config.js');
const { generateWAMessageFromContent } = require('@adiwajshing/baileys');

module.exports = async (sock, message) => {
    const { from, sender, body, command, reply, sendListMessage } = message;

    if (command === 'menu') {
        // Buat List Message yang kompatibel dengan Baileys official
        const listMessage = {
            text: `*${config.name} BOT*\n\nHalo @${sender}, selamat datang di bot WhatsApp multi-device!\n\n*Silakan pilih menu di bawah:*`,
            footer: `Versi: ${config.botInfo.version}`,
            title: "📱 MENU UTAMA",
            buttonText: "BUKA MENU",
            sections: [
                {
                    title: "🎯 PILIHAN UTAMA",
                    rows: [
                        {
                            title: "📋 SEMUA MENU",
                            description: "Lihat semua menu yang tersedia",
                            rowId: `${config.prefix}allmenu`
                        },
                        {
                            title: "🚀 PING & STATUS",
                            description: "Cek kecepatan & status bot",
                            rowId: `${config.prefix}ping`
                        },
                        {
                            title: "👑 MENU OWNER",
                            description: "Menu khusus pemilik bot",
                            rowId: `${config.prefix}owner`
                        },
                        {
                            title: "👥 MENU GRUP",
                            description: "Pengaturan grup & admin",
                            rowId: `${config.prefix}group`
                        }
                    ]
                }
            ],
            mentions: [sender + '@s.whatsapp.net']
        };

        await sendListMessage(listMessage);
        return true;
    }

    if (command === 'allmenu' || command === 'help') {
        const sections = [
            {
                title: "📊 CORE & INFO",
                rows: [
                    { title: "Ping", description: "Cek respon bot", rowId: `${config.prefix}ping` },
                    { title: "Speed", description: "Test kecepatan", rowId: `${config.prefix}speed` },
                    { title: "Runtime", description: "Waktu aktif bot", rowId: `${config.prefix}runtime` },
                    { title: "Bot Info", description: "Informasi bot", rowId: `${config.prefix}infobot` },
                ],
            },
            {
                title: "🎮 FUN & GAMES",
                rows: [
                    { title: "Joke", description: "Cerita lucu", rowId: `${config.prefix}joke` },
                    { title: "Truth", description: "Pertanyaan jujur", rowId: `${config.prefix}truth` },
                    { title: "Dare", description: "Tantangan seru", rowId: `${config.prefix}dare` },
                    { title: "Rate", description: "Rating sesuatu", rowId: `${config.prefix}rate` },
                ],
            },
            {
                title: "⬇️ DOWNLOADER",
                rows: [
                    { title: "Play", description: "Download audio/video", rowId: `${config.prefix}play` },
                    { title: "YT Video", description: "YouTube video", rowId: `${config.prefix}ytvideo` },
                    { title: "TikTok", description: "Download TikTok", rowId: `${config.prefix}tiktok` },
                    { title: "Instagram", description: "Download IG", rowId: `${config.prefix}instagram` },
                ],
            },
            {
                title: "🛠️ TOOLS",
                rows: [
                    { title: "Sticker", description: "Buat stiker", rowId: `${config.prefix}sticker` },
                    { title: "To Image", description: "Stiker ke gambar", rowId: `${config.prefix}toimg` },
                    { title: "To Audio", description: "Ekstrak audio", rowId: `${config.prefix}toaudio` },
                    { title: "Shortlink", description: "Pendekkan URL", rowId: `${config.prefix}shortlink` },
                ],
            },
            {
                title: "👥 GROUP MENU",
                rows: [
                    { title: "Welcome On/Off", description: "Aktifkan welcome", rowId: `${config.prefix}welcome` },
                    { title: "Set Name", description: "Ubah nama grup", rowId: `${config.prefix}setname` },
                    { title: "Set Desc", description: "Ubah deskripsi", rowId: `${config.prefix}setdesc` },
                    { title: "Add Member", description: "Tambah anggota", rowId: `${config.prefix}add` },
                    { title: "Kick", description: "Keluarkan anggota", rowId: `${config.prefix}kick` },
                ],
            },
            {
                title: "🛡️ ADMIN TOOLS",
                rows: [
                    { title: "Promote", description: "Jadikan admin", rowId: `${config.prefix}promote` },
                    { title: "Demote", description: "Turunkan admin", rowId: `${config.prefix}demote` },
                    { title: "Antilink On/Off", description: "Anti link grup", rowId: `${config.prefix}antilink` },
                    { title: "Open/Close", description: "Buka/tutup grup", rowId: `${config.prefix}open` },
                ],
            }
        ];

        const listMessage = {
            text: `*📚 ALL MENU LIST*\n\nTotal: ${sections.reduce((acc, sec) => acc + sec.rows.length, 0)} commands\n\nPilih kategori:`,
            footer: `Owner: @${config.owner}`,
            title: "📋 KATEGORI MENU",
            buttonText: "PILIH KATEGORI",
            sections: sections,
        };

        await sendListMessage(listMessage);
        return true;
    }

    return false;
};
