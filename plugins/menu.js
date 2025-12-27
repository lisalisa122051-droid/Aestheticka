const config = require('../config.js');

module.exports = async (sock, message) => {
    const { from, sender, command, sendListMessage, reply } = message;

    // Command .menu - Main List Message
    if (command === 'menu') {
        const listMessage = {
            text: `🤖 *${config.name} BOT*\n\nHello @${sender}, I am a WhatsApp Multi-Device Bot.\n\n*Please select a menu below:*`,
            footer: `Version: ${config.botInfo.version}`,
            title: "📱 MAIN MENU",
            buttonText: "OPEN MENU",
            sections: [
                {
                    title: "🎯 MAIN OPTIONS",
                    rows: [
                        {
                            title: "📋 ALL MENUS",
                            description: "View all available menus",
                            rowId: `${config.prefix}allmenu`
                        },
                        {
                            title: "🚀 PING & STATUS",
                            description: "Check bot speed & status",
                            rowId: `${config.prefix}ping`
                        },
                        {
                            title: "👑 OWNER MENU",
                            description: "Bot owner exclusive menu",
                            rowId: `${config.prefix}owner`
                        },
                        {
                            title: "👥 GROUP MENU",
                            description: "Group management tools",
                            rowId: `${config.prefix}group`
                        }
                    ]
                }
            ]
        };

        await sendListMessage(listMessage);
        return true;
    }

    // Command .allmenu - All menus in List Message
    if (command === 'allmenu' || command === 'help') {
        const sections = [
            {
                title: "📊 CORE & INFO",
                rows: [
                    { title: "Ping", description: "Check bot response", rowId: `${config.prefix}ping` },
                    { title: "Speed", description: "Test bot speed", rowId: `${config.prefix}speed` },
                    { title: "Runtime", description: "Bot uptime", rowId: `${config.prefix}runtime` },
                    { title: "Bot Info", description: "Bot information", rowId: `${config.prefix}infobot` },
                ],
            },
            {
                title: "🎮 FUN & GAMES",
                rows: [
                    { title: "Joke", description: "Get random jokes", rowId: `${config.prefix}joke` },
                    { title: "Truth", description: "Truth questions", rowId: `${config.prefix}truth` },
                    { title: "Dare", description: "Dare challenges", rowId: `${config.prefix}dare` },
                    { title: "Rate", description: "Rate something", rowId: `${config.prefix}rate` },
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
                    { title: "Sticker", description: "Create sticker", rowId: `${config.prefix}sticker` },
                    { title: "To Image", description: "Sticker to image", rowId: `${config.prefix}toimg` },
                    { title: "To Audio", description: "Extract audio", rowId: `${config.prefix}toaudio` },
                    { title: "Shortlink", description: "Shorten URL", rowId: `${config.prefix}shortlink` },
                ],
            },
            {
                title: "👥 GROUP",
                rows: [
                    { title: "Welcome On/Off", description: "Welcome message", rowId: `${config.prefix}welcome` },
                    { title: "Set Name", description: "Change group name", rowId: `${config.prefix}setname` },
                    { title: "Set Desc", description: "Change description", rowId: `${config.prefix}setdesc` },
                    { title: "Add Member", description: "Add members", rowId: `${config.prefix}add` },
                ],
            }
        ];

        const listMessage = {
            text: `*📚 ALL MENU LIST*\n\nTotal: ${sections.reduce((acc, sec) => acc + sec.rows.length, 0)} commands\n\nSelect a category:`,
            footer: `Prefix: ${config.prefix}`,
            title: "📋 MENU CATEGORIES",
            buttonText: "SELECT CATEGORY",
            sections: sections,
        };

        await sendListMessage(listMessage);
        return true;
    }

    return false;
};
