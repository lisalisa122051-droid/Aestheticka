const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, body, command, reply } = message;

  if (command === 'menu') {
    // Buat List Message dengan sections
    const sections = [
      {
        title: "📱 MAIN MENU",
        rows: [
          {
            title: "📋 ALL MENU",
            description: "Lihat semua menu yang tersedia",
            rowId: `${config.prefix}allmenu`
          },
          {
            title: "🚀 PING",
            description: "Cek kecepatan respon bot",
            rowId: `${config.prefix}ping`
          },
          {
            title: "👑 OWNER",
            description: "Menu khusus pemilik bot",
            rowId: `${config.prefix}owner`
          },
          {
            title: "👥 GROUP",
            description: "Pengaturan grup",
            rowId: `${config.prefix}group`
          },
          {
            title: "🎉 FUN",
            description: "Fitur hiburan & games",
            rowId: `${config.prefix}fun`
          },
          {
            title: "⬇️ DOWNLOAD",
            description: "Download video/audio",
            rowId: `${config.prefix}download`
          },
          {
            title: "🛠️ TOOLS",
            description: "Alat & utilitas",
            rowId: `${config.prefix}tools`
          },
          {
            title: "⚙️ SETTINGS",
            description: "Pengaturan bot",
            rowId: `${config.prefix}settings`
          }
        ]
      }
    ];

    // Kirim List Message
    const listMessage = {
      text: `*${config.name} BOT*\n\nHalo @${sender}, selamat datang di bot WhatsApp multi-device!\n\n*Silakan pilih menu di bawah:*`,
      footer: `Versi: ${config.botInfo.version}`,
      title: "MENU UTAMA",
      buttonText: "Buka Menu",
      sections: sections,
      mentions: [sender]
    };

    await sock.sendMessage(from, listMessage);
    return true;
  }

  if (command === 'allmenu' || command === 'help') {
    // Buat List Message dengan multiple sections
    const sections = [
      {
        title: "📱 CORE",
        rows: [
          { title: "Ping", description: "Cek respon bot", rowId: `${config.prefix}ping` },
          { title: "Speed", description: "Test kecepatan", rowId: `${config.prefix}speed` },
          { title: "Runtime", description: "Waktu aktif bot", rowId: `${config.prefix}runtime` },
          { title: "Bot Info", description: "Informasi bot", rowId: `${config.prefix}infobot` },
        ],
      },
      {
        title: "🎉 FUN",
        rows: [
          { title: "Joke", description: "Cerita lucu", rowId: `${config.prefix}joke` },
          { title: "Truth", description: "Pertanyaan jujur", rowId: `${config.prefix}truth` },
          { title: "Dare", description: "Tantangan", rowId: `${config.prefix}dare` },
          { title: "Rate", description: "Rating sesuatu", rowId: `${config.prefix}rate` },
        ],
      },
      {
        title: "⬇️ DOWNLOAD",
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
          { title: "Sticker", description: "Buat stiker", rowId: `${config.prefix}sticker` },
          { title: "To Image", description: "Stiker ke gambar", rowId: `${config.prefix}toimg` },
          { title: "To Audio", description: "Ekstrak audio", rowId: `${config.prefix}toaudio` },
          { title: "Shortlink", description: "Pendekkan URL", rowId: `${config.prefix}shortlink` },
        ],
      },
      {
        title: "👥 GROUP",
        rows: [
          { title: "Welcome", description: "Aktifkan welcome", rowId: `${config.prefix}welcome on` },
          { title: "Set Name", description: "Ubah nama grup", rowId: `${config.prefix}setname` },
          { title: "Set Desc", description: "Ubah deskripsi", rowId: `${config.prefix}setdesc` },
          { title: "Add Member", description: "Tambah anggota", rowId: `${config.prefix}add` },
        ],
      },
      {
        title: "🛡️ ADMIN",
        rows: [
          { title: "Promote", description: "Jadikan admin", rowId: `${config.prefix}promote` },
          { title: "Demote", description: "Turunkan admin", rowId: `${config.prefix}demote` },
          { title: "Kick", description: "Keluarkan anggota", rowId: `${config.prefix}kick` },
          { title: "Antilink", description: "Anti link grup", rowId: `${config.prefix}antilink on` },
        ],
      }
    ];

    const listMessage = {
      text: `*📚 ALL MENU LIST*\n\nTotal: ${sections.reduce((acc, sec) => acc + sec.rows.length, 0)} commands\n\nPilih kategori:`,
      footer: `Owner: @${config.owner}`,
      title: "KATEGORI MENU",
      buttonText: "Pilih Kategori",
      sections: sections,
    };

    await sock.sendMessage(from, listMessage);
    return true;
  }

  // Command untuk menampilkan contoh List Message minimalis (seperti yang diminta)
  if (command === 'menusimple') {
    const listMessage = {
      text: `Kamu bisa klik menu dibawah ini untuk melihat menu secara lengkap...`,
      title: "MENU UTAMA",
      buttonText: "Buka Menu",
      sections: [
        {
          title: "PILIH MENU",
          rows: [
            { title: "All Menu", rowId: `${config.prefix}allmenu` },
            { title: "Ping", rowId: `${config.prefix}ping` },
            { title: "Owner", rowId: `${config.prefix}owner` },
            { title: "Group", rowId: `${config.prefix}group` },
          ]
        }
      ]
    };

    await sock.sendMessage(from, listMessage);
    return true;
  }

  return false;
};
