const os = require('os');
const moment = require('moment-timezone');
const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, command, reply } = message;

  if (command === 'ping' || command === 'speed') {
    const start = Date.now();
    const msg = await reply('Pinging...');
    const end = Date.now();
    const latency = end - start;

    const text = `*Pong!*\n\n• Latency: ${latency} ms\n• Runtime: ${process.uptime().toFixed(2)} seconds\n• Server: ${os.hostname()}`;
    await sock.sendMessage(from, { text }, { quoted: msg });
    return true;
  }

  if (command === 'runtime') {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const text = `*Runtime*\n\n${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds\n\nStarted: ${moment(Date.now() - uptime * 1000).tz(config.timezone).format('DD/MM/YYYY HH:mm:ss')}`;
    await reply(text);
    return true;
  }

  return false;
};
