const { getBuffer } = require('../lib/function.js');
const fs = require('fs-extra');
const path = require('path');

module.exports = async (sock, message) => {
  const { from, sender, command, args, reply, type } = message;

  // Sticker from image
  if (command === 'sticker') {
    if (type !== 'imageMessage') {
      await reply('Please send an image with caption .sticker');
      return true;
    }
    try {
      const media = await sock.downloadAndSaveMediaMessage(message.original);
      const sticker = await sock.sendMessage(from, { sticker: fs.readFileSync(media) });
      fs.unlinkSync(media);
    } catch (error) {
      await reply('Failed to create sticker.');
    }
    return true;
  }

  // Convert sticker to image
  if (command === 'toimg') {
    if (type !== 'stickerMessage') {
      await reply('Please send a sticker with caption .toimg');
      return true;
    }
    try {
      const media = await sock.downloadAndSaveMediaMessage(message.original);
      const image = await sock.sendMessage(from, { image: fs.readFileSync(media) });
      fs.unlinkSync(media);
    } catch (error) {
      await reply('Failed to convert sticker to image.');
    }
    return true;
  }

  // Extract audio from video/voice note
  if (command === 'toaudio') {
    if (type !== 'videoMessage' && type !== 'audioMessage') {
      await reply('Please send a video or voice note with caption .toaudio');
      return true;
    }
    try {
      const media = await sock.downloadAndSaveMediaMessage(message.original);
      const audio = await sock.sendMessage(from, { audio: fs.readFileSync(media), mimetype: 'audio/mp4' });
      fs.unlinkSync(media);
    } catch (error) {
      await reply('Failed to extract audio.');
    }
    return true;
  }

  // Shortlink (placeholder)
  if (command === 'shortlink') {
    const url = args[0];
    if (!url) {
      await reply('Please provide a URL to shorten.');
      return true;
    }
    await reply(`Shortened URL: https://tinyurl.com/placeholder\n\n*Note:* This is a placeholder. Implement your own shortlink logic.`);
    return true;
  }

  return false;
};
