const config = require('../config.js');
const database = require('../lib/database.js');

module.exports = async (sock, message) => {
  const { from, sender, command, args, reply, isOwner } = message;

  if (!isOwner) return false;

  if (command === 'owner') {
    const text = `*Owner Commands*\n\n` +
      `• ${config.prefix}self - Switch to self mode\n` +
      `• ${config.prefix}public - Switch to public mode\n` +
      `• ${config.prefix}restart - Restart bot\n` +
      `• ${config.prefix}eval <code> - Evaluate code`;
    await reply(text);
    return true;
  }

  if (command === 'self') {
    database.updateSettings({ public: false });
    await reply('Bot switched to *self* mode (only owner can use).');
    return true;
  }

  if (command === 'public') {
    database.updateSettings({ public: true });
    await reply('Bot switched to *public* mode (everyone can use).');
    return true;
  }

  if (command === 'restart') {
    await reply('Restarting bot...');
    process.exit(0);
    return true;
  }

  if (command === 'eval') {
    try {
      const code = args.join(' ');
      let result = eval(code);
      if (typeof result !== 'string') result = require('util').inspect(result);
      await reply(`*Result:*\n\`\`\`${result}\`\`\``);
    } catch (error) {
      await reply(`*Error:*\n\`\`\`${error}\`\`\``);
    }
    return true;
  }

  return false;
};
