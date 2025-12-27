const axios = require('axios');
const config = require('../config.js');

module.exports = async (sock, message) => {
    const { from, sender, command, args, reply, sendListMessage } = message;

    // Command .download - Menu download utama
    if (command === 'download') {
        const listMessage = {
            text: "⬇️ *DOWNLOAD MENU*\n\nPilih platform download yang tersedia:",
            title: "DOWNLOADER",
            buttonText: "PILIH PLATFORM",
            sections: [
                {
                    title: "VIDEO/AUDIO DOWNLOAD",
                    rows: [
                        { 
                            title: "🎵 PLAY", 
                            description: "Download YouTube audio/video", 
                            rowId: `${config.prefix}play` 
                        },
                        { 
                            title: "📹 YOUTUBE", 
                            description: "Download video YouTube", 
                            rowId: `${config.prefix}ytvideo` 
                        },
                        { 
                            title: "📱 TIKTOK", 
                            description: "Download video TikTok", 
                            rowId: `${config.prefix}tiktok` 
                        },
                        { 
                            title: "📸 INSTAGRAM", 
                            description: "Download IG video/foto", 
                            rowId: `${config.prefix}instagram` 
                        }
                    ]
                }
            ]
        };

        await sendListMessage(listMessage);
        return true;
    }

    // Command .play - Pilih tipe download
    if (command === 'play') {
        if (args.length > 0 && ['audio', 'video'].includes(args[0].toLowerCase())) {
            const type = args[0].toLowerCase();
            const query = args.slice(1).join(' ');
            
            if (!query) {
                await reply(`Gunakan: .play ${type} <query>\nContoh: .play ${type} snowman`);
                return true;
            }
            
            await reply(`🔍 Mencari ${type === 'audio' ? 'audio' : 'video'} untuk: "${query}"\n\n⏳ Mohon tunggu...`);
            return true;
        }
        
        // Tampilkan list untuk memilih tipe
        const listMessage = {
            text: "🎵 *PLAY DOWNLOADER*\n\nPilih tipe download yang diinginkan:",
            title: "PLAY TYPE",
            buttonText: "PILIH TIPE",
            sections: [
                {
                    title: "DOWNLOAD TYPE",
                    rows: [
                        { 
                            title: "🎵 AUDIO", 
                            description: "Download sebagai audio (MP3)", 
                            rowId: `${config.prefix}play audio` 
                        },
                        { 
                            title: "🎬 VIDEO", 
                            description: "Download sebagai video (MP4)", 
                            rowId: `${config.prefix}play video` 
                        }
                    ]
                }
            ]
        };

        await sendListMessage(listMessage);
        return true;
    }

    // YouTube video download
    if (command === 'ytvideo') {
        const query = args.join(' ');
        if (!query) {
            await reply('Gunakan: .ytvideo <query>\nContoh: .ytvideo snowman');
            return true;
        }
        await reply(`🔍 Mencari video YouTube: "${query}"\n\n⏳ Mohon tunggu...`);
        return true;
    }

    // TikTok download
    if (command === 'tiktok') {
        const url = args[0];
        if (!url || !url.includes('tiktok')) {
            await reply('Gunakan: .tiktok <url>\nContoh: .tiktok https://tiktok.com/@user/video/123');
            return true;
        }
        await reply(`🔗 Memproses TikTok: ${url}\n\n⏳ Mohon tunggu...`);
        return true;
    }

    // Instagram download
    if (command === 'instagram') {
        const url = args[0];
        if (!url || !url.includes('instagram')) {
            await reply('Gunakan: .instagram <url>\nContoh: .instagram https://instagram.com/p/Cxample');
            return true;
        }
        await reply(`📸 Memproses Instagram: ${url}\n\n⏳ Mohon tunggu...`);
        return true;
    }

    return false;
};
