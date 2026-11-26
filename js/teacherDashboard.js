/* ==========================================================================
   teacherDashboard.js - Teacher Mode & Assessment Dashboard Controller
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   Mitra: SDN 1 Ciawilor & SDN 2 Ciawilor | Program SEMUTLIS
   ========================================================================== */

(function() {
  class TeacherDashboardController {
    constructor() {
      this.currentTab = 'tab-sesi';
      this.selectedRaporSesiId = null;
      this.editingItemId = null;
      this.initEvents();
    }

    initEvents() {
      // 1. Tombol Buka Modal Login Guru dari Menu Utama
      const btnOpenLogin = document.getElementById('btn-open-teacher-login');
      if (btnOpenLogin) {
        btnOpenLogin.addEventListener('click', () => {
          this.openLoginModal();
        });
      }

      // 2. Tombol Quick Demo Login
      const btnDemoAgung = document.getElementById('btn-demo-login-agung');
      if (btnDemoAgung) {
        btnDemoAgung.addEventListener('click', () => {
          this.quickLogin('agung_sdn1', 'guru123');
        });
      }

      const btnDemoTris = document.getElementById('btn-demo-login-tris');
      if (btnDemoTris) {
        btnDemoTris.addEventListener('click', () => {
          this.quickLogin('tris_sdn2', 'guru123');
        });
      }

      // Form Login Manual
      const formLogin = document.getElementById('form-teacher-login');
      if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
          e.preventDefault();
          const u = document.getElementById('input-teacher-username').value;
          const p = document.getElementById('input-teacher-password').value;
          this.performLogin(u, p);
        });
      }

      const btnCloseLogin = document.getElementById('btn-close-teacher-login');
      if (btnCloseLogin) {
        btnCloseLogin.addEventListener('click', () => {
          document.getElementById('modal-teacher-login').classList.add('hidden');
        });
      }

      // 3. Tombol di Header Dashboard Guru
      const btnBackGame = document.getElementById('btn-teacher-back-game');
      if (btnBackGame) {
        btnBackGame.addEventListener('click', () => {
          this.closeTeacherDashboard();
        });
      }

      const btnLogout = document.getElementById('btn-teacher-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          if (confirm('Apakah Bapak/Ibu Guru yakin ingin keluar dari Mode Guru?')) {
            window.dbStore.teacherLogout();
            this.closeTeacherDashboard();
            this.updateActiveSesiBadges();
            alert('Berhasil keluar dari Mode Guru.');
          }
        });
      }

      // 4. Tab Navigation di Dashboard Guru
      const tabBtns = document.querySelectorAll('.teacher-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-tab');
          this.switchTab(targetTab);
        });
      });

      // 5. Tab 1 - Sesi Kelas Form Submit
      const formNewSesi = document.getElementById('form-create-sesi');
      if (formNewSesi) {
        formNewSesi.addEventListener('submit', (e) => {
          e.preventDefault();
          const namaKelas = document.getElementById('input-sesi-nama').value;
          const kodeSesi = document.getElementById('input-sesi-kode').value;
          const teacher = window.dbStore.getCurrentTeacher();
          const idGuru = teacher ? teacher.id_guru : 1;

          const res = window.dbStore.createSesi(namaKelas, kodeSesi, idGuru);
          if (res.success) {
            alert(`Sesi "${namaKelas}" (${kodeSesi.toUpperCase()}) berhasil dibuat dan diaktifkan!`);
            formNewSesi.reset();
            this.renderSesiTab();
            this.updateActiveSesiBadges();
          } else {
            alert(res.message);
          }
        });
      }

      // 6. Tab 2 - Rapor Dropdown Selector & Ekspor CSV
      const selectRapor = document.getElementById('select-rapor-sesi');
      if (selectRapor) {
        selectRapor.addEventListener('change', () => {
          this.selectedRaporSesiId = Number(selectRapor.value);
          this.renderRaporTab();
        });
      }

      const btnExportCsv = document.getElementById('btn-export-rapor-csv');
      if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
          const sesiId = this.selectedRaporSesiId || (window.dbStore.getActiveSesi() ? window.dbStore.getActiveSesi().id_sesi : 1);
          window.dbStore.exportSesiReportCSV(sesiId);
        });
      }

      // 7. Tab 3 - Bank Sampah Add & Reset Buttons
      const btnAddNewItem = document.getElementById('btn-add-item-modal');
      if (btnAddNewItem) {
        btnAddNewItem.addEventListener('click', () => {
          this.openItemModal(null);
        });
      }

      const btnResetItems = document.getElementById('btn-reset-items-default');
      if (btnResetItems) {
        btnResetItems.addEventListener('click', () => {
          if (confirm('Kembalikan seluruh Bank Sampah ke 16 item standar bawaan sistem?')) {
            window.dbStore.resetItemsToDefault();
            this.renderBankSampahTab();
            alert('Bank Sampah berhasil dikembalikan ke default!');
          }
        });
      }

      // Item Modal Form Submit
      const formItem = document.getElementById('form-item-editor');
      if (formItem) {
        formItem.addEventListener('submit', (e) => {
          e.preventDefault();
          this.saveItemFromModal();
        });
      }

      const btnCloseItemModal = document.getElementById('btn-close-item-modal');
      if (btnCloseItemModal) {
        btnCloseItemModal.addEventListener('click', () => {
          document.getElementById('modal-item-editor').classList.add('hidden');
        });
      }

      // Student Log Modal Close
      const btnCloseStudentLog = document.getElementById('btn-close-student-log');
      if (btnCloseStudentLog) {
        btnCloseStudentLog.addEventListener('click', () => {
          document.getElementById('modal-student-log').classList.add('hidden');
        });
      }

      // Cloud Database Config Modal Events
      const btnOpenCloud = document.getElementById('btn-open-cloud-config');
      if (btnOpenCloud) {
        btnOpenCloud.addEventListener('click', () => {
          const modal = document.getElementById('modal-cloud-config');
          const cfg = (window.cloudDB && window.cloudDB.config) ? window.cloudDB.config : { url: '', anonKey: '' };
          const inUrl = document.getElementById('input-cloud-url');
          const inKey = document.getElementById('input-cloud-key');
          if (inUrl) inUrl.value = cfg.url || '';
          if (inKey) inKey.value = cfg.anonKey || '';
          if (modal) modal.classList.remove('hidden');
        });
      }

      const btnCloseCloud = document.getElementById('btn-close-cloud-config');
      if (btnCloseCloud) {
        btnCloseCloud.addEventListener('click', () => {
          const modal = document.getElementById('modal-cloud-config');
          if (modal) modal.classList.add('hidden');
        });
      }

      const formCloud = document.getElementById('form-cloud-config');
      if (formCloud) {
        formCloud.addEventListener('submit', async (e) => {
          e.preventDefault();
          const url = document.getElementById('input-cloud-url').value;
          const key = document.getElementById('input-cloud-key').value;
          if (window.cloudDB) {
            const ok = await window.cloudDB.saveConfig(url, key);
            if (ok) {
              alert('Alhamdulillah! Koneksi ke Cloud Database Supabase BERHASIL terhubung!');
            } else {
              alert('Konfigurasi disimpan. Game tetap aman menyimpan secara lokal jika cloud belum aktif.');
            }
          }
          const modal = document.getElementById('modal-cloud-config');
          if (modal) modal.classList.add('hidden');
        });
      }

      // Initial Update Badges
      this.updateActiveSesiBadges();
      if (window.cloudDB && typeof window.cloudDB.updateBadgeUI === 'function') {
        window.cloudDB.updateBadgeUI();
      }
    }

    openLoginModal() {
      const teacher = window.dbStore.getCurrentTeacher();
      if (teacher) {
        // Langsung masuk jika sudah login
        this.openTeacherDashboard();
      } else {
        const modal = document.getElementById('modal-teacher-login');
        if (modal) modal.classList.remove('hidden');
      }
    }

    quickLogin(username, password) {
      this.performLogin(username, password);
    }

    performLogin(username, password) {
      const res = window.dbStore.teacherLogin(username, password);
      if (res.success) {
        const modal = document.getElementById('modal-teacher-login');
        if (modal) modal.classList.add('hidden');
        this.openTeacherDashboard();
      } else {
        alert(res.message);
      }
    }

    openTeacherDashboard() {
      const teacher = window.dbStore.getCurrentTeacher() || { nama_guru: 'Bapak Guru', asal_sekolah: 'SDN Ciawilor' };

      // Update Header Info
      const nameEl = document.getElementById('teacher-profile-name');
      const schoolEl = document.getElementById('teacher-profile-school');
      if (nameEl) nameEl.textContent = teacher.nama_guru;
      if (schoolEl) schoolEl.textContent = teacher.asal_sekolah;

      this.updateActiveSesiBadges();

      // Show Screen
      if (window.appInstance && typeof window.appInstance.showScreen === 'function') {
        window.appInstance.showScreen('screen-teacher');
      }

      // Render Active Tab
      this.switchTab(this.currentTab || 'tab-sesi');
    }

    closeTeacherDashboard() {
      this.updateActiveSesiBadges();
      if (window.appInstance && typeof window.appInstance.showScreen === 'function') {
        window.appInstance.showScreen('screen-menu');
      }
    }

    updateActiveSesiBadges() {
      const activeSesi = window.dbStore.getActiveSesi();
      const code = activeSesi ? activeSesi.kode_sesi : 'CIAWI-2A';
      const name = activeSesi ? activeSesi.nama_kelas : 'Kelas 2A - SEMUTLIS';

      // Menu Screen Badge
      const menuSesiLabel = document.getElementById('menu-sesi-label');
      if (menuSesiLabel) menuSesiLabel.textContent = `${name} [${code}]`;

      // HUD Chip
      const hudSesiCode = document.getElementById('hud-sesi-code');
      if (hudSesiCode) hudSesiCode.textContent = code;

      // GameOver Screen
      const gameOverSesiName = document.getElementById('gameover-sesi-name');
      if (gameOverSesiName) gameOverSesiName.textContent = `${name} (${code})`;

      // Teacher Screen Header
      const teacherActiveSesiName = document.getElementById('teacher-active-sesi-name');
      if (teacherActiveSesiName) teacherActiveSesiName.textContent = `${name} [${code}]`;
    }

    switchTab(tabId) {
      this.currentTab = tabId;

      // Update Tab Buttons UI
      document.querySelectorAll('.teacher-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Update Tab Content Panes UI
      document.querySelectorAll('.teacher-tab-pane').forEach(pane => {
        if (pane.id === tabId) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });

      // Render data for active tab
      if (tabId === 'tab-sesi') this.renderSesiTab();
      else if (tabId === 'tab-rapor') this.renderRaporTab();
      else if (tabId === 'tab-banksampah') this.renderBankSampahTab();
    }

    // ==========================================
    // RENDER TAB 1: SESI KELAS
    // ==========================================
    renderSesiTab() {
      const tbody = document.getElementById('sesi-table-tbody');
      if (!tbody) return;

      const sesiList = window.dbStore.getAllSesi();
      const activeSesi = window.dbStore.getActiveSesi();
      const activeId = activeSesi ? activeSesi.id_sesi : null;

      if (sesiList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">Belum ada sesi kelas. Silakan buat sesi baru di atas!</td></tr>`;
        return;
      }

      tbody.innerHTML = sesiList.map(s => {
        const isCurrentActive = (s.id_sesi === activeId);
        const statusBadge = isCurrentActive
          ? `<span class="badge-status-pill active"><i class="fa-solid fa-circle-play"></i> Sesi Aktif</span>`
          : (s.status_sesi === 'aktif'
              ? `<span class="badge-status-pill open">Terbuka</span>`
              : `<span class="badge-status-pill closed">Selesai</span>`);

        return `
          <tr class="${isCurrentActive ? 'row-active-sesi' : ''}">
            <td><strong>${s.kode_sesi}</strong></td>
            <td><strong>${s.nama_kelas}</strong></td>
            <td>${s.tanggal_sesi}</td>
            <td><small>${s.nama_guru} (${s.asal_sekolah})</small></td>
            <td><span class="badge-count">${s.jumlah_siswa} Siswa</span></td>
            <td>${statusBadge}</td>
            <td class="action-buttons-cell">
              ${!isCurrentActive ? `
                <button class="btn btn-sm btn-success btn-set-active-sesi" data-id="${s.id_sesi}" title="Gunakan Sesi Ini di Game">
                  <i class="fa-solid fa-check"></i> Aktifkan
                </button>
              ` : `
                <span class="btn btn-sm btn-outline disabled" style="opacity:0.6; cursor:default;">
                  <i class="fa-solid fa-star text-gold"></i> Sedang Dipakai
                </span>
              `}
              <button class="btn btn-sm btn-outline btn-toggle-status-sesi" data-id="${s.id_sesi}" title="Ubah Status Aktif/Selesai">
                <i class="fa-solid fa-power-off"></i>
              </button>
              <button class="btn btn-sm btn-danger btn-delete-sesi" data-id="${s.id_sesi}" title="Hapus Sesi">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind Action Buttons
      tbody.querySelectorAll('.btn-set-active-sesi').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = Number(e.currentTarget.getAttribute('data-id'));
          window.dbStore.setActiveSesi(id);
          this.renderSesiTab();
          this.updateActiveSesiBadges();
        });
      });

      tbody.querySelectorAll('.btn-toggle-status-sesi').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = Number(e.currentTarget.getAttribute('data-id'));
          window.dbStore.toggleSesiStatus(id);
          this.renderSesiTab();
          this.updateActiveSesiBadges();
        });
      });

      tbody.querySelectorAll('.btn-delete-sesi').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = Number(e.currentTarget.getAttribute('data-id'));
          if (confirm('Hapus sesi kelas ini beserta seluruh rekap nilai siswa di dalamnya?')) {
            const res = window.dbStore.deleteSesi(id);
            if (!res.success) {
              alert(res.message);
            } else {
              this.renderSesiTab();
              this.updateActiveSesiBadges();
            }
          }
        });
      });
    }

    // ==========================================
    // RENDER TAB 2: RAPOR & ANALISIS PEMAHAMAN
    // ==========================================
    renderRaporTab() {
      const selectRapor = document.getElementById('select-rapor-sesi');
      const sesiList = window.dbStore.getAllSesi();
      const activeSesi = window.dbStore.getActiveSesi();

      if (!this.selectedRaporSesiId) {
        this.selectedRaporSesiId = activeSesi ? activeSesi.id_sesi : (sesiList[0] ? sesiList[0].id_sesi : 1);
      }

      // Populate Select Options
      if (selectRapor) {
        selectRapor.innerHTML = sesiList.map(s => {
          return `<option value="${s.id_sesi}" ${s.id_sesi === this.selectedRaporSesiId ? 'selected' : ''}>
            ${s.nama_kelas} (${s.kode_sesi}) — ${s.jumlah_siswa} Siswa
          </option>`;
        }).join('');
      }

      const report = window.dbStore.getSesiReportSummary(this.selectedRaporSesiId);

      // 4 KPI Summary Cards
      const kpiTotalSiswa = document.getElementById('kpi-total-siswa');
      const kpiAvgScore = document.getElementById('kpi-avg-score');
      const kpiAvgAcc = document.getElementById('kpi-avg-accuracy');
      const kpiMistakenItem = document.getElementById('kpi-mistaken-item');
      const kpiMistakenSub = document.getElementById('kpi-mistaken-sub');

      if (kpiTotalSiswa) kpiTotalSiswa.textContent = report.totalSiswa;
      if (kpiAvgScore) kpiAvgScore.textContent = `${report.avgScore.toLocaleString('id-ID')} PTS`;
      if (kpiAvgAcc) kpiAvgAcc.textContent = `${report.avgAccuracy}%`;
      if (kpiMistakenItem) kpiMistakenItem.textContent = report.mostMistakenItem.nama_item;
      if (kpiMistakenSub) {
        kpiMistakenSub.textContent = report.mostMistakenItem.count > 0
          ? `${report.mostMistakenItem.count} kali salah dipilah (${report.mostMistakenItem.categoryName || 'Perhatikan Kategori'})`
          : 'Semua siswa memilah dengan tepat!';
      }

      // Table Rekap Siswa
      const tbody = document.getElementById('rapor-table-tbody');
      if (!tbody) return;

      if (report.studentList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#64748b;">Belum ada siswa yang menyelesaikan permainan pada sesi kelas ini.</td></tr>`;
        return;
      }

      tbody.innerHTML = report.studentList.map(s => {
        let certBadge = s.status_sertifikat === 'diklaim'
          ? `<span class="badge-cert-status claimed"><i class="fa-solid fa-check"></i> Dicetak</span>`
          : `<span class="badge-cert-status unclaimed"><i class="fa-solid fa-clock"></i> Belum Cetak</span>`;

        return `
          <tr>
            <td><strong>#${s.rank}</strong></td>
            <td><strong>${s.nama_siswa}</strong></td>
            <td><span class="text-green font-bold">${s.skor_akhir.toLocaleString('id-ID')} PTS</span></td>
            <td><strong>${s.akurasi_persen}%</strong></td>
            <td>x${s.max_combo}</td>
            <td><span class="badge-predicate ${s.predikatClass}">${s.predikat}</span></td>
            <td>${certBadge}</td>
            <td><small>${s.waktu_bermain}</small></td>
            <td>
              <button class="btn btn-sm btn-outline btn-view-student-log" data-id="${s.id_hasil}" data-name="${s.nama_siswa}">
                <i class="fa-solid fa-list-check"></i> Log Pilah
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.btn-view-student-log').forEach(b => {
        b.addEventListener('click', (e) => {
          const idHasil = Number(e.currentTarget.getAttribute('data-id'));
          const sName = e.currentTarget.getAttribute('data-name');
          this.openStudentLogModal(idHasil, sName);
        });
      });
    }

    openStudentLogModal(idHasil, studentName) {
      const modal = document.getElementById('modal-student-log');
      const titleName = document.getElementById('student-log-name');
      const tbody = document.getElementById('student-log-tbody');

      if (titleName) titleName.textContent = studentName;

      const logs = window.dbStore.getLogsByHasilId(idHasil);

      if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:18px; color:#64748b;">Tidak ada rincian aksi pemilahan tercatat untuk siswa ini.</td></tr>`;
      } else {
        tbody.innerHTML = logs.map((l, idx) => {
          const isBenar = (l.is_benar === 1);
          const iconStatus = isBenar
            ? `<span class="text-green font-bold"><i class="fa-solid fa-circle-check"></i> Tepat (+100)</span>`
            : `<span class="text-red font-bold"><i class="fa-solid fa-circle-xmark"></i> Salah</span>`;

          return `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${l.nama_item}</strong></td>
              <td>${l.kategori_dipilih}</td>
              <td><strong class="text-green">${l.kategori_benar}</strong></td>
              <td>${iconStatus}</td>
              <td><small class="text-muted">${!isBenar ? l.pesan_edukasi : 'Pilihan tepat!'}</small></td>
            </tr>
          `;
        }).join('');
      }

      if (modal) modal.classList.remove('hidden');
    }

    // ==========================================
    // RENDER TAB 3: BANK ITEM SAMPAH 3D
    // ==========================================
    renderBankSampahTab() {
      const tbody = document.getElementById('items-table-tbody');
      if (!tbody) return;

      const items = window.dbStore.getAllItems();

      tbody.innerHTML = items.map((it, idx) => {
        let catColorClass = 'text-green';
        if (it.category === 'anorganik') catColorClass = 'text-gold';
        else if (it.category === 'b3') catColorClass = 'text-red';
        else if (it.category === 'daurulang') catColorClass = 'text-blue';

        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${it.nama_item}</strong></td>
            <td><strong class="${catColorClass}">${it.categoryName}</strong></td>
            <td><code>${it.kode_model_3d}</code></td>
            <td>${it.poin_dasar}</td>
            <td><small>${it.pesan_edukasi_salah}</small></td>
            <td class="action-buttons-cell">
              <button class="btn btn-sm btn-outline btn-edit-item" data-id="${it.id_item}">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger btn-delete-item" data-id="${it.id_item}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.btn-edit-item').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = Number(e.currentTarget.getAttribute('data-id'));
          this.openItemModal(id);
        });
      });

      tbody.querySelectorAll('.btn-delete-item').forEach(b => {
        b.addEventListener('click', (e) => {
          const id = Number(e.currentTarget.getAttribute('data-id'));
          if (confirm('Apakah Bapak/Ibu yakin ingin menghapus item sampah ini dari game?')) {
            const res = window.dbStore.deleteItem(id);
            if (!res.success) alert(res.message);
            else this.renderBankSampahTab();
          }
        });
      });
    }

    openItemModal(idItem = null) {
      this.editingItemId = idItem;
      const modal = document.getElementById('modal-item-editor');
      const title = document.getElementById('item-editor-title');

      const inputNama = document.getElementById('item-input-nama');
      const selectKat = document.getElementById('item-input-kategori');
      const selectModel = document.getElementById('item-input-model');
      const inputPoin = document.getElementById('item-input-poin');
      const inputTip = document.getElementById('item-input-tip');

      if (idItem) {
        if (title) title.textContent = 'Edit Item Sampah 3D';
        const items = window.dbStore.getAllItems();
        const it = items.find(i => i.id_item === Number(idItem));
        if (it) {
          if (inputNama) inputNama.value = it.nama_item;
          if (selectKat) selectKat.value = it.id_kategori;
          if (selectModel) selectModel.value = it.kode_model_3d;
          if (inputPoin) inputPoin.value = it.poin_dasar;
          if (inputTip) inputTip.value = it.pesan_edukasi_salah;
        }
      } else {
        if (title) title.textContent = 'Tambah Item Sampah Baru';
        if (inputNama) inputNama.value = '';
        if (selectKat) selectKat.value = '1';
        if (selectModel) selectModel.value = 'gltf_bottle';
        if (inputPoin) inputPoin.value = '100';
        if (inputTip) inputTip.value = '';
      }

      if (modal) modal.classList.remove('hidden');
    }

    saveItemFromModal() {
      const inputNama = document.getElementById('item-input-nama').value;
      const selectKat = Number(document.getElementById('item-input-kategori').value);
      const selectModel = document.getElementById('item-input-model').value;
      const inputPoin = Number(document.getElementById('item-input-poin').value) || 100;
      const inputTip = document.getElementById('item-input-tip').value;

      if (!inputNama.trim()) {
        alert('Nama item sampah tidak boleh kosong!');
        return;
      }

      if (this.editingItemId) {
        window.dbStore.updateItem(this.editingItemId, {
          nama_item: inputNama,
          id_kategori: selectKat,
          kode_model_3d: selectModel,
          poin_dasar: inputPoin,
          pesan_edukasi_salah: inputTip
        });
        alert('Item sampah berhasil diperbarui!');
      } else {
        window.dbStore.addItem({
          nama_item: inputNama,
          id_kategori: selectKat,
          kode_model_3d: selectModel,
          poin_dasar: inputPoin,
          pesan_edukasi_salah: inputTip
        });
        alert('Item sampah baru berhasil ditambahkan ke Bank Sampah!');
      }

      document.getElementById('modal-item-editor').classList.add('hidden');
      this.renderBankSampahTab();
    }
  }

  window.teacherDashboard = new TeacherDashboardController();
})();
