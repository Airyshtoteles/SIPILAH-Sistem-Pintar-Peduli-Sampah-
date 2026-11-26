/* ==========================================================================
   Leaderboard.js - Papan Skor Sesi Kelas Siswa SD
   Integrasi dbStore & LocalStorage
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  const STORAGE_KEY = 'sany_pilah_scores';

  class LeaderboardManager {
    static getScores() {
      if (window.dbStore && typeof window.dbStore.getActiveSesi === 'function') {
        const activeSesi = window.dbStore.getActiveSesi();
        if (activeSesi) {
          const results = window.dbStore.getHasilBySesi(activeSesi.id_sesi);
          if (results && results.length > 0) {
            return results.map(r => ({
              id: r.id_hasil,
              name: r.nama_siswa,
              score: r.skor_akhir,
              accuracy: r.akurasi_persen,
              dateFormatted: r.waktu_bermain
            }));
          }
        }
      }

      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    static saveScore(name, score, accuracy, date = new Date()) {
      const scores = this.getScores();
      const entry = {
        id: Date.now(),
        name: (name || 'Siswa Ciawilor').trim(),
        score: parseInt(score, 10) || 0,
        accuracy: parseInt(accuracy, 10) || 0,
        dateFormatted: new Date(date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      scores.push(entry);
      scores.sort((a, b) => b.score - a.score);
      const topScores = scores.slice(0, 20);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
      } catch (e) {}

      return entry;
    }

    static renderTable(tbodyElement) {
      if (!tbodyElement) return;

      const scores = this.getScores();

      let activeSesiInfo = '';
      if (window.dbStore && typeof window.dbStore.getActiveSesi === 'function') {
        const activeSesi = window.dbStore.getActiveSesi();
        if (activeSesi) {
          activeSesiInfo = `Sesi Aktif: ${activeSesi.nama_kelas} [${activeSesi.kode_sesi}]`;
        }
      }

      const infoContainer = document.getElementById('leaderboard-sesi-badge');
      if (infoContainer) {
        infoContainer.textContent = activeSesiInfo;
      }

      if (scores.length === 0) {
        tbodyElement.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: #64748b; padding: 24px;">
              Belum ada skor tersimpan pada sesi ini. Majulah menjadi siswa pertama yang bermain! 🚀
            </td>
          </tr>
        `;
        return;
      }

      tbodyElement.innerHTML = scores.map((item, index) => {
        let medal = `#${index + 1}`;
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';

        return `
          <tr>
            <td><strong style="font-size: 1.1rem;">${medal}</strong></td>
            <td><strong>${item.name}</strong></td>
            <td><span style="color: #10b981; font-weight: 700;">${item.score.toLocaleString('id-ID')} PTS</span></td>
            <td><small style="color: #64748b;">${item.dateFormatted}</small></td>
          </tr>
        `;
      }).join('');
    }
  }

  window.LeaderboardManager = LeaderboardManager;
})();
