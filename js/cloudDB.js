/* ==========================================================================
   cloudDB.js - Live Cloud Database Connector (Vercel Environment Variables & Supabase)
   Otomatis terhubung melalui Vercel Environment Variables (/api/config)
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  class CloudDatabaseConnector {
    constructor() {
      this.client = null;
      this.isConnected = false;
      this.config = { url: '', anonKey: '' };

      // Otomatis fetch konfigurasi dari Vercel Environment Variables (/api/config)
      this.autoConnectFromEnv();
    }

    async autoConnectFromEnv() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (data.connected && data.SUPABASE_URL && data.SUPABASE_ANON_KEY) {
            this.config = {
              url: data.SUPABASE_URL,
              anonKey: data.SUPABASE_ANON_KEY
            };
            await this.init();
            return;
          }
        }
      } catch (e) {
        // Jika berjalan offline (file://) atau tanpa Vercel API
      }

      // Cek fallback dari window config jika diset manual
      if (window.SIPILAH_CLOUD_CONFIG && window.SIPILAH_CLOUD_CONFIG.url) {
        this.config = window.SIPILAH_CLOUD_CONFIG;
        await this.init();
      }
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
            console.log('🟢 [CloudDB] Berhasil terhubung ke Cloud Database Supabase via Vercel Environment Variables!');
            this.updateBadgeUI();
            return true;
          } else {
            console.warn('[CloudDB] Ping error:', error.message);
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
      const pill = document.getElementById('cloud-env-pill');
      if (pill) {
        if (this.isConnected) {
          pill.className = 'cloud-env-pill connected';
          pill.innerHTML = `<i class="fa-solid fa-cloud"></i> Cloud DB Online (Supabase)`;
          pill.title = 'Terhubung ke Cloud Database terpusat via Vercel Environment Variables';
        } else {
          pill.className = 'cloud-env-pill offline';
          pill.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Penyimpanan Lokal Aktif`;
          pill.title = 'Data tersimpan di penyimpanan browser guru (Offline Ready)';
        }
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

        console.log('🚀 [CloudDB] Nilai siswa & log pilah berhasil disinkronkan ke Cloud Supabase!');
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
          console.log('🚀 [CloudDB] Sesi baru berhasil tersimpan ke Cloud Supabase!');
          return data[0];
        }
      } catch (e) {
        console.warn('[CloudDB] Sync sesi exception:', e);
      }
      return null;
    }

    // 3. Hapus Data Siswa Bermain dari Cloud
    async deleteHasilBermain(idHasil) {
      if (!this.isConnected || !this.client) return false;
      try {
        await this.client.from('tb_log_pemilahan').delete().eq('id_hasil', Number(idHasil));
        const { error } = await this.client.from('tb_hasil_bermain').delete().eq('id_hasil', Number(idHasil));
        if (!error) {
          console.log(`🗑️ [CloudDB] Data hasil ID #${idHasil} berhasil dihapus dari Supabase!`);
          return true;
        }
      } catch (e) {
        console.warn('[CloudDB] Delete hasil exception:', e);
      }
      return false;
    }

    // 4. Bersihkan Seluruh Data Siswa dalam Sesi Terpilih dari Cloud
    async resetHasilBySesi(idSesi) {
      if (!this.isConnected || !this.client) return false;
      try {
        const { data } = await this.client.from('tb_hasil_bermain').select('id_hasil').eq('id_sesi', Number(idSesi));
        if (data && data.length > 0) {
          const ids = data.map(d => d.id_hasil);
          await this.client.from('tb_log_pemilahan').delete().in('id_hasil', ids);
          await this.client.from('tb_hasil_bermain').delete().eq('id_sesi', Number(idSesi));
          console.log(`🗑️ [CloudDB] Seluruh hasil sesi #${idSesi} berhasil dibersihkan dari Supabase!`);
          return true;
        }
      } catch (e) {
        console.warn('[CloudDB] Reset sesi exception:', e);
      }
      return false;
    }

    // 5. Hapus Sesi Kelas dari Cloud
    async deleteSesi(idSesi) {
      if (!this.isConnected || !this.client) return false;
      try {
        const { error } = await this.client.from('tb_sesi_kelas').delete().eq('id_sesi', Number(idSesi));
        if (!error) {
          console.log(`🗑️ [CloudDB] Sesi #${idSesi} berhasil dihapus dari Supabase!`);
          return true;
        }
      } catch (e) {
        console.warn('[CloudDB] Delete sesi exception:', e);
      }
      return false;
    }
  }

  window.cloudDB = new CloudDatabaseConnector();
})();
