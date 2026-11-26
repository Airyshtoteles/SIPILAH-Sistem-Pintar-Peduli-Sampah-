/* ==========================================================================
   App.js - Main Application Controller (6 Layar Standar 3NF)
   Kelompok 05 - SANY (Teknik Informatika UNIKU)
   Mitra: SDN 1 Ciawilor & SDN 2 Ciawilor
   ========================================================================== */

(function() {
  class AppController {
    constructor() {
      this.currentScreen = 'screen-menu';
      this.lastResultData = null;
      this.currentLevelId = 1;
      this.modelsReady = false;
      this.pendingLevelStart = null;

      // Preload GLTF Models first
      if (window.ModelFactory3D) {
        window.ModelFactory3D.preloadModels(() => {
          console.log('[SIPILAH] GLTF Model assets preloaded successfully!');
          this.modelsReady = true;
          if (this.pendingLevelStart !== null) {
            const lvl = this.pendingLevelStart;
            this.pendingLevelStart = null;
            this.showScreen('screen-game');
            this.gameEngine.startLevel(lvl);
          }
        });
      } else {
        this.modelsReady = true;
      }

      this.initScene();
      this.initEduSlides();
      this.initUIEvents();
      this.startAnimationLoop();
    }

    initScene() {
      this.parkScene = new window.ParkScene3D('canvas-container');

      this.gameEngine = new window.GameEngine3D(
        this.parkScene,
        (score, combo, lives) => this.updateHUD(score, combo, lives),
        (itemData, wrongCategory, callback) => this.showWrongFeedbackModal(itemData, wrongCategory, callback),
        (resultData) => this.handleGameOver(resultData)
      );
    }

    initEduSlides() {
      this.eduController = new window.EduSlidesController(
        'edu-slide-content',
        'edu-slide-counter',
        'edu-progress-fill',
        'btn-edu-prev',
        'btn-edu-next',
        'btn-edu-skip-game',
        () => {
          // Setelah membaca panduan, arahkan siswa ke Layar 2 (Pilih Level)
          this.showScreen('screen-level');
        }
      );
      this.eduController.render();
    }

    initUIEvents() {
      // Audio activation on first user interaction
      const unlockAudio = () => {
        if (window.audioSystem) window.audioSystem.init();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);

      // 1. Menu Buttons (Layar 1)
      const startBtn = document.getElementById('btn-start-game');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.showScreen('screen-level');
        });
      }

      const openEduBtn = document.getElementById('btn-open-edu');
      if (openEduBtn) {
        openEduBtn.addEventListener('click', () => {
          this.showScreen('screen-edu');
          this.eduController.reset();
        });
      }

      const openLeaderboardBtn = document.getElementById('btn-open-leaderboard');
      if (openLeaderboardBtn) {
        openLeaderboardBtn.addEventListener('click', () => {
          this.showLeaderboardModal();
        });
      }

      // 2. Level Selection Buttons (Layar 2)
      const levelSelectBtns = document.querySelectorAll('.btn-select-level, .level-card-item');
      levelSelectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const levelVal = btn.getAttribute('data-level');
          if (levelVal) {
            this.startSelectedLevel(Number(levelVal));
          }
        });
      });

      const backFromLevelBtn = document.getElementById('btn-back-menu-from-level');
      if (backFromLevelBtn) {
        backFromLevelBtn.addEventListener('click', () => {
          this.showScreen('screen-menu');
        });
      }

      // 3. HUD Controls (Layar 3)
      const toggleSoundBtn = document.getElementById('btn-toggle-sound');
      if (toggleSoundBtn) {
        toggleSoundBtn.addEventListener('click', () => {
          if (window.audioSystem) {
            const isMuted = window.audioSystem.toggleMute();
            const soundIcon = document.getElementById('sound-icon');
            if (soundIcon) {
              soundIcon.className = isMuted ? 'fa-solid fa-volume-xmark text-red' : 'fa-solid fa-volume-high';
            }
          }
        });
      }

      const homeFromHudBtn = document.getElementById('btn-home-from-hud');
      if (homeFromHudBtn) {
        homeFromHudBtn.addEventListener('click', async () => {
          let ok = true;
          if (window.uiFeedback) {
            ok = await window.uiFeedback.confirm({
              title: 'Kembali ke Menu Utama?',
              message: 'Permainan yang sedang berjalan akan dihentikan. Apakah kamu yakin ingin kembali ke Menu Utama?',
              confirmText: 'Ya, Kembali',
              cancelText: 'Lanjut Main',
              type: 'warning'
            });
          }
          if (ok) {
            if (this.gameEngine) this.gameEngine.clearAllTrashItems();
            this.showScreen('screen-menu');
          }
        });
      }

      const closeFeedbackBtn = document.getElementById('btn-close-feedback');
      if (closeFeedbackBtn) {
        const handleCloseFeedback = (e) => {
          if (e) e.stopPropagation();
          const modal = document.getElementById('edu-feedback-modal');
          if (modal) modal.classList.add('hidden');
          if (this.pendingFeedbackCallback) {
            const cb = this.pendingFeedbackCallback;
            this.pendingFeedbackCallback = null;
            try { cb(); } catch (err) {}
          }
        };
        closeFeedbackBtn.addEventListener('click', handleCloseFeedback);
        closeFeedbackBtn.addEventListener('touchend', handleCloseFeedback, { passive: true });
      }

      // 4. Game Over Buttons (Layar 4)
      const restartBtn = document.getElementById('btn-restart-game');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.startSelectedLevel(this.currentLevelId || 1);
        });
      }

      const changeLevelBtn = document.getElementById('btn-change-level');
      if (changeLevelBtn) {
        changeLevelBtn.addEventListener('click', () => {
          this.showScreen('screen-level');
        });
      }

      const viewLeaderboardBtn = document.getElementById('btn-view-leaderboard');
      if (viewLeaderboardBtn) {
        viewLeaderboardBtn.addEventListener('click', () => {
          this.showLeaderboardModal();
        });
      }

      const homeFromGameoverBtn = document.getElementById('btn-home-from-gameover');
      if (homeFromGameoverBtn) {
        homeFromGameoverBtn.addEventListener('click', () => {
          this.showScreen('screen-menu');
        });
      }

      // Modal Close Buttons
      const closeLeaderboardBtn = document.getElementById('btn-close-leaderboard');
      if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', () => {
          document.getElementById('modal-leaderboard').classList.add('hidden');
        });
      }
    }

    startSelectedLevel(levelId) {
      this.currentLevelId = Number(levelId) || 1;

      if (!this.modelsReady) {
        this.pendingLevelStart = this.currentLevelId;
        if (window.uiFeedback) window.uiFeedback.toast('Menyiapkan model 3D...', 'info');
        return;
      }

      this.showScreen('screen-game');
      this.gameEngine.startLevel(this.currentLevelId);
    }

    showScreen(screenId) {
      const screens = document.querySelectorAll('.screen');
      screens.forEach(s => s.classList.add('hidden'));

      const targetScreen = document.getElementById(screenId);
      if (targetScreen) targetScreen.classList.remove('hidden');

      this.currentScreen = screenId;
    }

    updateHUD(score, combo, lives) {
      const scoreEl = document.getElementById('hud-score');
      if (scoreEl) scoreEl.textContent = score.toLocaleString('id-ID');

      const comboBadge = document.getElementById('hud-combo-badge');
      const comboText = document.getElementById('hud-combo-text');
      if (combo > 1) {
        if (comboBadge) comboBadge.classList.remove('hidden');
        if (comboText) comboText.textContent = `COMBO x${combo}`;
      } else {
        if (comboBadge) comboBadge.classList.add('hidden');
      }

      const livesEl = document.getElementById('hud-lives');
      if (livesEl) {
        let heartsHTML = '';
        for (let i = 0; i < 3; i++) {
          if (i < lives) {
            heartsHTML += `<i class="fa-solid fa-heart text-red"></i>`;
          } else {
            heartsHTML += `<i class="fa-regular fa-heart text-muted"></i>`;
          }
        }
        livesEl.innerHTML = heartsHTML;
      }
    }

    showWrongFeedbackModal(itemData, wrongCategory, callback) {
      this.pendingFeedbackCallback = callback;

      const modal = document.getElementById('edu-feedback-modal');
      const infoEl = document.getElementById('feedback-item-info');
      const tipEl = document.getElementById('feedback-tip-text');

      if (infoEl) infoEl.innerHTML = `<strong>${itemData.name}</strong> tidak cocok di tempat sampah ini.`;
      if (tipEl) tipEl.textContent = `${itemData.tip} Kategori yang benar adalah: ${itemData.categoryName}!`;

      modal.classList.remove('hidden');
    }

    handleGameOver(resultData) {
      this.lastResultData = resultData;

      const resScore = document.getElementById('res-score');
      const resAcc = document.getElementById('res-accuracy');
      const resCorrect = document.getElementById('res-correct');
      const resWrong = document.getElementById('res-wrong');
      const resCombo = document.getElementById('res-maxcombo');
      const resStars = document.getElementById('res-stars');
      const resStarFeedback = document.getElementById('res-star-feedback');
      const resultTitle = document.getElementById('result-title');

      if (resScore) resScore.textContent = resultData.score.toLocaleString('id-ID');
      if (resAcc) resAcc.textContent = `${resultData.accuracy}%`;
      if (resCorrect) resCorrect.textContent = resultData.correctCount || 0;
      if (resWrong) resWrong.textContent = resultData.wrongCount || 0;
      if (resCombo) resCombo.textContent = `x${resultData.maxCombo}`;

      const stars = resultData.stars || 1;
      if (resStars) {
        let starsHTML = '';
        for (let s = 1; s <= 3; s++) {
          if (s <= stars) {
            starsHTML += `<i class="fa-solid fa-star star-active" style="color: #fbbf24; font-size: 2.2rem; margin: 0 4px;"></i>`;
          } else {
            starsHTML += `<i class="fa-solid fa-star star-empty" style="color: #cbd5e1; font-size: 2.2rem; margin: 0 4px;"></i>`;
          }
        }
        resStars.innerHTML = starsHTML;
      }

      if (resStarFeedback) {
        resStarFeedback.textContent = resultData.starFeedback || 'Hebat! Terus Berlatih Memilah Sampah!';
      }

      if (resultTitle) {
        if (stars === 3) {
          resultTitle.textContent = 'Luar Biasa! Kamu Juara Lingkungan Ciawilor! 🏆';
        } else if (stars === 2) {
          resultTitle.textContent = 'Hebat! Kamu Pahlawan Pemilah Sampah! 🌱';
        } else {
          resultTitle.textContent = 'Waktu Habis! Ayo Coba Lagi dengan Semangat! 🌟';
        }
      }

      if (window.teacherDashboard && typeof window.teacherDashboard.updateActiveSesiBadges === 'function') {
        window.teacherDashboard.updateActiveSesiBadges();
      }

      this.showScreen('screen-gameover');
    }

    showLeaderboardModal() {
      const modal = document.getElementById('modal-leaderboard');
      const tbody = document.getElementById('leaderboard-tbody');
      if (modal && tbody) {
        if (window.LeaderboardManager) {
          window.LeaderboardManager.renderTable(tbody);
          window.LeaderboardManager.initClearAllButton(tbody);
        }
        modal.classList.remove('hidden');
      }
    }

    startAnimationLoop() {
      const animate = () => {
        requestAnimationFrame(animate);

        if (this.currentScreen === 'screen-game' && this.gameEngine) {
          this.gameEngine.update();
        } else if (this.parkScene) {
          this.parkScene.render();
        }
      };
      animate();
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.app = window.appInstance = new AppController();
  });
})();
