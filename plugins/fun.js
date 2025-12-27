const axios = require('axios');
const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, command, args, reply } = message;

  // Tambah command .fun untuk List Message
  if (command === 'fun') {
    const listMessage = {
      text: "🎮 *FUN & GAMES*\n\nPilih permainan yang tersedia:",
      title: "FUN MENU",
      buttonText: "Pilih Game",
      sections: [
        {
          title: "GAMES",
          rows: [
            { title: "Joke", description: "Dapatkan joke lucu", rowId: `${config.prefix}joke` },
            { title: "Truth", description: "Truth or dare", rowId: `${config.prefix}truth` },
            { title: "Dare", description: "Tantangan seru", rowId: `${config.prefix}dare` },
            { title: "Rate", description: "Rating sesuatu", rowId: `${config.prefix}rate` },
          ]
        }
      ]
    };

    await sock.sendMessage(from, listMessage);
    return true;
  }

  // Joke
  if (command === 'joke') {
    try {
      const { data } = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
      await reply(data.joke);
    } catch (error) {
      await reply('Failed to fetch joke.');
    }
    return true;
  }

  // Truth
  if (command === 'truth') {
    const truths = [
      'Apa rahasia terbesar yang kamu sembunyikan dari keluarga?',
      'Pernahkah kamu menyontek saat ujian?',
      'Siapa orang yang paling kamu sukai di sini?',
      'Apa hal paling memalukan yang pernah kamu lakukan?',
    ];
    const randomTruth = truths[Math.floor(Math.random() * truths.length)];
    await reply(`*Truth:*\n${randomTruth}`);
    return true;
  }

  // Dare
  if (command === 'dare') {
    const dares = [
      'Kirim pesan ke kontak terakhir di hp kamu "Aku mencintaimu".',
      'Ubah status WA menjadi "Aku sedang sakit" selama 1 jam.',
      'Telepon orang random dan nyanyikan lagu selamat ulang tahun.',
      'Posting foto masa kecilmu di status WA.',
    ];
    const randomDare = dares[Math.floor(Math.random() * dares.length)];
    await reply(`*Dare:*\n${randomDare}`);
    return true;
  }

  // Rate
  if (command === 'rate') {
    const target = args[0] || 'you';
    const rating = Math.floor(Math.random() * 101);
    await reply(`I rate ${target} ${rating}/100.`);
    return true;
  }

  // Tebak gambar (placeholder)
  if (command === 'tebakgambar') {
    await reply('Fitur tebak gambar dalam pengembangan.');
    return true;
  }

  return false;
};
