const os = require('os');
const moment = require('moment-timezone');
const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, command, reply } = message;

  if (command === 'infobot' || command === 'botinfo' || command === 'about') {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const text = `*${config.name} Bot Info*\n\n` +
      `• Version: ${config.botInfo.version}\n` +
      `• Author: ${config.botInfo.author}\n` +
      `• Prefix: ${config.prefix}\n` +
      `• Owner: @${config.owner}\n` +
      `• Runtime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
      `• Platform: ${os.platform()} ${os.arch()}\n` +
      `• Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
      `• Node.js: ${process.version}\n` +
      `• Timezone: ${config.timezone}\n\n` +
      `_Powered by Baileys MD_`;

    await sock.sendMessage(from, { text, mentions: [config.owner] });
    return true;
  }

  return false;
};
