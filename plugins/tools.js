const path = require('path');
const fs = require('fs-extra');
const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, command, args, reply, type } = message;

  // Tools menu utama
  if (command === 'tools') {
    const listMessage = {
      text: "🛠️ *TOOLS & UTILITIES*\n\nPilih alat yang tersedia:",
      title: "TOOLS MENU",
      buttonText: "Pilih Tool",
      sections: [
        {
          title: "MEDIA TOOLS",
          rows: [
            { 
              title: "🖼️ STICKER", 
              description: "Buat stiker dari gambar", 
              rowId: `${config.prefix}sticker` 
            },
            { 
              title: "📸 TO IMAGE", 
              description: "Konversi stiker ke gambar", 
              rowId: `${config.prefix}toimg` 
            },
            { 
              title: "🎵 TO AUDIO", 
              description: "Ekstrak audio dari video", 
              rowId: `${config.prefix}toaudio` 
            },
            { 
              title: "🔗 SHORTLINK", 
              description: "Pendekkan URL panjang", 
              rowId: `${config.prefix}shortlink` 
            }
          ]
        }
      ]
    };

    await sock.sendMessage(from, listMessage);
    return true;
  }

  // Sticker from image
  if (command === 'sticker') {
    if (type !== 'imageMessage') {
      await reply('Kirim gambar dengan caption .sticker');
      return true;
    }
    try {
      const media = await sock.downloadAndSaveMediaMessage(message.original);
      await sock.sendMessage(from, { sticker: fs.readFileSync(media) });
      fs.unlinkSync(media);
    } catch (error) {
      await reply('Gagal membuat stiker.');
    }
    return true;
  }

  // Convert sticker to image
  if (command === 'toimg') {
    if (type !== 'stickerMessage') {
      await reply('Kirim stiker dengan caption .toimg');
      return true;
    }
    try {
      const media = await sock.downloadAndSaveMediaMessage(message.original);
      await sock.sendMessage(from, { image: fs.readFileSync(media) });
      fs.unlinkSync(media);
    } catch (error) {
      await reply('Gagal mengkonversi stiker ke gambar.');
    }
    return true;
  }

  // Extract audio from video/voice note
  if (command === 'toaudio') {
    if (type !== 'videoMessage' && type !== 'audioMessage') {
      await reply('Kirim video atau voice note dengan caption .toaudio');
      return true;
    }
    try {
      const media = await sock.downloadAndSaveMediaMessage(message.original);
      await sock.sendMessage(from, { 
        audio: fs.readFileSync(media), 
        mimetype: 'audio/mp4',
        ptt: true 
      });
      fs.unlinkSync(media);
    } catch (error) {
      await reply('Gagal mengekstrak audio.');
    }
    return true;
  }

  // Shortlink
  if (command === 'shortlink') {
    const url = args[0];
    if (!url) {
      await reply('Contoh: .shortlink <url>\nContoh: .shortlink https://example.com/very-long-url');
      return true;
    }
    await reply(`🔗 *SHORTLINK*\n\nURL asli: ${url}\n\nShortlink: https://tinyurl.com/example\n\n*Note:* Implementasikan API shortlink Anda di sini.`);
    return true;
  }

  return false;
};
