// Vercel Serverless Function: API Status & Health Check
module.exports = (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'SIPILAH - Game Edukasi Pemilahan Sampah Interaktif',
    team: 'Kelompok 05 - SANY (Teknik Informatika UNIKU)',
    partners: ['SDN 1 Ciawilor', 'SDN 2 Ciawilor'],
    program: 'SEMUTLIS (Sepuluh Menit Peduli Lingkungan Sekitar)',
    timestamp: new Date().toISOString()
  });
};
