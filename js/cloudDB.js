/* ==========================================================================
   cloudDB.js - Live Cloud Database Connector (Supabase / REST / Vercel)
   Mendukung Sinkronisasi Online & Pengujian Lapangan Terpusat
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  const STORAGE_KEY = 'sany_cloud_config';

  class CloudDatabaseConnector {
    constructor() {
      this.client = null;
      this.config = this.loadConfig();
      this.isConnected = false;
      this.init();
    }

    loadConfig() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}

      // Fallback ke window global config jika diset via environment/script
      return window.SIPILAH_CLOUD_CONFIG || {
        url: '',
        anonKey: ''
      };
    }

    saveConfig(url, anonKey) {
      this.config = {
        url: (url || '').trim(),
        anonKey: (anonKey || '').trim()
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {}
      return this.init();
    }

    async init() {
      if (!this.config || !this.config.url || !this.config.anonKey) {
        this.isConnected = false;
        this.updateBadgeUI();
        return false;
      }

      if (window.supabase && typeof window.supabase.createClient === 'function') {
        try {
          this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
          // Ping test
          const { data, error } = await this.client.from('tb_kategori_sampah').select('id_kategori').limit(1);
          if (!error) {
            this.isConnected = true;
            console.log('[CloudDB] Connected to hosted Supabase cloud database!');
            this.updateBadgeUI();
            return true;
          } else {
            console.warn('[CloudDB] Connection ping error:', error.message);
            this.isConnected = false;
            this.updateBadgeUI();
            return false;
          }
        } catch (err) {
          console.warn('[CloudDB] Init error:', err);
          this.isConnected = false;
          this.updateBadgeUI();
          return false;
        }
      }
      this.isConnected = false;
      this.updateBadgeUI();
      return false;
    }

    updateBadgeUI() {
      const badge = document.getElementById('cloud-status-text');
      const dot = document.getElementById('cloud-status-dot');
      if (badge) {
        badge.textContent = this.isConnected ? 'Cloud DB: Terhubung' : 'Penyimpanan: Lokal (Offline Ready)';
      }
      if (dot) {
        dot.className = this.isConnected ? 'fa-solid fa-circle text-green' : 'fa-solid fa-circle text-gold';
      }
    }

    // 1. Simpan Hasil Bermain ke Cloud
    async syncHasilBermain(hasil, roundLogs = []) {
      if (!this.isConnected || !this.client) return null;

      try {
        const { data: insertedHasil, error: errHasil } = await this.client
          .from('tb_hasil_bermain')
          .insert([{
            id_sesi: hasil.id_sesi,
            nama_siswa: hasil.nama_siswa,
            skor_akhir: hasil.skor_akhir,
            akurasi_persen: hasil.akurasi_persen,
            max_combo: hasil.max_combo,
            status_sertifikat: hasil.status_sertifikat,
            waktu_bermain: new Date().toISOString()
          }])
          .select();

        if (errHasil || !insertedHasil || insertedHasil.length === 0) {
          console.warn('[CloudDB] Insert hasil error:', errHasil);
          return null;
        }

        const newIdHasil = insertedHasil[0].id_hasil;

        // Insert Logs
        if (Array.isArray(roundLogs) && roundLogs.length > 0) {
          const logPayload = roundLogs.map(l => {
            let catId = 1;
            if (l.id_kategori_dipilih === 'anorganik' || l.id_kategori_dipilih === 2) catId = 2;
            else if (l.id_kategori_dipilih === 'b3' || l.id_kategori_dipilih === 3) catId = 3;
            else if (l.id_kategori_dipilih === 'daurulang' || l.id_kategori_dipilih === 4) catId = 4;

            return {
              id_hasil: newIdHasil,
              id_item: l.id_item || 1,
              id_kategori_dipilih: catId,
              is_benar: l.is_benar ? 1 : 0
            };
          });

          await this.client.from('tb_log_pemilahan').insert(logPayload);
        }

        console.log('[CloudDB] Hasil bermain berhasil disinkronkan ke Cloud!');
        return insertedHasil[0];
      } catch (e) {
        console.warn('[CloudDB] Sync hasil exception:', e);
        return null;
      }
    }

    // 2. Simpan Sesi Baru ke Cloud
    async syncSesiBaru(sesi) {
      if (!this.isConnected || !this.client) return null;

      try {
        const { data, error } = await this.client
          .from('tb_sesi_kelas')
          .insert([{
            id_guru: sesi.id_guru || 1,
            kode_sesi: sesi.kode_sesi,
            nama_kelas: sesi.nama_kelas,
            tanggal_sesi: sesi.tanggal_sesi,
            status_sesi: sesi.status_sesi || 'aktif'
          }])
          .select();

        if (!error && data) {
          console.log('[CloudDB] Sesi baru tersimpan ke Cloud!');
          return data[0];
        }
      } catch (e) {
        console.warn('[CloudDB] Sync sesi exception:', e);
      }
      return null;
    }
  }

  window.cloudDB = new CloudDatabaseConnector();
})();
