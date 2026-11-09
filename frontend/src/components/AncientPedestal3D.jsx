import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Rotate3D, Box, Sparkles } from 'lucide-react';

export default function AncientPedestal3D({ featuredBook, onInspect }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x101513, 0.04);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 3.1, 5.2);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Lighting Architecture
    const ambientLight = new THREE.AmbientLight(0x243431, 1.4);
    scene.add(ambientLight);

    // Sunlight piercing through the canopy (God-ray source)
    const sunLight = new THREE.DirectionalLight(0xffecd1, 2.9);
    sunLight.position.set(3.5, 7.5, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    // Bioluminescent Amber rim light from below moss
    const bioLight = new THREE.PointLight(0xd4a373, 2.4, 9);
    bioLight.position.set(-1.8, 0.9, 1.4);
    scene.add(bioLight);

    // Volumetric God-ray Soft Cone Meshes
    const coneGeo = new THREE.CylinderGeometry(0.2, 2.2, 7, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xfff0db,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ray1 = new THREE.Mesh(coneGeo, coneMat);
    ray1.position.set(1.2, 3.5, 0.5);
    ray1.rotation.set(-0.35, 0, 0.25);
    scene.add(ray1);

    const ray2 = new THREE.Mesh(coneGeo, coneMat);
    ray2.position.set(-1.4, 3.8, -0.2);
    ray2.rotation.set(-0.25, 0, -0.3);
    ray2.scale.set(0.8, 0.9, 0.8);
    scene.add(ray2);

    // 3. Ancient Mossy Tree Stump Pedestal
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    // Tree Trunk Bark Geometry
    const trunkGeo = new THREE.CylinderGeometry(1.65, 1.95, 1.5, 32, 4);
    const pos = trunkGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      if (v.y > -0.7) {
        const noise = (Math.sin(v.x * 5) + Math.cos(v.z * 5)) * 0.06;
        pos.setXYZ(i, v.x + noise, v.y, v.z + noise);
      }
    }
    trunkGeo.computeVertexNormals();

    const barkMat = new THREE.MeshStandardMaterial({
      color: 0x161e1b,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
    const trunkMesh = new THREE.Mesh(trunkGeo, barkMat);
    trunkMesh.position.y = -0.75;
    trunkMesh.receiveShadow = true;
    trunkMesh.castShadow = true;
    pedestalGroup.add(trunkMesh);

    // Growth Rings on top surface of the stump
    const topCapGeo = new THREE.CylinderGeometry(1.64, 1.64, 0.04, 32);
    const topCapMat = new THREE.MeshStandardMaterial({
      color: 0x243431,
      roughness: 0.85,
    });
    const topCap = new THREE.Mesh(topCapGeo, topCapMat);
    topCap.position.y = 0.01;
    topCap.receiveShadow = true;
    pedestalGroup.add(topCap);

    // Emerald Moss Clumps
    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x3d5c48,
      roughness: 0.85,
    });
    for (let i = 0; i < 11; i++) {
      const angle = (i / 11) * Math.PI * 2;
      const r = 1.55 + (Math.sin(i * 2.8) * 0.1);
      const mossGeo = new THREE.DodecahedronGeometry(0.12 + (i % 3) * 0.05);
      const mossMesh = new THREE.Mesh(mossGeo, mossMat);
      mossMesh.position.set(Math.cos(angle) * r, -0.02, Math.sin(angle) * r);
      mossMesh.rotation.set(Math.random(), Math.random(), Math.random());
      mossMesh.receiveShadow = true;
      pedestalGroup.add(mossMesh);
    }

    // 4. Physical 3D Hardcover Book with Dynamic Gilded Title Texture
    const bookTitle = featuredBook?.judul || 'Filosofi Teras';
    const bookAuthor = featuredBook?.penulis || 'Henry Manampiring';
    const kondisi = featuredBook?.kondisi || 'Baik';
    const isDamaged = kondisi.startsWith('Rusak');

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = isDamaged ? '#1F1B16' : '#17231F';
    ctx.fillRect(0, 0, 512, 720);

    // Weathering scratches for damaged books
    if (isDamaged) {
      ctx.strokeStyle = '#0F0D0A';
      ctx.lineWidth = 2;
      for (let k = 0; k < 12; k++) {
        const sx = 50 + Math.random() * 410;
        const sy = 70 + Math.random() * 580;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.5) * 40, sy + (Math.random() - 0.5) * 40);
        ctx.stroke();
      }
    }

    // Gilded Frame Borders
    ctx.strokeStyle = isDamaged ? '#8E7856' : '#D4A373';
    ctx.lineWidth = 8;
    ctx.strokeRect(28, 28, 456, 664);
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 432, 640);

    // Gilded Emblem in Center
    ctx.fillStyle = isDamaged ? '#8E7856' : '#D4A373';
    ctx.beginPath();
    ctx.arc(256, 190, 36, 0, Math.PI * 2);
    ctx.stroke();

    // Book Title
    ctx.fillStyle = isDamaged ? '#B89B6C' : '#E9C46A';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    const words = bookTitle.split(' ');
    if (words.length > 2) {
      ctx.fillText(words.slice(0, 2).join(' '), 256, 360);
      ctx.fillText(words.slice(2).join(' '), 256, 406);
    } else {
      ctx.fillText(bookTitle, 256, 380);
    }

    // Author
    ctx.fillStyle = isDamaged ? '#75887B' : '#8FA294';
    ctx.font = '20px sans-serif';
    ctx.fillText(bookAuthor, 256, 460);

    const bookTexture = new THREE.CanvasTexture(canvas);

    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 0.12, 0);
    bookGroup.rotation.set(-Math.PI * 0.47, 0, 0.32);
    pedestalGroup.add(bookGroup);

    // Front Cover with Texture
    const coverGeo = new THREE.BoxGeometry(1.4, 1.95, 0.05);
    const texturedCoverMat = new THREE.MeshStandardMaterial({
      map: bookTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const frontCover = new THREE.Mesh(coverGeo, texturedCoverMat);
    frontCover.position.z = 0.13;
    frontCover.castShadow = true;
    bookGroup.add(frontCover);

    const plainCoverMat = new THREE.MeshStandardMaterial({
      color: 0x17231f,
      roughness: 0.7,
    });
    const backCover = new THREE.Mesh(coverGeo, plainCoverMat);
    backCover.position.z = -0.13;
    backCover.castShadow = true;
    bookGroup.add(backCover);

    // Pages Block
    const pagesGeo = new THREE.BoxGeometry(1.32, 1.88, 0.22);
    const pagesMat = new THREE.MeshStandardMaterial({
      color: isDamaged ? 0xcbb48e : 0xe8e0cf,
      roughness: isDamaged ? 0.98 : 0.88,
    });
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
    pagesMesh.position.set(0.02, 0, 0);
    pagesMesh.castShadow = true;
    pagesMesh.receiveShadow = true;
    bookGroup.add(pagesMesh);

    // 5. Bioluminescent Floating Spores
    const sporeCount = 50;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePos = new Float32Array(sporeCount * 3);
    const sporeVel = [];

    for (let i = 0; i < sporeCount; i++) {
      sporePos[i * 3] = (Math.random() - 0.5) * 5.5;
      sporePos[i * 3 + 1] = Math.random() * 3.8;
      sporePos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      sporeVel.push({
        y: 0.003 + Math.random() * 0.007,
        freq: Math.random() * 4,
      });
    }

    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
    const sporeMat = new THREE.PointsMaterial({
      color: 0xd4a373,
      size: 0.065,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sporePoints = new THREE.Points(sporeGeo, sporeMat);
    scene.add(sporePoints);

    // 6. Interactive Parallax & Hover Physics
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.9;
      targetY = y * 0.5;
    }

    container.addEventListener('mousemove', onMouseMove);

    // 7. Animation Loop
    let animId;
    let clock = new THREE.Clock();
    let isPaused = document.body.classList.contains('modal-3d-open');

    function onModalToggle(e) {
      isPaused = Boolean(e.detail?.open);
    }
    window.addEventListener('modal-3d-toggle', onModalToggle);

    function animate() {
      animId = requestAnimationFrame(animate);

      if (isPaused) return;

      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      camera.position.x = currentX * 2.6;
      camera.position.y = 3.1 - currentY * 1.6;
      camera.lookAt(0, 0.35, 0);

      // Book natural breathing float
      bookGroup.position.y = 0.12 + Math.sin(elapsed * 1.3) * 0.025;
      bookGroup.rotation.z = 0.32 + Math.sin(elapsed * 0.9) * 0.02;

      // God-ray pulse
      ray1.material.opacity = 0.06 + Math.sin(elapsed * 0.8) * 0.02;
      ray2.material.opacity = 0.05 + Math.cos(elapsed * 1.1) * 0.02;

      // Spores floating upwards
      const positions = sporeGeo.attributes.position.array;
      for (let i = 0; i < sporeCount; i++) {
        positions[i * 3 + 1] += sporeVel[i].y;
        positions[i * 3] += Math.sin(elapsed + sporeVel[i].freq) * 0.002;
        if (positions[i * 3 + 1] > 4.2) {
          positions[i * 3 + 1] = 0;
        }
      }
      sporeGeo.attributes.position.needsUpdate = true;

      // Bioluminescent filament flicker
      bioLight.intensity = 2.1 + Math.sin(elapsed * 2.3) * 0.3;

      renderer.render(scene, camera);
    }

    animate();

    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('modal-3d-toggle', onModalToggle);
      renderer.dispose();
      bookTexture.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [featuredBook]);

  return (
    <div data-testid="pedestal-3d-hero" className="relative w-full h-[290px] sm:h-[340px] rounded-2xl overflow-hidden sanctuary-card border border-forest-sage/20 bg-gradient-to-b from-[#1C2826]/70 via-[#161B18]/90 to-[#101513]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Volumetric God-ray ambient graphic overlay */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-35"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 75% 15%, rgba(212, 163, 115, 0.45), transparent 70%), linear-gradient(135deg, rgba(143, 162, 148, 0.15) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      {/* Floating Editorial Sanctuary Badge & Featured Title */}
      <div className="absolute top-4 left-5 right-5 flex items-start justify-between pointer-events-none">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#101513]/85 border border-forest-sage/25 text-[10px] font-mono text-forest-amber tracking-wider backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-amber animate-bio-pulse" />
            <span>KARYA PILIHAN SANCTUARY</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-forest-mist drop-shadow-md">
            {featuredBook?.judul || 'Filosofi Teras'}
          </h2>
          <p className="text-xs text-forest-sage font-medium">
            {featuredBook?.penulis || 'Henry Manampiring'} • <span className="font-mono text-forest-amber/90">{featuredBook?.lokasiRak || 'RAK-FILSAFAT'}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="hidden sm:block text-right font-mono text-[11px] text-forest-sage/80 bg-[#101513]/80 px-3 py-1.5 rounded-lg border border-forest-sage/15 backdrop-blur-sm">
            <div>Volumetric Canopy God-Rays</div>
            <div className="text-[10px] text-forest-amber">WebGL 3D Pedestal • 60 FPS</div>
          </div>
          {onInspect && featuredBook && (
            <button
              onClick={() => onInspect(featuredBook)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-forest-amber/25 to-forest-amber/15 hover:from-forest-amber/40 hover:to-forest-amber/25 border border-forest-amber/50 text-forest-amber font-serif text-xs font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-bioglow"
              title="Inspeksi Kitab dalam 3D Interaktif"
            >
              <Rotate3D size={15} className="animate-spin-slow" />
              <span>Inspeksi 3D (360°)</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between pointer-events-none text-[11px] font-mono text-forest-sage/70">
        <span className="truncate pr-2">Tunggul Kayu Purba Berlumut • Geser kursor untuk paralaks 3D</span>
        <span className="text-forest-amber/90 shrink-0">{featuredBook?.jumlahEksemplar || 4} Eksemplar Fisik</span>
      </div>
    </div>
  );
}
