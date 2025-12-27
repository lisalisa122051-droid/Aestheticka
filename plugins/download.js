const axios = require('axios');
const path = require('path');
const { getBuffer } = require(path.join(__dirname, '..', 'lib', 'function.js'));
const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, command, args, reply } = message;

  // Command .download untuk List Message
  if (command === 'download') {
    const listMessage = {
      text: "⬇️ *DOWNLOAD MENU*\n\nPilih platform download:",
      title: "DOWNLOAD",
      buttonText: "Pilih Platform",
      sections: [
        {
          title: "VIDEO/AUDIO",
          rows: [
            { title: "YouTube Video", description: "Download video YouTube", rowId: `${config.prefix}ytvideo` },
            { title: "TikTok Video", description: "Download video TikTok", rowId: `${config.prefix}tiktok` },
            { title: "Instagram", description: "Download IG video/foto", rowId: `${config.prefix}instagram` },
            { title: "Play", description: "Pilih audio/video", rowId: `${config.prefix}play` },
          ]
        }
      ]
    };

    await sock.sendMessage(from, listMessage);
    return true;
  }

  // Play (button selector) - tetap dipertahankan
  if (command === 'play') {
    const buttons = [
      { buttonId: `${command} audio`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
      { buttonId: `${command} video`, buttonText: { displayText: '🎬 Video' }, type: 1 },
    ];
    const buttonMessage = {
      text: 'Select download type:',
      footer: 'YouTube Downloader',
      buttons: buttons,
      headerType: 1,
    };
    await sock.sendMessage(from, buttonMessage);
    return true;
  }

  // YouTube video download (placeholder)
  if (command === 'ytvideo') {
    const query = args.join(' ');
    if (!query) {
      await reply('Please provide a search query.');
      return true;
    }
    await reply(`Downloading video for: ${query}\n\n*Note:* This is a placeholder. Implement your own download logic.`);
    return true;
  }

  // TikTok download (placeholder)
  if (command === 'tiktok') {
    const url = args[0];
    if (!url) {
      await reply('Please provide a TikTok URL.');
      return true;
    }
    await reply(`Downloading TikTok from: ${url}\n\n*Note:* This is a placeholder. Implement your own download logic.`);
    return true;
  }

  // Instagram download (placeholder)
  if (command === 'instagram') {
    const url = args[0];
    if (!url) {
      await reply('Please provide an Instagram URL.');
      return true;
    }
    await reply(`Downloading Instagram from: ${url}\n\n*Note:* This is a placeholder. Implement your own download logic.`);
    return true;
  }

  return false;
};
