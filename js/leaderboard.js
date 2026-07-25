/* ==========================================================================
   Leaderboard.js - LocalStorage Score Manager
   Global Window Compatibility
   ========================================================================== */

(function() {
  const STORAGE_KEY = 'hima_ti_ecosorter_scores';

  class LeaderboardManager {
    static getScores() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Failed to read leaderboard scores:', e);
        return [];
      }
    }

    static saveScore(name, score, accuracy, date = new Date()) {
      const scores = this.getScores();
      const entry = {
        id: Date.now(),
        name: (name || 'Pahlawan Sampah').trim(),
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

      // Sort descending by score
      scores.sort((a, b) => b.score - a.score);

      // Keep top 20 scores
      const topScores = scores.slice(0, 20);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
      } catch (e) {
        console.error('Failed to save score:', e);
      }

      return entry;
    }

    static renderTable(tbodyElement) {
      if (!tbodyElement) return;

      const scores = this.getScores();

      if (scores.length === 0) {
        tbodyElement.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: #64748b; padding: 24px;">
              Belum ada skor tersimpan. Jadilah siswa pertama yang bermain! 🚀
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
