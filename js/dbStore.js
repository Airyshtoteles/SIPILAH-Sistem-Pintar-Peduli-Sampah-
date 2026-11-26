/* ==========================================================================
   dbStore.js - Client-Side Relational Store (6 Tabel Standar 3NF)
   Mencerminkan Struktur database/sipilah_sampah.sql
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   Mitra: SDN 1 Ciawilor & SDN 2 Ciawilor
   ========================================================================== */

(function() {
  const STORAGE_PREFIX = 'sipilah_';

  const DEFAULT_CATEGORIES = [
    {
      id_kategori: 1,
      nama_kategori: 'Organik',
      warna_tong: 'Hijau (#10b981)',
      keterangan: 'Sampah yang berasal dari sisa makhluk hidup, mudah membusuk alami menjadi kompos (kulit pisang, sisa apel, daun kering, roti).'
    },
    {
      id_kategori: 2,
      nama_kategori: 'Anorganik',
      warna_tong: 'Kuning (#f59e0b)',
      keterangan: 'Sampah buatan pabrik yang tidak bisa membusuk alami dan harus didaur ulang (botol plastik, kaleng soda, kardus, kertas).'
    }
  ];

  const DEFAULT_LEVELS = [
    {
      id_level: 1,
      nama_level: 'Level 1: Pemula (Mudah)',
      durasi_detik: 60,
      target_skor: 300,
      keterangan: 'Cocok untuk siswa kelas 1 SD. Durasi santai 60 detik dengan jenis sampah harian sekolah yang mendasar.'
    },
    {
      id_level: 2,
      nama_level: 'Level 2: Terampil (Sedang)',
      durasi_detik: 45,
      target_skor: 500,
      keterangan: 'Cocok untuk siswa kelas 2 SD. Durasi 45 detik dengan kombinasi sampah organik & anorganik bervariasi.'
    },
    {
      id_level: 3,
      nama_level: 'Level 3: Juara Lingkungan (Tantangan)',
      durasi_detik: 30,
      target_skor: 800,
      keterangan: 'Cocok untuk siswa kelas 3 SD. Durasi cepat 30 detik untuk melatih ketangkasan dan fokus memilah.'
    }
  ];

  const DEFAULT_ITEMS = [
    // Organik (id_kategori: 1)
    { id_item: 1, id_kategori: 1, nama_item: 'Kulit Pisang', kode_aset: 'gltf_banana', pesan_edukasi: 'Kulit pisang cepat membusuk alami dan kaya nutrisi untuk menyuburkan tanah (Tong Hijau).' },
    { id_item: 2, id_kategori: 1, nama_item: 'Sisa Gigitan Apel', kode_aset: 'gltf_apple', pesan_edukasi: 'Sisa buah dan makanan cepat membusuk menjadi pupuk kompos alami! Masukkan ke Tong Organik.' },
    { id_item: 3, id_kategori: 1, nama_item: 'Daun Kering', kode_aset: 'gltf_leaf', pesan_edukasi: 'Daun gugur pepohonan sekolah dapat dijadikan kompos tanaman (Tong Hijau).' },
    { id_item: 4, id_kategori: 1, nama_item: 'Roti Kadaluarsa', kode_aset: 'gltf_bread', pesan_edukasi: 'Sisa roti dan remah makanan mudah terurai alami di dalam tanah (Tong Organik).' },

    // Anorganik (id_kategori: 2)
    { id_item: 5, id_kategori: 2, nama_item: 'Botol Plastik Minuman', kode_aset: 'gltf_bottle', pesan_edukasi: 'Botol plastik butuh 450 tahun untuk hancur! Wajib dipilah ke Tong Anorganik (Kuning).' },
    { id_item: 6, id_kategori: 2, nama_item: 'Kaleng Minuman Soda', kode_aset: 'gltf_can', pesan_edukasi: 'Kaleng aluminium pabrik tidak bisa membusuk, namun bisa dilebur kembali (Tong Kuning).' },
    { id_item: 7, id_kategori: 2, nama_item: 'Bebek Mainan Plastik', kode_aset: 'gltf_duck', pesan_edukasi: 'Mainan berbahan plastik sintetis keras termasuk sampah anorganik (Tong Kuning).' },
    { id_item: 8, id_kategori: 2, nama_item: 'Gelas Plastik & Sedotan', kode_aset: 'gltf_straw', pesan_edukasi: 'Sedotan dan gelas plastik sekali pakai berbahaya jika hanyut ke sungai (Tong Kuning).' },
    { id_item: 9, id_kategori: 2, nama_item: 'Kardus Box Makanan', kode_aset: 'gltf_box', pesan_edukasi: 'Kardus kemasan kertas tebal harus dipilah kering agar dapat didaur ulang (Tong Kuning).' },
    { id_item: 10, id_kategori: 2, nama_item: 'Kertas Buku Bekas', kode_aset: 'gltf_paper', pesan_edukasi: 'Kertas buku tulis termasuk sampah anorganik kering yang siap didaur ulang menjadi kertas baru.' },
    { id_item: 11, id_kategori: 2, nama_item: 'Koran Bekas', kode_aset: 'gltf_newspaper', pesan_edukasi: 'Kertas koran bekas tidak boleh dibakar karena berasap pekat, masukkan ke Tong Anorganik.' },
    { id_item: 12, id_kategori: 2, nama_item: 'Karton Kotak Susu', kode_aset: 'gltf_carton', pesan_edukasi: 'Karton kemasan susu memiliki lapisan kedap air, buang ke Tong Anorganik agar didaur ulang.' }
  ];

  const DEFAULT_LEVEL_ITEMS = [
    // Level 1: 6 item
    { id_level_item: 1, id_level: 1, id_item: 1 },
    { id_level_item: 2, id_level: 1, id_item: 2 },
    { id_level_item: 3, id_level: 1, id_item: 3 },
    { id_level_item: 4, id_level: 1, id_item: 5 },
    { id_level_item: 5, id_level: 1, id_item: 6 },
    { id_level_item: 6, id_level: 1, id_item: 9 },

    // Level 2: 9 item
    { id_level_item: 7, id_level: 2, id_item: 1 },
    { id_level_item: 8, id_level: 2, id_item: 2 },
    { id_level_item: 9, id_level: 2, id_item: 3 },
    { id_level_item: 10, id_level: 2, id_item: 4 },
    { id_level_item: 11, id_level: 2, id_item: 5 },
    { id_level_item: 12, id_level: 2, id_item: 6 },
    { id_level_item: 13, id_level: 2, id_item: 7 },
    { id_level_item: 14, id_level: 2, id_item: 8 },
    { id_level_item: 15, id_level: 2, id_item: 9 },

    // Level 3: 12 item (lengkap)
    { id_level_item: 16, id_level: 3, id_item: 1 },
    { id_level_item: 17, id_level: 3, id_item: 2 },
    { id_level_item: 18, id_level: 3, id_item: 3 },
    { id_level_item: 19, id_level: 3, id_item: 4 },
    { id_level_item: 20, id_level: 3, id_item: 5 },
    { id_level_item: 21, id_level: 3, id_item: 6 },
    { id_level_item: 22, id_level: 3, id_item: 7 },
    { id_level_item: 23, id_level: 3, id_item: 8 },
    { id_level_item: 24, id_level: 3, id_item: 9 },
    { id_level_item: 25, id_level: 3, id_item: 10 },
    { id_level_item: 26, id_level: 3, id_item: 11 },
    { id_level_item: 27, id_level: 3, id_item: 12 }
  ];

  const DEFAULT_SESI = [
    { id_sesi: 1, id_level: 1, tanggal_sesi: '2026-11-20 08:30:00', skor_akhir: 600, jumlah_benar: 6, jumlah_salah: 0 },
    { id_sesi: 2, id_level: 2, tanggal_sesi: '2026-11-20 08:45:00', skor_akhir: 800, jumlah_benar: 8, jumlah_salah: 1 },
    { id_sesi: 3, id_level: 3, tanggal_sesi: '2026-11-20 09:00:00', skor_akhir: 1000, jumlah_benar: 10, jumlah_salah: 2 }
  ];

  class DatabaseStore {
    constructor() {
      this.init();
    }

    _get(table) {
      try {
        const val = localStorage.getItem(STORAGE_PREFIX + table);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        return null;
      }
    }

    _set(table, data) {
      try {
        localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(data));
      } catch (e) {}
    }

    init() {
      // 1. kategori_sampah
      if (!this._get('kategori_sampah')) this._set('kategori_sampah', DEFAULT_CATEGORIES);
      // 2. level_permainan
      if (!this._get('level_permainan')) this._set('level_permainan', DEFAULT_LEVELS);
      // 3. item_sampah
      if (!this._get('item_sampah')) this._set('item_sampah', DEFAULT_ITEMS);
      // 4. level_item
      if (!this._get('level_item')) this._set('level_item', DEFAULT_LEVEL_ITEMS);
      // 5. sesi_permainan
      if (!this._get('sesi_permainan')) this._set('sesi_permainan', DEFAULT_SESI);
      // 6. detail_jawaban
      if (!this._get('detail_jawaban')) this._set('detail_jawaban', []);
    }

    // =========================================================================
    // 1. KATEGORI SAMPAH
    // =========================================================================
    getAllKategori() {
      return this._get('kategori_sampah') || DEFAULT_CATEGORIES;
    }

    getKategoriById(idKat) {
      const list = this.getAllKategori();
      return list.find(k => k.id_kategori === Number(idKat));
    }

    // =========================================================================
    // 2. LEVEL PERMAINAN
    // =========================================================================
    getAllLevels() {
      return this._get('level_permainan') || DEFAULT_LEVELS;
    }

    getLevelById(idLevel) {
      const list = this.getAllLevels();
      return list.find(l => l.id_level === Number(idLevel)) || list[0];
    }

    // =========================================================================
    // 3. ITEM SAMPAH & RELASI LEVEL (level_item)
    // =========================================================================
    getAllItems() {
      const items = this._get('item_sampah') || DEFAULT_ITEMS;
      const categories = this.getAllKategori();
      const levelItems = this._get('level_item') || DEFAULT_LEVEL_ITEMS;

      return items.map(it => {
        const cat = categories.find(c => c.id_kategori === it.id_kategori) || { nama_kategori: 'Organik', warna_tong: 'Hijau' };
        const assignedLevels = levelItems.filter(li => li.id_item === it.id_item).map(li => li.id_level);

        return {
          ...it,
          category: it.id_kategori === 1 ? 'organik' : 'anorganik',
          categoryName: cat.nama_kategori,
          levels: assignedLevels
        };
      });
    }

    getItemsByLevel(idLevel) {
      const levelId = Number(idLevel) || 1;
      const allItems = this.getAllItems();
      const levelItems = this._get('level_item') || DEFAULT_LEVEL_ITEMS;

      const itemIds = levelItems.filter(li => li.id_level === levelId).map(li => li.id_item);
      const filtered = allItems.filter(it => itemIds.includes(it.id_item));
      return filtered.length > 0 ? filtered : allItems;
    }

    getItemById(idItem) {
      const all = this.getAllItems();
      return all.find(it => it.id_item === Number(idItem));
    }

    addItem(itemData) {
      const items = this._get('item_sampah') || [];
      const newId = items.length > 0 ? Math.max(...items.map(i => i.id_item)) + 1 : 1;

      const newItem = {
        id_item: newId,
        id_kategori: Number(itemData.id_kategori) || 1,
        nama_item: itemData.nama_item.trim(),
        kode_aset: itemData.kode_aset || 'gltf_bottle',
        pesan_edukasi: itemData.pesan_edukasi || 'Pilah sampah ke tempat yang sesuai!'
      };

      items.push(newItem);
      this._set('item_sampah', items);

      // Simpan relasi level_item jika ditentukan
      const selectedLevels = Array.isArray(itemData.levels) ? itemData.levels : [1, 2, 3];
      const levelItems = this._get('level_item') || [];
      let maxLiId = levelItems.length > 0 ? Math.max(...levelItems.map(l => l.id_level_item)) : 0;

      selectedLevels.forEach(lvlId => {
        maxLiId++;
        levelItems.push({
          id_level_item: maxLiId,
          id_level: Number(lvlId),
          id_item: newId
        });
      });
      this._set('level_item', levelItems);

      return { success: true, item: newItem };
    }

    updateItem(idItem, itemData) {
      idItem = Number(idItem);
      const items = this._get('item_sampah') || [];
      const it = items.find(i => i.id_item === idItem);
      if (!it) return { success: false, message: 'Item sampah tidak ditemukan.' };

      it.nama_item = itemData.nama_item.trim();
      it.id_kategori = Number(itemData.id_kategori) || it.id_kategori;
      it.kode_aset = itemData.kode_aset || it.kode_aset;
      it.pesan_edukasi = itemData.pesan_edukasi || it.pesan_edukasi;

      this._set('item_sampah', items);

      // Perbarui relasi level_item
      if (Array.isArray(itemData.levels)) {
        let levelItems = this._get('level_item') || [];
        levelItems = levelItems.filter(li => li.id_item !== idItem);
        let maxLiId = levelItems.length > 0 ? Math.max(...levelItems.map(l => l.id_level_item)) : 0;

        itemData.levels.forEach(lvlId => {
          maxLiId++;
          levelItems.push({
            id_level_item: maxLiId,
            id_level: Number(lvlId),
            id_item: idItem
          });
        });
        this._set('level_item', levelItems);
      }

      return { success: true, item: it };
    }

    deleteItem(idItem) {
      idItem = Number(idItem);
      let items = this._get('item_sampah') || [];
      if (items.length <= 4) {
        return { success: false, message: 'Minimal harus ada 4 item sampah di dalam game!' };
      }

      items = items.filter(i => i.id_item !== idItem);
      this._set('item_sampah', items);

      // Hapus relasi cascade level_item
      let levelItems = this._get('level_item') || [];
      levelItems = levelItems.filter(li => li.id_item !== idItem);
      this._set('level_item', levelItems);

      return { success: true, message: 'Item sampah berhasil dihapus.' };
    }

    resetItemsToDefault() {
      this._set('item_sampah', DEFAULT_ITEMS);
      this._set('level_item', DEFAULT_LEVEL_ITEMS);
      return { success: true };
    }

    // =========================================================================
    // 4. SESI PERMAINAN & DETAIL JAWABAN (Tanpa Data Pribadi Siswa)
    // =========================================================================
    saveSesiPermainan({ id_level, skor_akhir, jumlah_benar, jumlah_salah, roundLogs = [] }) {
      const sesiList = this._get('sesi_permainan') || [];
      const newIdSesi = sesiList.length > 0 ? Math.max(...sesiList.map(s => s.id_sesi)) + 1 : 1;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newSesi = {
        id_sesi: newIdSesi,
        id_level: Number(id_level) || 1,
        tanggal_sesi: timeStr,
        skor_akhir: Number(skor_akhir) || 0,
        jumlah_benar: Number(jumlah_benar) || 0,
        jumlah_salah: Number(jumlah_salah) || 0
      };

      sesiList.unshift(newSesi);
      this._set('sesi_permainan', sesiList);

      // Simpan ke detail_jawaban
      if (Array.isArray(roundLogs) && roundLogs.length > 0) {
        const details = this._get('detail_jawaban') || [];
        let maxDetailId = details.length > 0 ? Math.max(...details.map(d => d.id_detail)) : 0;

        roundLogs.forEach(log => {
          maxDetailId++;
          let catDipilihId = 1;
          if (log.id_kategori_dipilih === 'anorganik' || log.id_kategori_dipilih === 2) catDipilihId = 2;

          details.push({
            id_detail: maxDetailId,
            id_sesi: newIdSesi,
            id_item: log.id_item || 1,
            id_kategori_dipilih: catDipilihId,
            is_benar: log.is_benar ? 1 : 0
          });
        });

        this._set('detail_jawaban', details);
      }

      // Sync ke Cloud Database Supabase jika terhubung
      if (window.cloudDB && typeof window.cloudDB.syncSesiPermainan === 'function') {
        window.cloudDB.syncSesiPermainan(newSesi, roundLogs);
      }

      return newSesi;
    }

    getAllSesi() {
      const sesiList = this._get('sesi_permainan') || [];
      const levels = this.getAllLevels();

      return sesiList.map(s => {
        const lvl = levels.find(l => l.id_level === s.id_level) || { nama_level: 'Level 1' };
        const total = (s.jumlah_benar + s.jumlah_salah);
        const akurasi = total > 0 ? Math.round((s.jumlah_benar / total) * 100) : 0;

        return {
          ...s,
          nama_level: lvl.nama_level,
          akurasi_persen: akurasi
        };
      });
    }

    deleteSesi(idSesi) {
      idSesi = Number(idSesi);
      let list = this._get('sesi_permainan') || [];
      list = list.filter(s => s.id_sesi !== idSesi);
      this._set('sesi_permainan', list);

      let details = this._get('detail_jawaban') || [];
      details = details.filter(d => d.id_sesi !== idSesi);
      this._set('detail_jawaban', details);

      return { success: true, message: 'Sesi permainan berhasil dihapus!' };
    }

    resetAllSesi() {
      this._set('sesi_permainan', []);
      this._set('detail_jawaban', []);
      return { success: true, message: 'Seluruh riwayat sesi permainan berhasil dibersihkan!' };
    }
  }

  window.dbStore = new DatabaseStore();
})();
