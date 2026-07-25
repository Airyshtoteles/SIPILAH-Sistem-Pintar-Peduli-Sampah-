/* ==========================================================================
   Scene.js - High Definition 3D Environment with Gyroscope & Parallax
   ========================================================================== */

(function() {
  class ParkScene3D {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      const THREE = window.THREE;
      if (!THREE) return;

      // 1. Scene & Camera
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xa5f3fc); // Vibrant Sky Blue
      this.scene.fog = new THREE.FogExp2(0xa5f3fc, 0.012);

      this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 1000);
      this.baseCamPos = new THREE.Vector3(0, 5.2, 10.5);
      this.camera.position.copy(this.baseCamPos);
      this.camera.lookAt(0, 1.8, 0);

      // Gyro / Parallax Targets
      this.targetOffset = { x: 0, y: 0 };
      this.currentOffset = { x: 0, y: 0 };

      // 2. HD Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping) {
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      }
      this.container.appendChild(this.renderer.domElement);

      // 3. HD Lighting Setup
      this.setupLights();

      // 4. Park Environment Props
      this.createEnvironment();

      // 5. Parallax & Gyro Listeners
      this.initParallaxAndGyro();

      window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
      const THREE = window.THREE;
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      this.scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
      sunLight.position.set(10, 18, 12);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 40;
      sunLight.shadow.camera.left = -12;
      sunLight.shadow.camera.right = 12;
      sunLight.shadow.camera.top = 12;
      sunLight.shadow.camera.bottom = -12;
      this.scene.add(sunLight);

      const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x388e3c, 0.5);
      this.scene.add(hemiLight);
    }

    createEnvironment() {
      const THREE = window.THREE;

      // Grass Ground
      const groundGeo = new THREE.PlaneGeometry(80, 80);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x4ac057,
        roughness: 0.8,
        metalness: 0.05
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this.scene.add(ground);

      // Center Pedestal / Table for Trash Items (Vibrant HD Wood)
      const tableGeo = new THREE.CylinderGeometry(2.2, 2.5, 1.1, 32);
      const tableMat = new THREE.MeshStandardMaterial({
        color: 0xca8a04,
        roughness: 0.4,
        metalness: 0.1
      });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(0, 0.55, 1.5);
      table.receiveShadow = true;
      table.castShadow = true;
      this.scene.add(table);

      // Wooden Top Ring Accent
      const ringGeo = new THREE.TorusGeometry(2.25, 0.08, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 1.1, 1.5);
      this.scene.add(ring);

      // Low-poly Decorative Park Trees
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const radius = 13 + Math.random() * 6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        this.createTree(x, z);
      }

      // Wooden Park Fence Backdrop
      this.createFenceBackdrop();
    }

    createTree(x, z) {
      const THREE = window.THREE;
      const treeGroup = new THREE.Group();

      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.4, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const leafColors = [0x15803d, 0x16a34a, 0x22c55e];
      for (let i = 0; i < 3; i++) {
        const leafGeo = new THREE.ConeGeometry(1.6 - (i * 0.3), 2.2, 8);
        const leafMat = new THREE.MeshStandardMaterial({ color: leafColors[i], roughness: 0.6 });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = 2.4 + (i * 1.05);
        leaf.castShadow = true;
        treeGroup.add(leaf);
      }

      treeGroup.position.set(x, 0, z);
      this.scene.add(treeGroup);
    }

    createFenceBackdrop() {
      const THREE = window.THREE;
      const fenceGroup = new THREE.Group();
      const plankMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });

      for (let i = -10; i <= 10; i++) {
        const plankGeo = new THREE.BoxGeometry(0.4, 1.4, 0.08);
        const plank = new THREE.Mesh(plankGeo, plankMat);
        plank.position.set(i * 0.8, 0.7, -6);
        plank.castShadow = true;
        fenceGroup.add(plank);
      }

      // Horizontal Beams
      const beamGeo = new THREE.BoxGeometry(17, 0.12, 0.08);
      const beam1 = new THREE.Mesh(beamGeo, plankMat);
      beam1.position.set(0, 0.4, -5.95);
      const beam2 = new THREE.Mesh(beamGeo, plankMat);
      beam2.position.set(0, 1.0, -5.95);

      fenceGroup.add(beam1);
      fenceGroup.add(beam2);
      this.scene.add(fenceGroup);
    }

    initParallaxAndGyro() {
      // Mouse Parallax for Desktop
      window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        this.targetOffset.x = mouseX * 1.5;
        this.targetOffset.y = -mouseY * 0.8;
      });

      // Device Gyroscope Parallax for Mobile / Tablet
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
          if (e.gamma !== null && e.beta !== null) {
            const tiltX = (e.gamma / 45); // Roll (-45 to 45)
            const tiltY = ((e.beta - 45) / 45); // Pitch
            this.targetOffset.x = Math.max(-1.5, Math.min(1.5, tiltX * 1.5));
            this.targetOffset.y = Math.max(-0.8, Math.min(0.8, tiltY * 0.8));
          }
        }, true);
      }
    }

    onWindowResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);

      // Check Mobile Portrait Warning
      const warningEl = document.getElementById('portrait-warning');
      if (warningEl) {
        if (this.height > this.width && this.width < 600) {
          warningEl.classList.remove('hidden');
        } else {
          warningEl.classList.add('hidden');
        }
      }
    }

    render() {
      if (this.renderer && this.scene && this.camera) {
        // Smooth camera lerp parallax
        this.currentOffset.x += (this.targetOffset.x - this.currentOffset.x) * 0.05;
        this.currentOffset.y += (this.targetOffset.y - this.currentOffset.y) * 0.05;

        this.camera.position.x = this.baseCamPos.x + this.currentOffset.x;
        this.camera.position.y = this.baseCamPos.y + this.currentOffset.y;
        this.camera.lookAt(0, 1.8, 0);

        this.renderer.render(this.scene, this.camera);
      }
    }
  }

  window.ParkScene3D = ParkScene3D;
})();
