/* ==========================================================================
   GameLogic3D.js - Three.js Raycasting, Parabolic Throw Animation & Safe Lifecycle
   ========================================================================== */

(function() {
  class GameEngine3D {
    constructor(parkScene, onScoreChange, onWrongAnswer, onGameOver) {
      this.parkScene = parkScene;
      this.scene = parkScene.scene;
      this.camera = parkScene.camera;
      this.renderer = parkScene.renderer;

      this.onScoreChange = onScoreChange;
      this.onWrongAnswer = onWrongAnswer;
      this.onGameOver = onGameOver;

      // Game State
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.lives = 3;
      this.correctCount = 0;
      this.totalAttempted = 0;
      this.timer = 60;
      this.timerInterval = null;

      this.bins = [];
      this.itemDeck = [];
      this.currentItemGroup = null;
      this.currentItemData = null;
      this.selectedItem = null;
      this.selectionTime = 0;

      this.isAnimatingThrow = false;
      this.throwProgress = 0;
      this.pendingCategoryCheck = null;

      const THREE = window.THREE;
      this.throwStartPos = new THREE.Vector3();
      this.throwEndPos = new THREE.Vector3();

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      this.initBins();
      this.initInteraction();
    }

    initBins() {
      const binConfig = [
        { cat: 'organik', color: 0x10b981, text: 'ORGANIK', icon: '🌿', x: -3.8 },
        { cat: 'anorganik', color: 0xf59e0b, text: 'ANORGANIK', icon: '🥤', x: -1.3 },
        { cat: 'b3', color: 0xef4444, text: 'B3', icon: '⚡', x: 1.3 },
        { cat: 'daurulang', color: 0x06b6d4, text: 'DAUR ULANG', icon: '📦', x: 3.8 }
      ];

      binConfig.forEach(cfg => {
        const binGroup = window.ModelFactory3D.createTrashBin(cfg.cat, cfg.color, cfg.text, cfg.icon, cfg.x);
        this.scene.add(binGroup);
        this.bins.push(binGroup);
      });
    }

    initInteraction() {
      const canvas = this.renderer.domElement;
      
      const handlePointer = (event) => {
        if (this.isAnimatingThrow || this.timer <= 0) return;

        const rect = canvas.getBoundingClientRect();
        let clientX = null;
        let clientY = null;

        if (event.touches && event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
          clientX = event.changedTouches[0].clientX;
          clientY = event.changedTouches[0].clientY;
        } else if (event.clientX !== undefined) {
          clientX = event.clientX;
          clientY = event.clientY;
        }

        if (clientX === null || clientY === null || clientX === undefined || clientY === undefined) return;

        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        if (this.raycaster.params && this.raycaster.params.Points) {
          this.raycaster.params.Points.threshold = 0.8;
        }

        // 1. Raycast against active trash item on pedestal table (First tap picks up item ONLY!)
        if (this.currentItemGroup && !this.selectedItem) {
          const itemIntersects = this.raycaster.intersectObject(this.currentItemGroup, true);
          if (itemIntersects.length > 0) {
            this.selectItem();
            return;
          }
        }

        // 2. Raycast against Bins (Only allowed IF item is already selected & lifted!)
        if (this.selectedItem) {
          for (let bin of this.bins) {
            const binIntersects = this.raycaster.intersectObject(bin, true);
            if (binIntersects.length > 0) {
              this.throwItemToBin(bin);
              return;
            }
          }
        }
      };

      canvas.addEventListener('click', handlePointer);
      canvas.addEventListener('touchend', (e) => {
        handlePointer(e);
      }, { passive: true });

      // Direct tap on Top HUD Guide Pills for mobile devices
      const setupPillClick = (pillClass, catName) => {
        const pill = document.querySelector(pillClass);
        if (pill) {
          const onPillTap = (e) => {
            if (this.isAnimatingThrow || this.timer <= 0) return;
            const targetBin = this.bins.find(b => b.userData.category === catName);
            if (targetBin) {
              if (!this.selectedItem && this.currentItemGroup) {
                this.selectItem();
              } else if (this.selectedItem) {
                this.throwItemToBin(targetBin);
              }
            }
          };
          pill.addEventListener('click', onPillTap);
          pill.addEventListener('touchend', onPillTap, { passive: true });
        }
      };

      setupPillClick('.bin-guide-pill.bin-organik', 'organik');
      setupPillClick('.bin-guide-pill.bin-anorganik', 'anorganik');
      setupPillClick('.bin-guide-pill.bin-b3', 'b3');
      setupPillClick('.bin-guide-pill.bin-daurulang', 'daurulang');

      // Click on target banner auto-selects item
      const targetBanner = document.getElementById('target-item-banner');
      if (targetBanner) {
        const onBannerTap = () => {
          if (!this.isAnimatingThrow && this.currentItemGroup) {
            this.selectItem();
          }
        };
        targetBanner.addEventListener('click', onBannerTap);
        targetBanner.addEventListener('touchend', onBannerTap, { passive: true });
      }
    }

    resetItemDeck() {
      const db = window.trashDatabase || [];
      this.itemDeck = [...db];
      // Fisher-Yates Shuffle Algorithm
      for (let i = this.itemDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.itemDeck[i], this.itemDeck[j]] = [this.itemDeck[j], this.itemDeck[i]];
      }
    }

    startGame() {
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.lives = 3;
      this.correctCount = 0;
      this.totalAttempted = 0;
      this.timer = 60;
      this.isAnimatingThrow = false;
      this.pendingCategoryCheck = null;

      this.resetItemDeck();

      if (this.onScoreChange) {
        this.onScoreChange(this.score, this.combo, this.lives);
      }

      this.spawnNextItem();
      this.startTimer();
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);

      const timerEl = document.getElementById('hud-timer');

      this.timerInterval = setInterval(() => {
        this.timer--;
        if (timerEl) timerEl.textContent = `${this.timer}s`;

        if (this.timer <= 0) {
          clearInterval(this.timerInterval);
          this.endGame();
        }
      }, 1000);
    }

    clearAllTrashItems() {
      if (this.selectedItem) {
        this.scene.remove(this.selectedItem);
        this.selectedItem = null;
      }
      if (this.currentItemGroup) {
        this.scene.remove(this.currentItemGroup);
        this.currentItemGroup = null;
      }
      // Force remove any leftover trash item children from 3D scene
      for (let i = this.scene.children.length - 1; i >= 0; i--) {
        const child = this.scene.children[i];
        if (child && child.userData && child.userData.isTrashItem) {
          this.scene.remove(child);
        }
      }
    }

    spawnNextItem() {
      this.clearAllTrashItems();
      this.isAnimatingThrow = false;
      this.pendingCategoryCheck = null;

      if (!this.itemDeck || this.itemDeck.length === 0) {
        this.resetItemDeck();
      }

      this.currentItemData = this.itemDeck.pop();

      try {
        this.currentItemGroup = window.ModelFactory3D.createTrashMesh(this.currentItemData);
      } catch (e) {
        console.warn('Error creating 3D trash mesh, using fallback:', e);
        this.currentItemGroup = window.ModelFactory3D._createProceduralMesh(this.currentItemData.meshType, window.THREE);
      }

      this.currentItemGroup.position.set(0, 1.45, 1.5);
      this.currentItemGroup.scale.set(1.0, 1.0, 1.0);
      this.scene.add(this.currentItemGroup);

      // Update HUD Banner
      const targetNameEl = document.getElementById('target-item-name');
      const targetHintEl = document.getElementById('target-item-cat');
      if (targetNameEl) targetNameEl.textContent = `Klik/Tap: ${this.currentItemData.name}`;
      if (targetHintEl) targetHintEl.textContent = `?`;
    }

    selectItem() {
      if (!this.currentItemGroup) return;
      this.selectedItem = this.currentItemGroup;
      this.selectionTime = performance.now();
      if (window.audioSystem) window.audioSystem.playPop();

      // Lift item up smoothly & scale up slightly for high-impact visual feedback
      this.selectedItem.position.y = 2.45;
      this.selectedItem.scale.set(1.15, 1.15, 1.15);

      const targetNameEl = document.getElementById('target-item-name');
      if (targetNameEl) targetNameEl.textContent = `Pilih Tempat Sampah untuk: ${this.currentItemData.name}!`;
    }

    throwItemToBin(targetBinGroup) {
      if (!this.selectedItem || this.isAnimatingThrow) return;
      // Guard: Require 200ms delay between selection and throw to prevent accidental single-click auto-throw!
      if (performance.now() - (this.selectionTime || 0) < 200) return;

      this.isAnimatingThrow = true;
      this.throwProgress = 0;

      this.throwStartPos.copy(this.selectedItem.position);
      this.throwEndPos.copy(targetBinGroup.position);
      this.throwEndPos.y += 2.2;

      if (window.audioSystem) window.audioSystem.playThrow();

      const targetCategory = targetBinGroup.userData.category;
      this.pendingCategoryCheck = {
        isCorrect: targetCategory === this.currentItemData.category,
        binGroup: targetBinGroup
      };
    }

    updateAnimation(delta = 0.016) {
      if (this.isAnimatingThrow) {
        this.updateThrowAnimation(delta);
      } else if (this.currentItemGroup) {
        // Continuous Gentle 3D Idle Rotation on the Pedestal Table!
        this.currentItemGroup.rotation.y += delta * 0.8;

        // Gentle floating hover effect if selected
        if (this.selectedItem) {
          const hoverOffset = Math.sin(performance.now() * 0.006) * 0.1;
          this.selectedItem.position.y = 2.45 + hoverOffset;
        }
      }
    }

    updateThrowAnimation(delta = 0.016) {
      if (!this.isAnimatingThrow || !this.selectedItem) return;

      this.throwProgress += delta * 2.8;
      if (this.throwProgress >= 1.0) {
        this.throwProgress = 1.0;
        this.completeThrow();
        return;
      }

      const t = this.throwProgress;
      this.selectedItem.position.x = this.throwStartPos.x + (this.throwEndPos.x - this.throwStartPos.x) * t;
      this.selectedItem.position.z = this.throwStartPos.z + (this.throwEndPos.z - this.throwStartPos.z) * t;
      
      const arcHeight = 2.0;
      this.selectedItem.position.y = this.throwStartPos.y + (this.throwEndPos.y - this.throwStartPos.y) * t + Math.sin(t * Math.PI) * arcHeight;
      this.selectedItem.rotation.y += delta * 7;
    }

    showFloatingToast(text, isCorrect, targetBinGroup) {
      const THREE = window.THREE;
      if (!this.camera || !this.renderer || !targetBinGroup || !targetBinGroup.position) return;

      // Project 3D bin position to 2D screen coordinates
      const binPos = new THREE.Vector3().copy(targetBinGroup.position);
      binPos.y += 2.8;
      binPos.project(this.camera);

      const x = (binPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(binPos.y * 0.5) + 0.5) * window.innerHeight;

      // Create Floating HTML Badge Element
      const toast = document.createElement('div');
      toast.className = `floating-feedback-toast ${isCorrect ? 'correct' : 'wrong'}`;
      toast.innerHTML = text;
      toast.style.left = `${x}px`;
      toast.style.top = `${y}px`;
      document.body.appendChild(toast);

      // Animate Bin Pulse Scale
      if (targetBinGroup.scale) {
        targetBinGroup.scale.set(1.18, 1.18, 1.18);
        setTimeout(() => {
          if (targetBinGroup.scale) targetBinGroup.scale.set(1.0, 1.0, 1.0);
        }, 250);
      }

      // Auto-remove toast after animation
      setTimeout(() => {
        if (toast && toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 1100);
    }

    completeThrow() {
      this.isAnimatingThrow = false;
      const currentWrongItem = this.currentItemData;

      this.clearAllTrashItems();

      const defaultBin = (this.bins && this.bins[0]) ? this.bins[0] : { userData: { category: 'organik' } };
      const check = this.pendingCategoryCheck || { isCorrect: true, binGroup: defaultBin };
      this.pendingCategoryCheck = null;

      this.totalAttempted++;

      if (check.isCorrect) {
        const pointsAdded = 100 + (this.combo * 20);
        this.score += pointsAdded;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.correctCount++;

        // Show High Impact Visual Reaction Toast (+100 BENAR! 🎉)
        const toastText = this.combo > 1 ? `+${pointsAdded} BENAR! 🔥 x${this.combo}` : `+${pointsAdded} BENAR! 🎉`;
        this.showFloatingToast(toastText, true, check.binGroup);

        try {
          if (window.audioSystem) {
            if (typeof window.audioSystem.playCorrect === 'function') window.audioSystem.playCorrect();
            else if (typeof window.audioSystem.playSuccess === 'function') window.audioSystem.playSuccess();
          }
        } catch (e) { console.warn('Audio error:', e); }

        try {
          if (window.confetti) {
            window.confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
          }
        } catch (e) { console.warn('Confetti error:', e); }

        if (this.onScoreChange) {
          this.onScoreChange(this.score, this.combo, this.lives);
        }

        this.spawnNextItem();
      } else {
        this.combo = 0;
        this.lives--;

        // Show High Impact Visual Reaction Toast (❌ SALAH!)
        this.showFloatingToast(`❌ SALAH!`, false, check.binGroup);

        try {
          if (window.audioSystem) {
            if (typeof window.audioSystem.playWrong === 'function') window.audioSystem.playWrong();
            else if (typeof window.audioSystem.playError === 'function') window.audioSystem.playError();
          }
        } catch (e) { console.warn('Audio error:', e); }

        if (this.onScoreChange) {
          this.onScoreChange(this.score, this.combo, this.lives);
        }

        // AUTO-SPAWN NEXT ITEM IMMEDIATELY ON WRONG THROW!
        if (this.lives <= 0) {
          this.endGame();
        } else {
          this.spawnNextItem();
        }

        // Show non-blocking educational tip modal
        if (this.onWrongAnswer) {
          this.onWrongAnswer(currentWrongItem || { name: 'Sampah', tip: 'Perhatikan kategori tempat sampah.', categoryName: 'Organik' }, check.binGroup ? check.binGroup.userData.category : 'organik');
        }
      }
    }

    endGame() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.clearAllTrashItems();
      this.isAnimatingThrow = false;
      this.pendingCategoryCheck = null;
      const accuracy = this.totalAttempted > 0 ? Math.round((this.correctCount / this.totalAttempted) * 100) : 0;

      if (this.onGameOver) {
        this.onGameOver({
          score: this.score,
          accuracy: accuracy,
          maxCombo: this.maxCombo
        });
      }
    }
  }

  window.GameEngine3D = GameEngine3D;
})();
