const axios = require('axios');
const config = require('../config.js');

module.exports = async (sock, message) => {
  const { from, sender, command, args, reply } = message;

  // Fun menu utama
  if (command === 'fun') {
    const listMessage = {
      text: "🎮 *FUN & GAMES*\n\nPilih permainan yang tersedia:",
      title: "FUN MENU",
      buttonText: "Pilih Game",
      sections: [
        {
          title: "GAMES",
          rows: [
            { 
              title: "😂 JOKE", 
              description: "Dapatkan joke lucu", 
              rowId: `${config.prefix}joke` 
            },
            { 
              title: "🤔 TRUTH", 
              description: "Truth or dare - pertanyaan jujur", 
              rowId: `${config.prefix}truth` 
            },
            { 
              title: "💪 DARE", 
              description: "Truth or dare - tantangan", 
              rowId: `${config.prefix}dare` 
            },
            { 
              title: "⭐ RATE", 
              description: "Rating sesuatu", 
              rowId: `${config.prefix}rate` 
            }
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
      const { data } = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single&lang=id');
      await reply(`😂 *JOKE*\n\n${data.joke}`);
    } catch (error) {
      await reply('Gagal mengambil joke. Coba lagi nanti.');
    }
    return true;
  }

  // Truth
  if (command === 'truth') {
    const truths = [
      'Apa rahasia terbesar yang kamu sembunyikan dari keluarga?',
      'Pernahkah kamu menyontek saat ujian?',
      'Siapa orang yang paling kamu sukai di grup ini?',
      'Apa hal paling memalukan yang pernah kamu lakukan?',
      'Apa kebohongan terbesar yang pernah kamu katakan?',
      'Pernahkah kamu mencuri sesuatu?',
    ];
    const randomTruth = truths[Math.floor(Math.random() * truths.length)];
    await reply(`🤔 *TRUTH*\n\n${randomTruth}`);
    return true;
  }

  // Dare
  if (command === 'dare') {
    const dares = [
      'Kirim pesan "Aku mencintaimu" ke kontak terakhir di hp kamu.',
      'Ubah status WA menjadi "Aku sedang sakit" selama 1 jam.',
      'Telepon orang random dan nyanyikan lagu selamat ulang tahun.',
      'Posting foto masa kecilmu di status WA.',
      'Kirim voice note menyanyikan lagu nasional.',
      'Ganti nama di WA menjadi "Bocah Kematian" selama 1 jam.',
    ];
    const randomDare = dares[Math.floor(Math.random() * dares.length)];
    await reply(`💪 *DARE*\n\n${randomDare}`);
    return true;
  }

  // Rate
  if (command === 'rate') {
    const target = args.join(' ') || 'kamu';
    const rating = Math.floor(Math.random() * 101);
    let emoji = '⭐';
    
    if (rating >= 90) emoji = '🔥';
    else if (rating >= 70) emoji = '👍';
    else if (rating >= 50) emoji = '😐';
    else emoji = '👎';
    
    await reply(`⭐ *RATING*\n\nSaya memberikan ${target} rating:\n\n${emoji} *${rating}/100*`);
    return true;
  }

  return false;
};
