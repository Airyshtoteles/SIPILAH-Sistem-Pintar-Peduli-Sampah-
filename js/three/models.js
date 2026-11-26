/* ==========================================================================
   Models.js - Real Converted Sketchfab 3D GLB Model Engine
   With Robust Bounding Centering & Safe Fallbacks
   ========================================================================== */

(function() {
  const trashDatabase = [
    // ORGANIK (Hijau) - id_kategori: 1
    { id: 'banana', id_item: 1, name: 'Kulit Pisang', category: 'organik', categoryName: 'Organik (Hijau)', meshType: 'gltf_banana', tip: 'Kulit pisang cepat membusuk alami dan kaya nutrisi untuk menyuburkan tanah (Tong Hijau).' },
    { id: 'apple', id_item: 2, name: 'Sisa Gigitan Apel', category: 'organik', categoryName: 'Organik (Hijau)', meshType: 'gltf_apple', tip: 'Sisa buah & makanan cepat membusuk menjadi pupuk kompos alami! Masukkan ke Tong Hijau (Organik).' },
    { id: 'leaf', id_item: 3, name: 'Daun Kering', category: 'organik', categoryName: 'Organik (Hijau)', meshType: 'gltf_leaf', tip: 'Daun gugur termasuk sampah organik halaman sekolah yang sangat mudah terurai (Tong Hijau).' },
    { id: 'bread', id_item: 4, name: 'Roti Kadaluarsa', category: 'organik', categoryName: 'Organik (Hijau)', meshType: 'gltf_bread', tip: 'Sisa roti dan bekal makanan termasuk sampah organik yang mudah membusuk (Tong Hijau).' },

    // ANORGANIK (Kuning) - id_kategori: 2
    { id: 'bottle', id_item: 5, name: 'Botol Plastik Minuman', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_bottle', tip: 'Botol plastik butuh 450 tahun untuk hancur! Wajib dipilah ke Tong Anorganik (Kuning).' },
    { id: 'can', id_item: 6, name: 'Kaleng Minuman Soda', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_can', tip: 'Kaleng aluminium pabrik tidak bisa membusuk, namun bisa didaur ulang (Tong Kuning).' },
    { id: 'duck', id_item: 7, name: 'Bebek Mainan Plastik', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_duck', tip: 'Mainan berbahan plastik sintetis keras termasuk sampah anorganik (Tong Kuning).' },
    { id: 'straw', id_item: 8, name: 'Gelas Plastik & Sedotan', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_straw', tip: 'Sedotan & gelas plastik sekali pakai berbahaya jika hanyut ke sungai (Tong Kuning).' },
    { id: 'box', id_item: 9, name: 'Kardus Box Makanan', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_box', tip: 'Kardus kemasan kertas tebal harus dipilah kering agar dapat didaur ulang (Tong Kuning).' },
    { id: 'paper', id_item: 10, name: 'Kertas Buku Bekas', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_paper', tip: 'Kertas buku tulis termasuk sampah anorganik kering yang siap didaur ulang menjadi kertas baru (Tong Kuning).' },
    { id: 'newspaper', id_item: 11, name: 'Koran Bekas', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_newspaper', tip: 'Kertas koran bekas tidak boleh dibakar, masukkan ke Tong Anorganik agar didaur ulang.' },
    { id: 'carton', id_item: 12, name: 'Karton Kotak Susu', category: 'anorganik', categoryName: 'Anorganik (Kuning)', meshType: 'gltf_carton', tip: 'Karton kemasan susu memiliki lapisan pelindung, buang ke Tong Anorganik agar diolah kembali.' }
  ];

  const gltfCache = {};

  const MODEL_FILES = [
    { key: 'gltf_banana', url: 'assets/models/banana.glb' },
    { key: 'gltf_apple', url: 'assets/models/apple.glb' },
    { key: 'gltf_leaf', url: 'assets/models/leaf.glb' },
    { key: 'gltf_bread', url: 'assets/models/bread.glb' },
    { key: 'gltf_bottle', url: 'assets/models/bottle.glb' },
    { key: 'gltf_can', url: 'assets/models/can.glb' },
    { key: 'gltf_duck', url: 'assets/models/duck.glb' },
    { key: 'gltf_straw', url: 'assets/models/straw.glb' },
    { key: 'gltf_battery', url: 'assets/models/battery.glb' },
    { key: 'gltf_bulb', url: 'assets/models/bulb.glb' },
    { key: 'gltf_medicine', url: 'assets/models/medicine.glb' },
    { key: 'gltf_thermometer', url: 'assets/models/thermometer.glb' },
    { key: 'gltf_box', url: 'assets/models/box.glb' },
    { key: 'gltf_paper', url: 'assets/models/paper.glb' },
    { key: 'gltf_newspaper', url: 'assets/models/newspaper.glb' },
    { key: 'gltf_carton', url: 'assets/models/carton.glb' }
  ];

  function base64ToArrayBuffer(b64) {
    const str = b64.split(',')[1] || b64;
    const bin = window.atob(str);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
  }

  class ModelFactory3D {
    static preloadModels(onComplete) {
      if (!window.THREE || !window.THREE.GLTFLoader) {
        if (onComplete) onComplete();
        return;
      }

      const loader = new window.THREE.GLTFLoader();
      const isHTTP = window.location.protocol === 'http:' || window.location.protocol === 'https:';
      const b64Data = window.GLTF_MODEL_DATA || {};

      const tasks = [];
      MODEL_FILES.forEach(item => {
        if (b64Data[item.key]) {
          tasks.push({ key: item.key, type: 'base64', data: b64Data[item.key] });
        } else if (isHTTP) {
          tasks.push({ key: item.key, type: 'url', url: item.url });
        }
      });

      if (tasks.length === 0) {
        if (onComplete) onComplete();
        return;
      }

      let loaded = 0;
      const total = tasks.length;

      const onDone = (key, scene) => {
        if (scene) {
          gltfCache[key] = scene;
        }
        loaded++;
        if (loaded === total && onComplete) onComplete();
      };

      tasks.forEach(task => {
        if (task.type === 'base64') {
          try {
            const buf = base64ToArrayBuffer(task.data);
            loader.parse(buf, '', (gltf) => {
              onDone(task.key, gltf.scene);
            }, (err) => {
              onDone(task.key, null);
            });
          } catch (e) {
            onDone(task.key, null);
          }
        } else {
          loader.load(task.url, (gltf) => {
            onDone(task.key, gltf.scene);
          }, undefined, (err) => {
            onDone(task.key, null);
          });
        }
      });
    }

    static createTrashBin(category, colorHex, labelText, iconChar, xPos) {
      const THREE = window.THREE;
      const binGroup = new THREE.Group();
      binGroup.userData = { isBin: true, category: category };

      const bodyGeo = new THREE.CylinderGeometry(1.05, 0.85, 2.4, 24);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.15 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.2;
      body.castShadow = true;
      body.receiveShadow = true;
      binGroup.add(body);

      const shieldGeo = new THREE.TorusGeometry(0.45, 0.08, 12, 24);
      const shieldMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.position.set(0, 1.35, 0.96);
      binGroup.add(shield);

      const rimGeo = new THREE.TorusGeometry(1.08, 0.09, 12, 24);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 2.4;
      binGroup.add(rim);

      const mouthGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.1, 16);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.y = 2.38;
      binGroup.add(mouth);

      const handleGeo = new THREE.BoxGeometry(0.6, 0.1, 0.3);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(0, 2.1, -1.05);
      binGroup.add(handle);

      // Invisible Touch Target Cylinder (Expanded 250% for super forgiving mobile touch taps!)
      const hitboxGeo = new THREE.CylinderGeometry(1.6, 1.4, 3.6, 16);
      const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
      hitbox.position.y = 1.6;
      binGroup.add(hitbox);

      binGroup.position.set(xPos, 0, -1.8);
      return binGroup;
    }

    // Real Converted GLB Model Renderer with Exact Bounding Centering & Custom Procedural Thermometer
    static createTrashMesh(itemData) {
      const THREE = window.THREE;
      const itemGroup = new THREE.Group();
      itemGroup.userData = { isTrashItem: true, data: itemData };

      // 🌡️ USER SPECIFIC INSTRUCTION: Use Custom Procedural 3D Mesh ONLY for Thermometer!
      if (itemData.meshType === 'gltf_thermometer') {
        const proceduralThermometer = ModelFactory3D._createProceduralMesh('gltf_thermometer', THREE);
        itemGroup.add(proceduralThermometer);
        return itemGroup;
      }

      // Render Real Converted Sketchfab GLB model for all other items
      if (gltfCache[itemData.meshType]) {
        let gltfScene = null;
        try {
          if (window.THREE && window.THREE.SkeletonUtils && window.THREE.SkeletonUtils.clone) {
            gltfScene = window.THREE.SkeletonUtils.clone(gltfCache[itemData.meshType]);
          } else {
            gltfScene = gltfCache[itemData.meshType].clone(true);
          }
        } catch (e) {
          console.warn('GLTF clone fallback:', itemData.meshType, e);
          gltfScene = gltfCache[itemData.meshType].clone(false);
        }

        // Materials & Lighting Adjustments
        gltfScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              if (child.material.metalness !== undefined) {
                child.material.metalness = Math.min(child.material.metalness, 0.2);
              }
              if (child.material.roughness !== undefined) {
                child.material.roughness = Math.max(child.material.roughness, 0.3);
              }
              // Fix dark light bulb material
              if (itemData.meshType === 'gltf_bulb') {
                child.material.emissive = new THREE.Color(0xfef08a);
                child.material.emissiveIntensity = 0.35;
                child.material.roughness = 0.1;
              }
            }
          }
        });

        // 1. Reset rotations to compute clean un-rotated bounding box FIRST!
        gltfScene.rotation.set(0, 0, 0);
        gltfScene.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(gltfScene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        let maxDim = Math.max(size.x, size.y, size.z);
        if (!maxDim || isNaN(maxDim) || maxDim <= 0.0001) {
          maxDim = 1.0;
        }

        const TARGET_SIZE_MAP = {
          gltf_box: 1.1,         // Cardboard Box baseline
          gltf_banana: 1.25,
          gltf_apple: 1.35,
          gltf_leaf: 1.3,
          gltf_bread: 1.2,
          gltf_bottle: 1.25,
          gltf_can: 1.2,
          gltf_duck: 1.2,
          gltf_straw: 1.35,
          gltf_battery: 1.25,
          gltf_bulb: 1.3,
          gltf_medicine: 1.3,
          gltf_paper: 1.4,
          gltf_newspaper: 1.4,
          gltf_carton: 1.15
        };

        const targetSize = TARGET_SIZE_MAP[itemData.meshType] || 1.2;
        const scaleFactor = targetSize / maxDim;

        gltfScene.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center geometry directly to local origin (0,0,0)
        gltfScene.position.set(
          -center.x * scaleFactor,
          -center.y * scaleFactor,
          -center.z * scaleFactor
        );

        // 2. Apply Posture Rotations AFTER Centering
        if (itemData.meshType === 'gltf_leaf') {
          gltfScene.rotation.x = -Math.PI / 2; // Lay dry leaf flat on pedestal
        }

        itemGroup.add(gltfScene);
        return itemGroup;
      }

      // Fallback Procedural Mesh
      const mesh = ModelFactory3D._createProceduralMesh(itemData.meshType, THREE);
      itemGroup.add(mesh);
      return itemGroup;
    }

    static _createProceduralMesh(type, THREE) {
      const group = new THREE.Group();

      switch (type) {
        case 'gltf_thermometer': {
          // HD Glass Mercury Thermometer with Silver Metallic Tip & Red Bulb
          const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 16);
          const tubeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1,
            transparent: true,
            opacity: 0.85
          });
          const tube = new THREE.Mesh(tubeGeo, tubeMat);

          const bulbGeo = new THREE.SphereGeometry(0.24, 16, 16);
          const bulbMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            metalness: 0.85,
            roughness: 0.15
          });
          const bulb = new THREE.Mesh(bulbGeo, bulbMat);
          bulb.position.y = -0.65;

          const tipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12);
          const tipMat = new THREE.MeshStandardMaterial({
            color: 0xcbd5e1,
            metalness: 0.95,
            roughness: 0.1
          });
          const tip = new THREE.Mesh(tipGeo, tipMat);
          tip.position.y = 0.65;

          group.add(tube);
          group.add(bulb);
          group.add(tip);
          group.rotation.z = Math.PI / 4; // Lay diagonal on table
          group.scale.set(1.15, 1.15, 1.15);
          break;
        }
        case 'gltf_leaf': {
          const leafGeo = new THREE.PlaneGeometry(1.2, 1.6);
          const leafMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, side: THREE.DoubleSide, roughness: 0.8 });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.rotation.x = -Math.PI / 2;
          group.add(leaf);
          break;
        }
        default: {
          const def = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), new THREE.MeshStandardMaterial({ color: 0xea580c }));
          group.add(def);
          group.scale.set(1.1, 1.1, 1.1);
        }
      }

      return group;
    }
  }

  window.trashDatabase = trashDatabase;
  window.ModelFactory3D = ModelFactory3D;
})();
