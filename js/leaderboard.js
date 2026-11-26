/* ==========================================================================
   leaderboard.js - Riwayat Sesi Permainan Siswa (6 Tabel Standar 3NF)
   Menampilkan rekapitulasi sesi bermain dari tabel `sesi_permainan`
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   Mitra: SDN 1 Ciawilor & SDN 2 Ciawilor
   ========================================================================== */

(function() {
  class LeaderboardManager {
    static getSesiList() {
      if (window.dbStore && typeof window.dbStore.getAllSesi === 'function') {
        const list = window.dbStore.getAllSesi();
        return list.slice().sort((a, b) => new Date(b.tanggal_sesi) - new Date(a.tanggal_sesi));
      }
      return [];
    }

    static renderTable(tbodyElement) {
      if (!tbodyElement) return;

      const sessions = this.getSesiList();

      if (sessions.length === 0) {
        tbodyElement.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: #64748b; padding: 28px;">
              <i class="fa-solid fa-gamepad" style="font-size: 1.8rem; color: #cbd5e1; margin-bottom: 8px; display: block;"></i>
              Belum ada riwayat sesi permainan tersimpan. Silakan pilih level dan mulai bermain!
            </td>
          </tr>
        `;
        return;
      }

      tbodyElement.innerHTML = sessions.map((s, index) => {
        let badgeColor = 'badge-success';
        if (s.akurasi_persen < 60) badgeColor = 'badge-danger';
        else if (s.akurasi_persen < 80) badgeColor = 'badge-warning';

        return `
          <tr>
            <td style="text-align: center; font-weight: 700; color: #64748b;">${index + 1}</td>
            <td>
              <span class="badge-level-chip">
                <i class="fa-solid fa-layer-group"></i> ${s.nama_level || `Level ${s.id_level}`}
              </span>
            </td>
            <td><strong class="text-green font-heading" style="font-size: 1.05rem;">${Number(s.skor_akhir).toLocaleString('id-ID')} PTS</strong></td>
            <td><span class="badge ${badgeColor}">${s.akurasi_persen}%</span></td>
            <td style="text-align: center;">
              <span class="text-green font-bold"><i class="fa-solid fa-check"></i> ${s.jumlah_benar}</span> &nbsp;/&nbsp;
              <span class="text-red font-bold"><i class="fa-solid fa-xmark"></i> ${s.jumlah_salah}</span>
            </td>
            <td style="font-size: 0.85rem; color: #475569;">${s.tanggal_sesi}</td>
            <td style="text-align: center;">
              <button class="btn btn-outline btn-sm btn-delete-sesi" data-id="${s.id_sesi}" title="Hapus rekaman sesi ini" style="color: #ef4444; border-color: #fca5a5; padding: 4px 8px;">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind delete single session
      const deleteBtns = tbodyElement.querySelectorAll('.btn-delete-sesi');
      deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const idSesi = btn.getAttribute('data-id');
          let ok = true;
          if (window.uiFeedback) {
            ok = await window.uiFeedback.confirm({
              title: 'Hapus Sesi Permainan?',
              message: `Apakah Bapak/Ibu Guru yakin ingin menghapus data sesi permainan #${idSesi}? Tindakan ini tidak dapat dibatalkan.`,
              confirmText: 'Ya, Hapus',
              cancelText: 'Batal',
              type: 'danger'
            });
          }
          if (ok) {
            if (window.dbStore && typeof window.dbStore.deleteSesi === 'function') {
              window.dbStore.deleteSesi(idSesi);
              if (window.uiFeedback) window.uiFeedback.toast('Sesi permainan berhasil dihapus!', 'info');
              LeaderboardManager.renderTable(tbodyElement);
            }
          }
        });
      });
    }

    static initClearAllButton(tbodyElement) {
      const clearBtn = document.getElementById('btn-clear-all-sessions');
      if (clearBtn) {
        clearBtn.onclick = async () => {
          let ok = true;
          if (window.uiFeedback) {
            ok = await window.uiFeedback.confirm({
              title: 'Bersihkan Seluruh Riwayat Sesi?',
              message: 'Semua rekapitulasi nilai sesi bermain akan dihapus permanen agar memori penyimpanan tetap bersih. Apakah Anda yakin?',
              confirmText: 'Ya, Bersihkan Semua',
              cancelText: 'Batal',
              type: 'danger'
            });
          }
          if (ok) {
            if (window.dbStore && typeof window.dbStore.resetAllSesi === 'function') {
              window.dbStore.resetAllSesi();
              if (window.uiFeedback) window.uiFeedback.toast('Seluruh riwayat sesi permainan berhasil dibersihkan!', 'success');
              LeaderboardManager.renderTable(tbodyElement);
            }
          }
        };
      }
    }
  }

  window.LeaderboardManager = LeaderboardManager;
})();
