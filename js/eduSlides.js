/* ==========================================================================
   EduSlides.js - Interactive Pre-Game Education Deck
   Konteks: SDN 1 & SDN 2 Ciawilor | Program SEMUTLIS & Pembiasaan Disiplin SD
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   ========================================================================== */

(function() {
  const eduSlidesData = [
    {
      id: 1,
      tag: "Masalah Sampah Sekolah",
      tagType: "danger",
      title: "Kenapa Kita Harus Memilah Sampah?",
      iconClass: "fa-solid fa-triangle-exclamation",
      description: "Setiap hari di sekolah, banyak sampah bekal, plastik jajanan, dan daun gugur. Jika dibiarkan tercampur dan berserakan, sekolah jadi kotor dan tidak sehat!",
      items: [
        { iconClass: "fa-solid fa-cloud-showers-heavy", title: "Saluran Air Tersumbat", desc: "Sampah plastik menyumbat selokan sekolah dan memicu genangan air / banjir." },
        { iconClass: "fa-solid fa-mask-face", title: "Sarang Nyamuk & Kuman", desc: "Sampah basah yang membusuk menimbulkan bau tidak sedap dan menyebarkan penyakit." }
      ]
    },
    {
      id: 2,
      tag: "Program Sekolah Unggulan",
      tagType: "success",
      title: "Gerakan SEMUTLIS di Sekolah Kita 🌱",
      iconClass: "fa-solid fa-hand-holding-heart",
      description: "SDN 1 Ciawilor menjalankan program SEMUTLIS (Sepuluh Menit Peduli Lingkungan Sekitar) dan SDN 2 Ciawilor membiasakan disiplin buang sampah sejak kelas 1–3 SD!",
      youtubeId: "_K3hU1iXoFA",
      youtubeUrl: "https://www.youtube.com/results?search_query=dampak+sampah+plastik+di+indonesia+edukasi+anak",
      items: [
        { iconClass: "fa-solid fa-clock", title: "10 Menit Setiap Hari", desc: "Luangkan 10 menit sebelum masuk kelas untuk membersihkan laci meja dan halaman." },
        { iconClass: "fa-solid fa-users", title: "Disiplin Bersama", desc: "Memilah sampah bukan tugas penjaga sekolah saja, tapi tanggung jawab kita semua!" }
      ]
    },
    {
      id: 3,
      tag: "Kenali Jenis Sampah",
      tagType: "danger",
      title: "Plastik Jajanan vs Sampah Berbahaya (B3)",
      iconClass: "fa-solid fa-bottle-water",
      description: "Tahu tidak? Bungkus jajanan dan sedotan plastik butuh ratusan tahun untuk terurai di tanah. Sedangkan baterai dan lampu bekas mengandung racun berbahaya!",
      items: [
        { iconClass: "fa-solid fa-wine-bottle", title: "Sampah Anorganik", desc: "Botol minuman, kaleng soda, dan mainan plastik wajib masuk tong Kuning." },
        { iconClass: "fa-solid fa-bolt", title: "B3 Berbahaya", desc: "Baterai bekas, lampu bohlam rusak, dan obat harus dipisah ke tong Merah agar aman." }
      ]
    },
    {
      id: 4,
      tag: "4 Tong Sampah 3D",
      tagType: "info",
      title: "Ingat 4 Warna Tong Sampah 3D!",
      iconClass: "fa-solid fa-trash-can",
      description: "Di game ini, kamu akan memilah sampah ke 4 tempat sampah 3D sesuai warnanya:",
      items: [
        { iconClass: "fa-solid fa-leaf text-green", title: "ORGANIK (Hijau)", desc: "Kulit pisang, sisa apel, daun kering, sisa roti (Bisa jadi pupuk!)." },
        { iconClass: "fa-solid fa-bottle-water text-gold", title: "ANORGANIK (Kuning)", desc: "Botol air, kaleng minuman, bebek mainan, gelas sedotan." },
        { iconClass: "fa-solid fa-bolt text-red", title: "B3 BERBAHAYA (Merah)", desc: "Baterai bekas, lampu bohlam, botol obat, termometer raksa." },
        { iconClass: "fa-solid fa-box text-blue", title: "DAUR ULANG (Biru)", desc: "Kardus box, kertas buku tulis, koran bekas, karton susu." }
      ]
    },
    {
      id: 5,
      tag: "Misi Kamu di Kelas!",
      tagType: "success",
      title: "Siap Bermain Estafet di Kelas?",
      iconClass: "fa-solid fa-trophy",
      description: "Karena siswa tidak membawa HP, kalian akan bermain bergantian di laptop guru dan proyektor kelas selama 60 detik per siswa!",
      items: [
        { iconClass: "fa-solid fa-hand-pointer", title: "Langkah 1: Klik Sampah", desc: "Klik/tap sampah 3D di meja tengah untuk mengambilnya." },
        { iconClass: "fa-solid fa-bullseye", title: "Langkah 2: Klik Tong Sampah", desc: "Klik tong warna yang tepat. Kumpulkan combo dan cetak sertifikatmu!" }
      ]
    }
  ];

  class EduSlidesController {
    constructor(containerId, counterId, fillId, prevBtnId, nextBtnId, skipBtnId, onCompleteCallback) {
      this.container = document.getElementById(containerId);
      this.counterEl = document.getElementById(counterId);
      this.fillEl = document.getElementById(fillId);
      this.prevBtn = document.getElementById(prevBtnId);
      this.nextBtn = document.getElementById(nextBtnId);
      this.skipBtn = document.getElementById(skipBtnId);
      this.onComplete = onCompleteCallback;

      this.currentIndex = 0;
      this.initEvents();
    }

    initEvents() {
      if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
      if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
      if (this.skipBtn) this.skipBtn.addEventListener('click', () => {
        if (this.onComplete) this.onComplete();
      });
    }

    render() {
      if (!this.container) return;
      const slide = eduSlidesData[this.currentIndex];
      const total = eduSlidesData.length;

      if (this.counterEl) this.counterEl.textContent = `Slide ${this.currentIndex + 1} dari ${total}`;
      if (this.fillEl) this.fillEl.style.width = `${((this.currentIndex + 1) / total) * 100}%`;

      let videoSectionHTML = '';
      if (slide.youtubeUrl) {
        videoSectionHTML = `
          <div style="margin: 10px 0; text-align: center;">
            <a href="${slide.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-danger btn-sm" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700; text-decoration: none; padding: 7px 16px; border-radius: 50px; background: #ef4444; color: #fff; font-size: 0.85rem;">
              <i class="fa-brands fa-youtube" style="font-size: 1.1rem;"></i> Tonton Video Dampak Sampah Indonesia di YouTube
            </a>
          </div>
        `;
      }

      let itemsHTML = '';
      if (slide.items && slide.items.length > 0) {
        itemsHTML = `<div class="edu-grid">
          ${slide.items.map(item => `
            <div class="edu-item-card">
              <i class="${item.iconClass}"></i>
              <div class="edu-item-info">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>`;
      }

      this.container.innerHTML = `
        <div class="slide-content-wrapper">
          <span class="slide-badge-tag ${slide.tagType}">${slide.tag}</span>
          <h2 class="slide-title">${slide.title}</h2>
          <div class="slide-illustration-icon"><i class="${slide.iconClass}"></i></div>
          <p class="slide-description">${slide.description}</p>
          ${videoSectionHTML}
          ${itemsHTML}
        </div>
      `;

      if (this.prevBtn) {
        this.prevBtn.disabled = (this.currentIndex === 0);
        this.prevBtn.style.opacity = (this.currentIndex === 0) ? '0.5' : '1';
      }

      if (this.currentIndex === total - 1) {
        if (this.nextBtn) this.nextBtn.classList.add('hidden');
        if (this.skipBtn) this.skipBtn.classList.remove('hidden');
      } else {
        if (this.nextBtn) this.nextBtn.classList.remove('hidden');
        if (this.skipBtn) this.skipBtn.classList.add('hidden');
      }
    }

    nextSlide() {
      if (this.currentIndex < eduSlidesData.length - 1) {
        this.currentIndex++;
        this.render();
      }
    }

    prevSlide() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.render();
      }
    }

    reset() {
      this.currentIndex = 0;
      this.render();
    }
  }

  window.eduSlidesData = eduSlidesData;
  window.EduSlidesController = EduSlidesController;
})();
