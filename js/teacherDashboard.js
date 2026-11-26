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
        btnLogout.addEventListener('click', async () => {
          const ok = await window.uiFeedback.confirm({
            title: 'Keluar dari Mode Guru?',
            message: 'Sesi kelas aktif saat ini akan tetap berjalan untuk siswa saat bermain. Apakah Bapak/Ibu Guru ingin keluar ke Menu Utama?',
            confirmText: 'Ya, Keluar',
            cancelText: 'Batal',
            type: 'warning'
          });
          if (ok) {
            window.dbStore.teacherLogout();
            this.closeTeacherDashboard();
            this.updateActiveSesiBadges();
            window.uiFeedback.toast('Berhasil keluar dari Mode Guru.', 'info');
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
            window.uiFeedback.toast(`Sesi "${namaKelas}" (${kodeSesi.toUpperCase()}) berhasil dibuat & aktif!`, 'success');
            formNewSesi.reset();
            this.renderSesiTab();
            this.updateActiveSesiBadges();
          } else {
            window.uiFeedback.toast(res.message, 'danger');
          }
        });
      }

      // 6. Tab 2 - Rapor Dropdown Selector, Ekspor CSV, & Reset Sesi
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

      const btnResetRapor = document.getElementById('btn-reset-rapor-sesi');
      if (btnResetRapor) {
        btnResetRapor.addEventListener('click', async () => {
          const sesiId = this.selectedRaporSesiId || (window.dbStore.getActiveSesi() ? window.dbStore.getActiveSesi().id_sesi : 1);
          const sesi = window.dbStore.getSesiById(sesiId);
          const sesiName = sesi ? sesi.nama_kelas : 'sesi ini';

          const ok = await window.uiFeedback.confirm({
            title: 'Bersihkan Rekap Nilai Sesi Ini?',
            message: `Semua data hasil bermain siswa pada <strong>${sesiName}</strong> akan dihapus permanen agar database tetap bersih dan hemat penyimpanan.`,
            confirmText: 'Bersihkan Semua',
            cancelText: 'Batal',
            type: 'danger'
          });

          if (ok) {
            const res = window.dbStore.resetHasilBySesi(sesiId);
            if (res.success) {
              window.uiFeedback.toast(res.message, 'success');
              this.renderRaporTab();
              this.renderSesiTab();
              this.updateActiveSesiBadges();
            } else {
              window.uiFeedback.toast(res.message, 'warning');
            }
          }
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
        btnResetItems.addEventListener('click', async () => {
          const ok = await window.uiFeedback.confirm({
            title: 'Kembalikan ke Default?',
            message: 'Kembalikan seluruh Bank Sampah ke 16 item standar bawaan sistem?',
            confirmText: 'Reset Default',
            cancelText: 'Batal',
            type: 'warning'
          });
          if (ok) {
            window.dbStore.resetItemsToDefault();
            this.renderBankSampahTab();
            window.uiFeedback.toast('Bank Sampah berhasil dikembalikan ke 16 item default!', 'success');
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
        window.uiFeedback.toast(`Selamat datang, ${res.teacher.nama_guru}!`, 'success');
      } else {
        window.uiFeedback.toast(res.message, 'danger');
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
            <td><span class="code-badge">${s.kode_sesi}</span></td>
            <td>
              <div style="font-weight: 700; color: #0f172a; font-size: 0.92rem;">${s.nama_kelas}</div>
              <small style="color: #64748b;">ID Sesi: #${s.id_sesi}</small>
            </td>
            <td>
              <span style="white-space: nowrap; font-size: 0.84rem; color: #475569;">
                <i class="fa-regular fa-calendar" style="color: #94a3b8; margin-right: 4px;"></i>${s.tanggal_sesi}
              </span>
            </td>
            <td>
              <div style="font-weight: 600; color: #1e293b; font-size: 0.88rem;">${s.nama_guru}</div>
              <div style="font-size: 0.76rem; color: #64748b;">${s.asal_sekolah}</div>
            </td>
            <td style="text-align: center;"><span class="badge-count">${s.jumlah_siswa} Siswa</span></td>
            <td style="text-align: center;">${statusBadge}</td>
            <td class="action-buttons-cell" style="justify-content: center;">
              ${!isCurrentActive ? `
                <button class="btn btn-sm btn-success btn-set-active-sesi" data-id="${s.id_sesi}" title="Gunakan Sesi Ini di Game">
                  <i class="fa-solid fa-play"></i> Aktifkan
                </button>
              ` : `
                <span class="badge-status-pill active" style="padding: 6px 12px; font-size: 0.76rem;">
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
        b.addEventListener('click', async (e) => {
          const id = Number(e.currentTarget.getAttribute('data-id'));
          const ok = await window.uiFeedback.confirm({
            title: 'Hapus Sesi Kelas Ini?',
            message: 'Hapus sesi kelas ini beserta seluruh rekap nilai siswa di dalamnya secara permanen?',
            confirmText: 'Hapus Sesi',
            cancelText: 'Batal',
            type: 'danger'
          });
          if (ok) {
            const res = window.dbStore.deleteSesi(id);
            if (!res.success) {
              window.uiFeedback.toast(res.message, 'danger');
            } else {
              window.uiFeedback.toast('Sesi kelas berhasil dihapus!', 'success');
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
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:#64748b;">Belum ada siswa yang menyelesaikan permainan pada sesi kelas ini.</td></tr>`;
        return;
      }

      tbody.innerHTML = report.studentList.map(s => {
        let certBadge = s.status_sertifikat === 'diklaim'
          ? `<span class="badge-cert-status claimed"><i class="fa-solid fa-check"></i> Dicetak</span>`
          : `<span class="badge-cert-status unclaimed"><i class="fa-solid fa-clock"></i> Belum Cetak</span>`;

        const rankDisplay = s.rank === 1
          ? `<span class="rank-badge rank-1"><i class="fa-solid fa-crown text-gold"></i> #1</span>`
          : (s.rank === 2
              ? `<span class="rank-badge rank-2"><i class="fa-solid fa-medal" style="color:#94a3b8;"></i> #2</span>`
              : (s.rank === 3
                  ? `<span class="rank-badge rank-3"><i class="fa-solid fa-award text-gold"></i> #3</span>`
                  : `<span class="rank-badge">#${s.rank}</span>`));

        return `
          <tr>
            <td style="text-align: center;">${rankDisplay}</td>
            <td>
              <div style="font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">
                  <i class="fa-solid fa-user"></i>
                </div>
                ${s.nama_siswa}
              </div>
            </td>
            <td><strong style="color: #059669; font-size: 0.95rem;">${s.skor_akhir.toLocaleString('id-ID')} PTS</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; min-width: 45px;">
                  <div style="width: ${s.akurasi_persen}%; height: 100%; background: ${s.akurasi_persen >= 80 ? '#10b981' : s.akurasi_persen >= 60 ? '#f59e0b' : '#ef4444'};"></div>
                </div>
                <strong style="font-size: 0.84rem;">${s.akurasi_persen}%</strong>
              </div>
            </td>
            <td style="text-align: center;"><span class="badge-count" style="background: #fef3c7; color: #b45309;">🔥 x${s.max_combo}</span></td>
            <td style="text-align: center;"><span class="badge-predicate ${s.predikatClass}">${s.predikat}</span></td>
            <td style="text-align: center;">${certBadge}</td>
            <td><span style="white-space: nowrap; font-size: 0.82rem; color: #64748b;"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i>${s.waktu_bermain}</span></td>
            <td class="action-buttons-cell" style="justify-content: center;">
              <button class="btn btn-sm btn-outline btn-view-student-log" data-id="${s.id_hasil}" data-name="${s.nama_siswa}" title="Lihat Rincian Pilah">
                <i class="fa-solid fa-list-check"></i> Detail
              </button>
              <button class="btn btn-sm btn-danger btn-delete-student" data-id="${s.id_hasil}" data-name="${s.nama_siswa}" data-score="${s.skor_akhir}" title="Hapus Data Siswa Ini">
                <i class="fa-solid fa-trash-can"></i>
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

      tbody.querySelectorAll('.btn-delete-student').forEach(b => {
        b.addEventListener('click', async (e) => {
          const idHasil = Number(e.currentTarget.getAttribute('data-id'));
          const sName = e.currentTarget.getAttribute('data-name');
          const sScore = e.currentTarget.getAttribute('data-score');

          const ok = await window.uiFeedback.confirm({
            title: 'Hapus Data Siswa Ini?',
            message: `Data hasil bermain siswa <strong>${sName}</strong> (${Number(sScore).toLocaleString('id-ID')} PTS) beserta rincian log pilahnya akan dihapus permanen agar database tetap bersih.`,
            confirmText: 'Hapus Data',
            cancelText: 'Batal',
            type: 'danger'
          });

          if (ok) {
            const res = window.dbStore.deleteHasilBermain(idHasil);
            if (res.success) {
              window.uiFeedback.toast(`Data bermain "${sName}" berhasil dihapus dari database!`, 'success');
              this.renderRaporTab();
              this.renderSesiTab();
              this.updateActiveSesiBadges();
            } else {
              window.uiFeedback.toast(res.message, 'danger');
            }
          }
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
        return `
          <tr>
            <td style="text-align: center; color: #64748b; font-weight: 700;">${idx + 1}</td>
            <td>
              <div style="font-weight: 700; color: #0f172a; font-size: 0.90rem;">${it.nama_item}</div>
              <small style="color: #94a3b8;">ID: #${it.id_item}</small>
            </td>
            <td><span class="badge-cat-pill cat-${it.category}">${it.categoryName}</span></td>
            <td><span class="code-badge">${it.kode_model_3d}</span></td>
            <td style="text-align: center;"><strong style="color: #059669;">+${it.poin_dasar}</strong></td>
            <td>
              <div class="edu-quote-box">
                <i class="fa-solid fa-quote-left" style="color: #3b82f6; margin-right: 4px;"></i>${it.pesan_edukasi_salah}
              </div>
            </td>
            <td class="action-buttons-cell" style="justify-content: center;">
              <button class="btn btn-sm btn-outline btn-edit-item" data-id="${it.id_item}" title="Edit Item">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-sm btn-danger btn-delete-item" data-id="${it.id_item}" title="Hapus Item">
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
        b.addEventListener('click', async (e) => {
          const id = Number(e.currentTarget.getAttribute('data-id'));
          const ok = await window.uiFeedback.confirm({
            title: 'Hapus Item Sampah Ini?',
            message: 'Apakah Bapak/Ibu yakin ingin menghapus item sampah ini dari game?',
            confirmText: 'Hapus Item',
            cancelText: 'Batal',
            type: 'danger'
          });
          if (ok) {
            const res = window.dbStore.deleteItem(id);
            if (!res.success) {
              window.uiFeedback.toast(res.message, 'danger');
            } else {
              window.uiFeedback.toast('Item sampah berhasil dihapus!', 'success');
              this.renderBankSampahTab();
            }
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

      const chkLvl1 = document.getElementById('item-level-1');
      const chkLvl2 = document.getElementById('item-level-2');
      const chkLvl3 = document.getElementById('item-level-3');

      if (idItem) {
        if (title) title.textContent = 'Edit Item Sampah 3D';
        const items = window.dbStore.getAllItems();
        const it = items.find(i => i.id_item === Number(idItem));
        if (it) {
          if (inputNama) inputNama.value = it.nama_item;
          if (selectKat) selectKat.value = it.id_kategori;
          if (selectModel) selectModel.value = it.kode_aset || it.kode_model_3d || 'gltf_bottle';
          if (inputPoin) inputPoin.value = it.poin_dasar || 100;
          if (inputTip) inputTip.value = it.pesan_edukasi || it.pesan_edukasi_salah || '';
          const lvls = it.levels || [1, 2, 3];
          if (chkLvl1) chkLvl1.checked = lvls.includes(1);
          if (chkLvl2) chkLvl2.checked = lvls.includes(2);
          if (chkLvl3) chkLvl3.checked = lvls.includes(3);
        }
      } else {
        if (title) title.textContent = 'Tambah Item Sampah Baru';
        if (inputNama) inputNama.value = '';
        if (selectKat) selectKat.value = '1';
        if (selectModel) selectModel.value = 'gltf_bottle';
        if (inputPoin) inputPoin.value = '100';
        if (inputTip) inputTip.value = '';
        if (chkLvl1) chkLvl1.checked = true;
        if (chkLvl2) chkLvl2.checked = true;
        if (chkLvl3) chkLvl3.checked = true;
      }

      if (modal) modal.classList.remove('hidden');
    }

    saveItemFromModal() {
      const inputNama = document.getElementById('item-input-nama').value;
      const selectKat = Number(document.getElementById('item-input-kategori').value);
      const selectModel = document.getElementById('item-input-model').value;
      const inputPoin = Number(document.getElementById('item-input-poin').value) || 100;
      const inputTip = document.getElementById('item-input-tip').value;

      const chkLvl1 = document.getElementById('item-level-1');
      const chkLvl2 = document.getElementById('item-level-2');
      const chkLvl3 = document.getElementById('item-level-3');
      const selectedLevels = [];
      if (chkLvl1 && chkLvl1.checked) selectedLevels.push(1);
      if (chkLvl2 && chkLvl2.checked) selectedLevels.push(2);
      if (chkLvl3 && chkLvl3.checked) selectedLevels.push(3);
      const finalLevels = selectedLevels.length > 0 ? selectedLevels : [1, 2, 3];

      if (!inputNama.trim()) {
        window.uiFeedback.toast('Nama item sampah tidak boleh kosong!', 'warning');
        return;
      }

      const itemPayload = {
        nama_item: inputNama,
        id_kategori: selectKat,
        kode_aset: selectModel,
        kode_model_3d: selectModel,
        poin_dasar: inputPoin,
        pesan_edukasi: inputTip,
        pesan_edukasi_salah: inputTip,
        levels: finalLevels
      };

      if (this.editingItemId) {
        window.dbStore.updateItem(this.editingItemId, itemPayload);
        window.uiFeedback.toast('Item sampah & relasi level berhasil diperbarui!', 'success');
      } else {
        window.dbStore.addItem(itemPayload);
        window.uiFeedback.toast('Item sampah baru berhasil ditambahkan!', 'success');
      }

      document.getElementById('modal-item-editor').classList.add('hidden');
      this.renderBankSampahTab();
    }
  }

  window.teacherDashboard = new TeacherDashboardController();
})();
