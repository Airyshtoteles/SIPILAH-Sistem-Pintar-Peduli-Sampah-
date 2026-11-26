/* ==========================================================================
   dbStore.js - Relational LocalStorage Engine for Game Edukasi Pemilahan Sampah
   Meniru struktur 6 Tabel MySQL (db_pilah_sampah.sql)
   Mendukung Sesi Kelas Guru ("Main Bareng"), Rapor Siswa, & Bank Sampah
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  const STORAGE_PREFIX = 'sany_pilah_';

  // Seed Data Awal
  const SEED_GURU = [
    { id_guru: 1, nama_guru: 'Agung Febriyana, S.Pd.', asal_sekolah: 'SDN 1 Ciawilor', username: 'agung_sdn1', password: 'guru123' },
    { id_guru: 2, nama_guru: 'Tris Mulyo Purnomo, S.Pd.', asal_sekolah: 'SDN 2 Ciawilor', username: 'tris_sdn2', password: 'guru123' }
  ];

  const SEED_SESI = [
    { id_sesi: 1, id_guru: 1, kode_sesi: 'CIAWI-2A', nama_kelas: 'Kelas 2A - SEMUTLIS', tanggal_sesi: '2026-11-20', status_sesi: 'aktif' },
    { id_sesi: 2, id_guru: 2, kode_sesi: 'CIAWI2-1B', nama_kelas: 'Kelas 1B - Pembiasaan Disiplin', tanggal_sesi: '2026-11-19', status_sesi: 'selesai' }
  ];

  const SEED_KATEGORI = [
    { id_kategori: 1, nama_kategori: 'Organik', warna_tong: 'Hijau (#10b981)', deskripsi_singkat: 'Sisa makanan, daun, kulit buah yang membusuk dan terurai alami jadi kompos.' },
    { id_kategori: 2, nama_kategori: 'Anorganik', warna_tong: 'Kuning (#f59e0b)', deskripsi_singkat: 'Plastik, kaleng, bungkus makanan yang tidak bisa membusuk alami.' },
    { id_kategori: 3, nama_kategori: 'B3 Berbahaya', warna_tong: 'Merah (#ef4444)', deskripsi_singkat: 'Baterai bekas, lampu bohlam, termometer raksa, dan botol kimia berbahaya.' },
    { id_kategori: 4, nama_kategori: 'Daur Ulang', warna_tong: 'Biru (#06b6d4)', deskripsi_singkat: 'Kardus, kertas buku tulis, koran bekas, dan karton kemasan yang dapat diolah lagi.' }
  ];

  const SEED_ITEMS = [
    // Organik (id_kategori: 1)
    { id_item: 1, id_kategori: 1, nama_item: 'Kulit Pisang', kode_model_3d: 'gltf_banana', poin_dasar: 100, pesan_edukasi_salah: 'Kulit pisang cepat membusuk alami dan kaya nutrisi untuk menyuburkan tanah (Organik - Hijau).' },
    { id_item: 2, id_kategori: 1, nama_item: 'Sisa Gigitan Apel', kode_model_3d: 'gltf_apple', poin_dasar: 100, pesan_edukasi_salah: 'Sisa buah & makanan cepat membusuk menjadi pupuk kompos alami! Masukkan ke tong Hijau (Organik).' },
    { id_item: 3, id_kategori: 1, nama_item: 'Daun Kering', kode_model_3d: 'gltf_leaf', poin_dasar: 100, pesan_edukasi_salah: 'Daun gugur termasuk sampah organik halaman sekolah yang sangat mudah terurai (Organik - Hijau).' },
    { id_item: 4, id_kategori: 1, nama_item: 'Roti Kadaluarsa', kode_model_3d: 'gltf_bread', poin_dasar: 100, pesan_edukasi_salah: 'Sisa roti dan bekal makanan termasuk sampah organik yang mudah membusuk (Organik - Hijau).' },

    // Anorganik (id_kategori: 2)
    { id_item: 5, id_kategori: 2, nama_item: 'Botol Air Minum Plastik', kode_model_3d: 'gltf_bottle', poin_dasar: 100, pesan_edukasi_salah: 'Botol plastik butuh 450 tahun untuk hancur! Wajib dipilah ke tempat Anorganik (Kuning).' },
    { id_item: 6, id_kategori: 2, nama_item: 'Kaleng Minuman Soda', kode_model_3d: 'gltf_can', poin_dasar: 100, pesan_edukasi_salah: 'Kaleng alumunium bisa dilebur & didaur ulang berkali-kali. Masukkan ke tong Kuning (Anorganik).' },
    { id_item: 7, id_kategori: 2, nama_item: 'Bebek Mainan Plastik', kode_model_3d: 'gltf_duck', poin_dasar: 100, pesan_edukasi_salah: 'Mainan berbahan plastik sintetis tidak dapat membusuk alami. Masukkan ke tong Kuning (Anorganik).' },
    { id_item: 8, id_kategori: 2, nama_item: 'Gelas Minuman & Sedotan', kode_model_3d: 'gltf_straw', poin_dasar: 100, pesan_edukasi_salah: 'Sedotan & gelas plastik berbahaya bagi saluran air sekolah dan biota sungai/laut (Anorganik - Kuning).' },

    // B3 Berbahaya (id_kategori: 3)
    { id_item: 9, id_kategori: 3, nama_item: 'Baterai Bekas', kode_model_3d: 'gltf_battery', poin_dasar: 100, pesan_edukasi_salah: 'Baterai bekas mengandung racun logam berat yang mencemari air tanah! Masukkan ke tong Merah (B3).' },
    { id_item: 10, id_kategori: 3, nama_item: 'Lampu Bohlam Bekas', kode_model_3d: 'gltf_bulb', poin_dasar: 100, pesan_edukasi_salah: 'Pecahan kaca bohlam & serbuk gas merkuri di dalamnya sangat berbahaya bagi tangan siswa (B3 - Merah).' },
    { id_item: 11, id_kategori: 3, nama_item: 'Botol Obat Kimia', kode_model_3d: 'gltf_medicine', poin_dasar: 100, pesan_edukasi_salah: 'Sisa obat & botol kimia mengandung zat aktif berbahaya bila tertelan sembarangan (B3 - Merah).' },
    { id_item: 12, id_kategori: 3, nama_item: 'Termometer Raksa', kode_model_3d: 'gltf_thermometer', poin_dasar: 100, pesan_edukasi_salah: 'Cairan raksa pada termometer sangat beracun bagi pernapasan dan kulit manusia! (B3 - Merah).' },

    // Daur Ulang (id_kategori: 4)
    { id_item: 13, id_kategori: 4, nama_item: 'Kardus Box', kode_model_3d: 'gltf_box', poin_dasar: 100, pesan_edukasi_salah: 'Mendaur ulang kardus menyelamatkan pohon hutan dari penebangan liar! Masukkan ke tong Biru (Daur Ulang).' },
    { id_item: 14, id_kategori: 4, nama_item: 'Kertas Buku Bekas', kode_model_3d: 'gltf_paper', poin_dasar: 100, pesan_edukasi_salah: 'Kertas buku tulis bekas dipilah ke tong Biru agar dapat diolah kembali menjadi lembaran baru.' },
    { id_item: 15, id_kategori: 4, nama_item: 'Koran Bekas', kode_model_3d: 'gltf_newspaper', poin_dasar: 100, pesan_edukasi_salah: 'Koran bekas dapat diolah menjadi bubur kertas atau kerajinan kreatif (Daur Ulang - Biru).' },
    { id_item: 16, id_kategori: 4, nama_item: 'Karton Susu Kotak', kode_model_3d: 'gltf_carton', poin_dasar: 100, pesan_edukasi_salah: 'Karton kemasan susu sekolah dipilah ke tempat sampah Daur Ulang (Biru).' }
  ];

  const SEED_HASIL = [
    { id_hasil: 1, id_sesi: 1, nama_siswa: 'Aditya Pratama', skor_akhir: 1420, akurasi_persen: 92, max_combo: 7, status_sertifikat: 'diklaim', waktu_bermain: '2026-11-20 08:15:00' },
    { id_hasil: 2, id_sesi: 1, nama_siswa: 'Siti Nur Aisyah', skor_akhir: 1280, akurasi_persen: 85, max_combo: 5, status_sertifikat: 'diklaim', waktu_bermain: '2026-11-20 08:22:00' },
    { id_hasil: 3, id_sesi: 1, nama_siswa: 'Rian Hidayat', skor_akhir: 940, akurasi_persen: 71, max_combo: 3, status_sertifikat: 'belum_klaim', waktu_bermain: '2026-11-20 08:30:00' },
    { id_hasil: 4, id_sesi: 1, nama_siswa: 'Zahra Amelia', skor_akhir: 620, akurasi_persen: 50, max_combo: 2, status_sertifikat: 'belum_klaim', waktu_bermain: '2026-11-20 08:38:00' },
    { id_hasil: 5, id_sesi: 1, nama_siswa: 'Dimas Anggara', skor_akhir: 1560, akurasi_persen: 95, max_combo: 8, status_sertifikat: 'diklaim', waktu_bermain: '2026-11-20 08:45:00' }
  ];

  const SEED_LOG = [
    // Aditya Pratama (Hasil #1)
    { id_log: 1, id_hasil: 1, id_item: 1, id_kategori_dipilih: 1, is_benar: 1 },
    { id_log: 2, id_hasil: 1, id_item: 5, id_kategori_dipilih: 2, is_benar: 1 },
    { id_log: 3, id_hasil: 1, id_item: 9, id_kategori_dipilih: 3, is_benar: 1 },
    { id_log: 4, id_hasil: 1, id_item: 13, id_kategori_dipilih: 4, is_benar: 1 },
    { id_log: 5, id_hasil: 1, id_item: 2, id_kategori_dipilih: 1, is_benar: 1 },
    { id_log: 6, id_hasil: 1, id_item: 6, id_kategori_dipilih: 2, is_benar: 1 },
    { id_log: 7, id_hasil: 1, id_item: 10, id_kategori_dipilih: 2, is_benar: 0 },
    // Siti Nur Aisyah (Hasil #2)
    { id_log: 8, id_hasil: 2, id_item: 3, id_kategori_dipilih: 1, is_benar: 1 },
    { id_log: 9, id_hasil: 2, id_item: 7, id_kategori_dipilih: 2, is_benar: 1 },
    { id_log: 10, id_hasil: 2, id_item: 11, id_kategori_dipilih: 3, is_benar: 1 },
    { id_log: 11, id_hasil: 2, id_item: 14, id_kategori_dipilih: 4, is_benar: 1 },
    { id_log: 12, id_hasil: 2, id_item: 5, id_kategori_dipilih: 4, is_benar: 0 },
    // Zahra Amelia (Hasil #4)
    { id_log: 13, id_hasil: 4, id_item: 9, id_kategori_dipilih: 2, is_benar: 0 },
    { id_log: 14, id_hasil: 4, id_item: 10, id_kategori_dipilih: 2, is_benar: 0 },
    { id_log: 15, id_hasil: 4, id_item: 1, id_kategori_dipilih: 1, is_benar: 1 },
    { id_log: 16, id_hasil: 4, id_item: 13, id_kategori_dipilih: 4, is_benar: 1 }
  ];

  class DatabaseStore {
    constructor() {
      this.init();
    }

    // Helper localStorage
    _get(table) {
      try {
        const val = localStorage.getItem(STORAGE_PREFIX + table);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        console.error('dbStore read error for table:', table, e);
        return null;
      }
    }

    _set(table, data) {
      try {
        localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(data));
      } catch (e) {
        console.error('dbStore write error for table:', table, e);
      }
    }

    init(forceReset = false) {
      if (forceReset || !this._get('tb_guru')) {
        this._set('tb_guru', SEED_GURU);
        this._set('tb_sesi_kelas', SEED_SESI);
        this._set('tb_kategori_sampah', SEED_KATEGORI);
        this._set('tb_item_sampah', SEED_ITEMS);
        this._set('tb_hasil_bermain', SEED_HASIL);
        this._set('tb_log_pemilahan', SEED_LOG);
        this._set('current_active_sesi_id', 1);
        console.log('[dbStore] Database initialized with default seed data.');
      }
    }

    // ==========================================
    // 1. AUTENTIKASI GURU
    // ==========================================
    teacherLogin(username, password) {
      const teachers = this._get('tb_guru') || [];
      const teacher = teachers.find(g => g.username.toLowerCase() === (username || '').trim().toLowerCase() && g.password === (password || '').trim());
      if (teacher) {
        sessionStorage.setItem('sany_logged_teacher', JSON.stringify({
          id_guru: teacher.id_guru,
          nama_guru: teacher.nama_guru,
          asal_sekolah: teacher.asal_sekolah,
          username: teacher.username
        }));
        return { success: true, teacher };
      }
      return { success: false, message: 'Username atau password guru tidak cocok.' };
    }

    getCurrentTeacher() {
      try {
        const t = sessionStorage.getItem('sany_logged_teacher');
        return t ? JSON.parse(t) : null;
      } catch (e) {
        return null;
      }
    }

    teacherLogout() {
      sessionStorage.removeItem('sany_logged_teacher');
    }

    getAllGuru() {
      return this._get('tb_guru') || [];
    }

    // ==========================================
    // 2. SESI KELAS ("MAIN BARENG" DI KELAS)
    // ==========================================
    getAllSesi() {
      const list = this._get('tb_sesi_kelas') || [];
      const gurus = this.getAllGuru();
      const results = this._get('tb_hasil_bermain') || [];

      return list.map(s => {
        const guru = gurus.find(g => g.id_guru === s.id_guru) || { nama_guru: 'Guru Wali' };
        const studentCount = results.filter(r => r.id_sesi === s.id_sesi).length;
        return {
          ...s,
          nama_guru: guru.nama_guru,
          asal_sekolah: guru.asal_sekolah,
          jumlah_siswa: studentCount
        };
      });
    }

    getActiveSesi() {
      const list = this._get('tb_sesi_kelas') || [];
      const activeId = this._get('current_active_sesi_id');
      let sesi = list.find(s => s.id_sesi === Number(activeId) && s.status_sesi === 'aktif');
      if (!sesi) {
        sesi = list.find(s => s.status_sesi === 'aktif');
        if (sesi) {
          this._set('current_active_sesi_id', sesi.id_sesi);
        }
      }
      return sesi || (list.length > 0 ? list[0] : null);
    }

    setActiveSesi(idSesi) {
      const list = this._get('tb_sesi_kelas') || [];
      const target = list.find(s => s.id_sesi === Number(idSesi));
      if (target) {
        target.status_sesi = 'aktif';
        this._set('tb_sesi_kelas', list);
        this._set('current_active_sesi_id', Number(idSesi));
        return true;
      }
      return false;
    }

    createSesi(namaKelas, kodeSesi, idGuru = 1) {
      const list = this._get('tb_sesi_kelas') || [];
      const cleanKode = (kodeSesi || 'SESI-' + Math.floor(100 + Math.random() * 900)).trim().toUpperCase();

      // Check unique code
      if (list.some(s => s.kode_sesi === cleanKode)) {
        return { success: false, message: `Kode Sesi "${cleanKode}" sudah digunakan! Harap ganti kode sesi.` };
      }

      const newId = list.reduce((max, s) => Math.max(max, s.id_sesi), 0) + 1;
      const today = new Date().toISOString().split('T')[0];

      const newSesi = {
        id_sesi: newId,
        id_guru: Number(idGuru),
        kode_sesi: cleanKode,
        nama_kelas: (namaKelas || 'Kelas Baru').trim(),
        tanggal_sesi: today,
        status_sesi: 'aktif'
      };

      list.unshift(newSesi);
      this._set('tb_sesi_kelas', list);
      this._set('current_active_sesi_id', newId);

      // Asynchronous Cloud Sync (Supabase / Hosted Database)
      try {
        if (window.cloudDB && typeof window.cloudDB.syncSesiBaru === 'function') {
          window.cloudDB.syncSesiBaru(newSesi);
        }
      } catch (e) {}

      return { success: true, sesi: newSesi };
    }

    toggleSesiStatus(idSesi) {
      const list = this._get('tb_sesi_kelas') || [];
      const sesi = list.find(s => s.id_sesi === Number(idSesi));
      if (sesi) {
        sesi.status_sesi = sesi.status_sesi === 'aktif' ? 'selesai' : 'aktif';
        this._set('tb_sesi_kelas', list);
        return sesi;
      }
      return null;
    }

    deleteSesi(idSesi) {
      let list = this._get('tb_sesi_kelas') || [];
      if (list.length <= 1) {
        return { success: false, message: 'Tidak dapat menghapus sesi terakhir. Minimal harus ada 1 sesi kelas!' };
      }
      list = list.filter(s => s.id_sesi !== Number(idSesi));
      this._set('tb_sesi_kelas', list);

      // Clean cascaded results & logs
      let hasil = this._get('tb_hasil_bermain') || [];
      const deletedHasilIds = hasil.filter(h => h.id_sesi === Number(idSesi)).map(h => h.id_hasil);
      hasil = hasil.filter(h => h.id_sesi !== Number(idSesi));
      this._set('tb_hasil_bermain', hasil);

      let logs = this._get('tb_log_pemilahan') || [];
      logs = logs.filter(l => !deletedHasilIds.includes(l.id_hasil));
      this._set('tb_log_pemilahan', logs);

      const activeSesi = this.getActiveSesi();
      if (!activeSesi && list.length > 0) {
        this.setActiveSesi(list[0].id_sesi);
      }
      return { success: true };
    }

    // ==========================================
    // 3. KATEGORI SAMPAH
    // ==========================================
    getAllKategori() {
      return this._get('tb_kategori_sampah') || [];
    }

    getKategoriById(idKat) {
      const list = this.getAllKategori();
      return list.find(k => k.id_kategori === Number(idKat));
    }

    // ==========================================
    // 4. BANK ITEM SAMPAH 3D (CRUD)
    // ==========================================
    getAllItems() {
      const items = this._get('tb_item_sampah') || [];
      const categories = this.getAllKategori();
      return items.map(item => {
        const cat = categories.find(c => c.id_kategori === item.id_kategori) || { nama_kategori: 'Umum' };
        // Map string key for 3D logic
        let catKey = 'organik';
        if (item.id_kategori === 2) catKey = 'anorganik';
        else if (item.id_kategori === 3) catKey = 'b3';
        else if (item.id_kategori === 4) catKey = 'daurulang';

        return {
          ...item,
          category: catKey,
          categoryName: cat.nama_kategori,
          name: item.nama_item,
          meshType: item.kode_model_3d,
          tip: item.pesan_edukasi_salah
        };
      });
    }

    addItem(data) {
      const items = this._get('tb_item_sampah') || [];
      const newId = items.reduce((max, it) => Math.max(max, it.id_item), 0) + 1;

      const newItem = {
        id_item: newId,
        id_kategori: Number(data.id_kategori) || 1,
        nama_item: (data.nama_item || 'Item Sampah').trim(),
        kode_model_3d: data.kode_model_3d || 'gltf_bottle',
        poin_dasar: Number(data.poin_dasar) || 100,
        pesan_edukasi_salah: (data.pesan_edukasi_salah || 'Perhatikan tempat sampah yang sesuai!').trim()
      };

      items.push(newItem);
      this._set('tb_item_sampah', items);
      return newItem;
    }

    updateItem(idItem, data) {
      const items = this._get('tb_item_sampah') || [];
      const item = items.find(it => it.id_item === Number(idItem));
      if (item) {
        if (data.nama_item !== undefined) item.nama_item = data.nama_item.trim();
        if (data.id_kategori !== undefined) item.id_kategori = Number(data.id_kategori);
        if (data.kode_model_3d !== undefined) item.kode_model_3d = data.kode_model_3d;
        if (data.poin_dasar !== undefined) item.poin_dasar = Number(data.poin_dasar);
        if (data.pesan_edukasi_salah !== undefined) item.pesan_edukasi_salah = data.pesan_edukasi_salah.trim();
        this._set('tb_item_sampah', items);
        return item;
      }
      return null;
    }

    deleteItem(idItem) {
      let items = this._get('tb_item_sampah') || [];
      if (items.length <= 4) {
        return { success: false, message: 'Bank Sampah minimal harus memiliki setidaknya 4 item agar game dapat dimainkan!' };
      }
      items = items.filter(it => it.id_item !== Number(idItem));
      this._set('tb_item_sampah', items);
      return { success: true };
    }

    resetItemsToDefault() {
      this._set('tb_item_sampah', SEED_ITEMS);
      return SEED_ITEMS;
    }

    // ==========================================
    // 5. HASIL BERMAIN & LOG PEMILAHAN
    // ==========================================
    saveHasilBermain({ studentName, score, accuracy, maxCombo, statusCertificate = 'belum_klaim', roundLogs = [] }) {
      const activeSesi = this.getActiveSesi();
      const idSesi = activeSesi ? activeSesi.id_sesi : 1;

      const hasilList = this._get('tb_hasil_bermain') || [];
      const newHasilId = hasilList.reduce((max, h) => Math.max(max, h.id_hasil), 0) + 1;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newHasil = {
        id_hasil: newHasilId,
        id_sesi: idSesi,
        nama_siswa: (studentName || 'Siswa Ciawilor').trim(),
        skor_akhir: Number(score) || 0,
        akurasi_persen: Number(accuracy) || 0,
        max_combo: Number(maxCombo) || 0,
        status_sertifikat: statusCertificate,
        waktu_bermain: timeStr
      };

      hasilList.push(newHasil);
      this._set('tb_hasil_bermain', hasilList);

      // Simpan rincian log pemilahan per-item
      if (Array.isArray(roundLogs) && roundLogs.length > 0) {
        const logList = this._get('tb_log_pemilahan') || [];
        let curLogId = logList.reduce((max, l) => Math.max(max, l.id_log), 0);

        const items = this.getAllItems();
        roundLogs.forEach(entry => {
          curLogId++;
          let matchedItem = items.find(it => it.id_item === entry.id_item || it.name === entry.nama_item);
          let itemId = matchedItem ? matchedItem.id_item : 1;

          let catDipilihId = 1;
          if (entry.id_kategori_dipilih === 'anorganik' || entry.id_kategori_dipilih === 2) catDipilihId = 2;
          else if (entry.id_kategori_dipilih === 'b3' || entry.id_kategori_dipilih === 3) catDipilihId = 3;
          else if (entry.id_kategori_dipilih === 'daurulang' || entry.id_kategori_dipilih === 4) catDipilihId = 4;

          logList.push({
            id_log: curLogId,
            id_hasil: newHasilId,
            id_item: itemId,
            id_kategori_dipilih: catDipilihId,
            is_benar: entry.is_benar ? 1 : 0
          });
        });

        this._set('tb_log_pemilahan', logList);
      }

      // Sync ke LeaderboardManager lama agar modal leaderboard tetap bekerja harmonis
      if (window.LeaderboardManager && typeof window.LeaderboardManager.saveScore === 'function') {
        try {
          window.LeaderboardManager.saveScore(newHasil.nama_siswa, newHasil.skor_akhir, newHasil.akurasi_persen);
        } catch (e) {}
      }

      // Asynchronous Cloud Sync (Supabase / Hosted Database)
      try {
        if (window.cloudDB && typeof window.cloudDB.syncHasilBermain === 'function') {
          window.cloudDB.syncHasilBermain(newHasil, roundLogs);
        }
      } catch (e) {}

      return newHasil;
    }

    updateCertificateStatus(idHasil) {
      const list = this._get('tb_hasil_bermain') || [];
      const hasil = list.find(h => h.id_hasil === Number(idHasil));
      if (hasil) {
        hasil.status_sertifikat = 'diklaim';
        this._set('tb_hasil_bermain', list);
      }
    }

    getHasilBySesi(idSesi) {
      const list = this._get('tb_hasil_bermain') || [];
      const filtered = list.filter(h => h.id_sesi === Number(idSesi));
      filtered.sort((a, b) => b.skor_akhir - a.skor_akhir);
      return filtered;
    }

    getLogsByHasilId(idHasil) {
      const logs = this._get('tb_log_pemilahan') || [];
      const items = this.getAllItems();
      const categories = this.getAllKategori();

      return logs
        .filter(l => l.id_hasil === Number(idHasil))
        .map(l => {
          const item = items.find(it => it.id_item === l.id_item) || { nama_item: 'Sampah', pesan_edukasi_salah: '-' };
          const katDipilih = categories.find(c => c.id_kategori === l.id_kategori_dipilih) || { nama_kategori: '-' };
          const katBenar = categories.find(c => c.id_kategori === (item.id_kategori || 1)) || { nama_kategori: '-' };

          return {
            ...l,
            nama_item: item.nama_item,
            kategori_dipilih: katDipilih.nama_kategori,
            kategori_benar: katBenar.nama_kategori,
            pesan_edukasi: item.pesan_edukasi_salah
          };
        });
    }

    // ==========================================
    // 6. RAPOR & ANALISIS PEMAHAMAN SISWA
    // ==========================================
    getSesiReportSummary(idSesi) {
      const results = this.getHasilBySesi(idSesi);
      const totalSiswa = results.length;

      if (totalSiswa === 0) {
        return {
          totalSiswa: 0,
          avgScore: 0,
          avgAccuracy: 0,
          mostMistakenItem: { nama_item: 'Belum Ada Data', count: 0, tip: '-' },
          studentList: []
        };
      }

      const totalScore = results.reduce((acc, r) => acc + r.skor_akhir, 0);
      const totalAccuracy = results.reduce((acc, r) => acc + r.akurasi_persen, 0);
      const avgScore = Math.round(totalScore / totalSiswa);
      const avgAccuracy = Math.round(totalAccuracy / totalSiswa);

      // Hitung sampah paling sering salah dipilah dalam sesi ini
      const logs = this._get('tb_log_pemilahan') || [];
      const sesiHasilIds = results.map(r => r.id_hasil);
      const sesiLogs = logs.filter(l => sesiHasilIds.includes(l.id_hasil));
      const wrongLogs = sesiLogs.filter(l => l.is_benar === 0);

      const items = this.getAllItems();
      const mistakeCounter = {};
      wrongLogs.forEach(l => {
        mistakeCounter[l.id_item] = (mistakeCounter[l.id_item] || 0) + 1;
      });

      let mostMistakenItem = { nama_item: 'Semua Pilah Benar! 🎉', count: 0, tip: 'Siswa kelas ini memahami seluruh kategori sampah dengan baik!' };
      let maxMistakes = 0;
      Object.keys(mistakeCounter).forEach(itemId => {
        if (mistakeCounter[itemId] > maxMistakes) {
          maxMistakes = mistakeCounter[itemId];
          const it = items.find(i => i.id_item === Number(itemId));
          if (it) {
            mostMistakenItem = {
              nama_item: it.nama_item,
              count: maxMistakes,
              tip: it.pesan_edukasi_salah,
              categoryName: it.categoryName
            };
          }
        }
      });

      // Predikat pemahaman
      const studentList = results.map((r, idx) => {
        let predikat = 'Perlu Bimbingan';
        let predikatClass = 'badge-danger';
        if (r.akurasi_persen >= 80) {
          predikat = 'Sangat Paham';
          predikatClass = 'badge-success';
        } else if (r.akurasi_persen >= 60) {
          predikat = 'Cukup Paham';
          predikatClass = 'badge-warning';
        }

        return {
          ...r,
          rank: idx + 1,
          predikat,
          predikatClass
        };
      });

      return {
        totalSiswa,
        avgScore,
        avgAccuracy,
        mostMistakenItem,
        studentList
      };
    }

    // ==========================================
    // 7. EKSPOR RAPOR KE CSV
    // ==========================================
    exportSesiReportCSV(idSesi) {
      const allSesi = this.getAllSesi();
      const sesi = allSesi.find(s => s.id_sesi === Number(idSesi)) || { nama_kelas: 'Kelas', kode_sesi: 'CIAWI' };
      const report = this.getSesiReportSummary(idSesi);

      if (report.totalSiswa === 0) {
        alert('Sesi ini belum memiliki data nilai siswa untuk diekspor!');
        return;
      }

      let csv = `RAPOR PEMAHAMAN PEMILAHAN SAMPAH SISWA SD\n`;
      csv += `Mitra: SDN 1 & SDN 2 Ciawilor (Program SEMUTLIS)\n`;
      csv += `Pengembang: Kelompok 05 - SANY (Teknik Informatika UNIKU)\n`;
      csv += `Kelas: "${sesi.nama_kelas}" | Kode Sesi: "${sesi.kode_sesi}" | Tanggal: ${sesi.tanggal_sesi}\n`;
      csv += `Total Siswa: ${report.totalSiswa} | Rata-rata Skor: ${report.avgScore} | Rata-rata Akurasi: ${report.avgAccuracy}%\n`;
      csv += `Sampah Paling Sering Salah: "${report.mostMistakenItem.nama_item}" (${report.mostMistakenItem.count} kali salah)\n\n`;

      csv += `Peringkat,Nama Siswa,Skor Akhir,Akurasi (%),Max Combo,Predikat Pemahaman,Status Sertifikat,Waktu Bermain\n`;

      report.studentList.forEach(s => {
        csv += `${s.rank},"${s.nama_siswa.replace(/"/g, '""')}",${s.skor_akhir},${s.akurasi_persen}%,x${s.max_combo},"${s.predikat}","${s.status_sertifikat}","${s.waktu_bermain}"\n`;
      });

      // Browser File Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeKode = sesi.kode_sesi.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('href', url);
      link.setAttribute('download', `Rapor_Pilah_Sampah_${safeKode}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Expose to Global Window
  window.dbStore = new DatabaseStore();
})();
