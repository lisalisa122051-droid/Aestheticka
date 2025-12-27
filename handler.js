const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const { isOwner, isGroup, normalizePhoneNumber } = require('./lib/jidUtils.js');
const database = require('./lib/database.js');

// Load all plugins
const plugins = {};
const pluginFolder = path.join(__dirname, 'plugins');
const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

for (const file of pluginFiles) {
  const pluginName = file.replace('.js', '');
  plugins[pluginName] = require(path.join(pluginFolder, file));
}

async function startHandler(sock, message) {
  const { body, sender, from, isGroup, isBot, isOwner, command, args } = message;

  // Ignore messages from bot itself
  if (isBot) return;

  // Check if message starts with prefix
  if (!body || !body.startsWith(config.prefix)) return;

  // Parse command and arguments
  const cmd = body.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase();
  const arg = body.slice(config.prefix.length + cmd.length).trim();
  const argsList = arg.split(/ +/);

  // Update message object
  message.command = cmd;
  message.args = argsList;
  message.fullArg = arg;

  // Check if command exists in plugins
  let commandExecuted = false;
  for (const pluginName in plugins) {
    const plugin = plugins[pluginName];
    if (typeof plugin === 'function') {
      const result = await plugin(sock, message);
      if (result === true) {
        commandExecuted = true;
        break;
      }
    }
  }

  // If command not found
  if (!commandExecuted) {
    // Optional: send default message
    // await sock.sendMessage(from, { text: 'Command not found.' }, { quoted: message });
  }
}

module.exports = { startHandler };
