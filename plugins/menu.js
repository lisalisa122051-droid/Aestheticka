const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, body, command, reply } = message;

  if (command === 'menu') {
    const buttons = [
      { buttonId: `${config.prefix}allmenu`, buttonText: { displayText: '📋 All Menu' }, type: 1 },
      { buttonId: `${config.prefix}ping`, buttonText: { displayText: '🚀 Ping' }, type: 1 },
      { buttonId: `${config.prefix}owner`, buttonText: { displayText: '👑 Owner' }, type: 1 },
      { buttonId: `${config.prefix}group`, buttonText: { displayText: '👥 Group' }, type: 1 },
    ];

    const buttonMessage = {
      text: `*${config.name} Bot Menu*\n\nHello @${sender}, I am a WhatsApp bot multi-device.\n\nUse the buttons below to explore features.`,
      footer: `Version: ${config.botInfo.version}`,
      buttons: buttons,
      mentions: [sender],
      headerType: 1,
    };

    await sock.sendMessage(from, buttonMessage);
    return true;
  }

  if (command === 'allmenu' || command === 'help') {
    const sections = [
      {
        title: '📱 Core',
        rows: [
          { title: 'Ping', rowId: `${config.prefix}ping` },
          { title: 'Speed', rowId: `${config.prefix}speed` },
          { title: 'Bot Info', rowId: `${config.prefix}infobot` },
        ],
      },
      {
        title: '🎉 Fun',
        rows: [
          { title: 'Joke', rowId: `${config.prefix}joke` },
          { title: 'Truth', rowId: `${config.prefix}truth` },
          { title: 'Dare', rowId: `${config.prefix}dare` },
          { title: 'Rate', rowId: `${config.prefix}rate` },
        ],
      },
      {
        title: '⬇️ Download',
        rows: [
          { title: 'Play', rowId: `${config.prefix}play` },
          { title: 'Youtube Video', rowId: `${config.prefix}ytvideo` },
          { title: 'TikTok', rowId: `${config.prefix}tiktok` },
          { title: 'Instagram', rowId: `${config.prefix}instagram` },
        ],
      },
      {
        title: '🛠️ Tools',
        rows: [
          { title: 'Sticker', rowId: `${config.prefix}sticker` },
          { title: 'To Image', rowId: `${config.prefix}toimg` },
          { title: 'To Audio', rowId: `${config.prefix}toaudio` },
          { title: 'Shortlink', rowId: `${config.prefix}shortlink` },
        ],
      },
      {
        title: '👥 Group',
        rows: [
          { title: 'Welcome On/Off', rowId: `${config.prefix}welcome` },
          { title: 'Set Name', rowId: `${config.prefix}setname` },
          { title: 'Set Desc', rowId: `${config.prefix}setdesc` },
          { title: 'Add', rowId: `${config.prefix}add` },
          { title: 'Kick', rowId: `${config.prefix}kick` },
        ],
      },
    ];

    const listMessage = {
      text: `*All Menu List*\n\nSelect a feature from the list below:`,
      footer: `Owner: @${config.owner}`,
      title: '📚 Menu Categories',
      buttonText: 'Open Menu',
      sections,
    };

    await sock.sendMessage(from, listMessage);
    return true;
  }

  return false;
};
