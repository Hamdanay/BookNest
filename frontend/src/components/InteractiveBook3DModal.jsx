import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X,
  BookOpen,
  Rotate3D,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Sparkles,
  Info,
} from 'lucide-react';
import { KondisiBadge, StatusBadge } from './Badges';

const KONDISI_LIST = ['Baik', 'Cukup Baik', 'Rusak Ringan', 'Rusak Berat'];

const KONDISI_DETAILS = {
  Baik: {
    label: 'Kondisi Prima / Kolektor',
    badgeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    description: 'Sampul kulit utuh tanpa goresan, foil emas berkilau penuh, dan lembaran kertas gading bersih bebas asam.',
    integrity: 'Integritas Fisik: 98%',
    icon: Sparkles,
  },
  'Cukup Baik': {
    label: 'Kondisi Wajar / Patina Waktu',
    badgeClass: 'text-forest-amber border-forest-amber/30 bg-forest-amber/10',
    description: 'Sedikit guratan penuaan wajar pada sudut kulit, kilau emas sedikit pudar, dan kertas bernuansa vanila tua.',
    integrity: 'Integritas Fisik: 85%',
    icon: ShieldCheck,
  },
  'Rusak Ringan': {
    label: 'Perlu Konservasi / Rapuh',
    badgeClass: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    description: 'Sudut kulit terkelupas menampakkan serat karton, noda air lembab (foxing), dan tepi kertas mulai bergelombang.',
    integrity: 'Integritas Fisik: 62%',
    icon: AlertTriangle,
  },
  'Rusak Berat': {
    label: 'Kerusakan Parah / Kritis',
    badgeClass: 'text-rose-400 border-rose-500/30 bg-rose-950/25',
    description: 'Sudut sampul sobek rombeng, retakan menganga pada jilid, noda jamur gelap, dan kertas lapuk kecokelatan.',
    integrity: 'Integritas Fisik: 28% (Prioritas Kurator)',
    icon: Flame,
  },
};

// 1. Procedural Front Cover Texture based on Condition
function createCoverCanvas(book, kondisi) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  const isBaik = kondisi === 'Baik';
  const isCukup = kondisi === 'Cukup Baik';
  const isRusakRingan = kondisi === 'Rusak Ringan';
  const isRusakBerat = kondisi === 'Rusak Berat';

  // Base Leather Color
  let baseColor = '#182923';
  if (isCukup) baseColor = '#1F2922';
  if (isRusakRingan) baseColor = '#24231B';
  if (isRusakBerat) baseColor = '#1A1613';

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 720);

  // Surface Noise / Patina
  const speckCount = isRusakBerat ? 120 : isRusakRingan ? 70 : 25;
  for (let i = 0; i < speckCount; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 720;
    const r = 8 + Math.random() * (isRusakBerat ? 45 : 20);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, isRusakBerat ? 'rgba(8, 6, 4, 0.5)' : 'rgba(28, 22, 16, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Water Stains / Foxing Spots (for damaged books)
  if (isRusakRingan || isRusakBerat) {
    const stainCount = isRusakBerat ? 6 : 2;
    for (let s = 0; s < stainCount; s++) {
      const cx = 90 + Math.random() * 330;
      const cy = 110 + Math.random() * 500;
      const rad = 25 + Math.random() * 40;

      ctx.strokeStyle = isRusakBerat ? 'rgba(50, 40, 28, 0.7)' : 'rgba(110, 90, 60, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = isRusakBerat ? 'rgba(30, 24, 18, 0.35)' : 'rgba(70, 56, 38, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Antique Gilded Borders & Ornaments
  let foilColor = '#E9C46A';
  let foilAlpha = 1.0;
  if (isCukup) {
    foilColor = '#C8A878';
    foilAlpha = 0.85;
  } else if (isRusakRingan) {
    foilColor = '#8E7856';
    foilAlpha = 0.5;
  } else if (isRusakBerat) {
    foilColor = '#5A4D38';
    foilAlpha = 0.22;
  }

  ctx.save();
  ctx.globalAlpha = foilAlpha;
  ctx.strokeStyle = foilColor;
  ctx.lineWidth = 7;
  ctx.strokeRect(30, 30, 452, 660);
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, 428, 636);

  if (!isRusakBerat) {
    ctx.fillStyle = foilColor;
    ctx.fillRect(30, 30, 20, 20);
    ctx.fillRect(462, 30, 20, 20);
    ctx.fillRect(30, 670, 20, 20);
    ctx.fillRect(462, 670, 20, 20);
  }
  ctx.restore();

  // Scratches, Fissures & Torn Corners
  if (isRusakRingan || isRusakBerat) {
    ctx.save();
    ctx.strokeStyle = isRusakBerat ? '#0B0907' : '#33291F';
    ctx.lineWidth = isRusakBerat ? 3 : 1.5;
    const scratchCount = isRusakBerat ? 16 : 7;
    for (let k = 0; k < scratchCount; k++) {
      const sx = 50 + Math.random() * 410;
      const sy = 70 + Math.random() * 580;
      const len = 20 + Math.random() * 45;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * len, sy + (Math.random() - 0.5) * len);
      ctx.stroke();
    }
    ctx.restore();

    // Bottom right corner torn away, exposing raw pulpy board
    ctx.fillStyle = isRusakBerat ? '#4A3B2C' : '#685440';
    ctx.beginPath();
    ctx.moveTo(512, 590);
    ctx.lineTo(430, 720);
    ctx.lineTo(512, 720);
    ctx.closePath();
    ctx.fill();

    // Ripped jagged boundary
    ctx.strokeStyle = '#22180E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(512, 590);
    ctx.lineTo(465, 640);
    ctx.lineTo(480, 675);
    ctx.lineTo(430, 720);
    ctx.stroke();

    if (isRusakBerat) {
      // Top left corner torn off
      ctx.fillStyle = '#382B1F';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(95, 0);
      ctx.lineTo(0, 95);
      ctx.closePath();
      ctx.fill();

      // Long structural crack across cover
      ctx.strokeStyle = '#0B0806';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(110, 180);
      ctx.lineTo(180, 300);
      ctx.lineTo(150, 410);
      ctx.lineTo(230, 530);
      ctx.stroke();
    }
  }

  // Book Title & Typography
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = isRusakBerat ? '#7A6B52' : isRusakRingan ? '#B89B6C' : '#F3D27E';
  ctx.font = 'bold 34px Georgia, serif';

  const words = (book.judul || '').split(' ');
  const titleY = 320;
  if (words.length > 2) {
    ctx.fillText(words.slice(0, 2).join(' '), 256, titleY);
    ctx.fillText(words.slice(2).join(' '), 256, titleY + 44);
  } else {
    ctx.fillText(book.judul || '', 256, titleY);
  }

  // Author
  ctx.fillStyle = isRusakBerat ? '#564C3E' : isRusakRingan ? '#75887B' : '#A2B4A7';
  ctx.font = '20px sans-serif';
  ctx.fillText(book.penulis || '', 256, titleY + 100);

  // Status Badge / Ribbon on Cover
  if (isRusakBerat) {
    ctx.save();
    ctx.translate(256, 560);
    ctx.rotate(-0.06);
    ctx.strokeStyle = '#8B2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(-160, -20, 320, 40);
    ctx.fillStyle = '#C24B4B';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('KERUSAKAN BERAT • RESTORASI SEGERA', 0, 6);
    ctx.restore();
  } else if (isRusakRingan) {
    ctx.save();
    ctx.translate(256, 560);
    ctx.strokeStyle = '#A3753B';
    ctx.lineWidth = 2;
    ctx.strokeRect(-145, -18, 290, 36);
    ctx.fillStyle = '#D4A373';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('RUSAK RINGAN • KONSERVASI', 0, 5);
    ctx.restore();
  } else if (isBaik) {
    ctx.save();
    ctx.translate(256, 560);
    ctx.strokeStyle = '#3D5C54';
    ctx.lineWidth = 2;
    ctx.strokeRect(-125, -18, 250, 36);
    ctx.fillStyle = '#52B788';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('KONDISI PRIMA • TERAWAT', 0, 5);
    ctx.restore();
  }

  ctx.restore();
  return canvas;
}

// 2. Procedural Inner First Page Texture (Visible when cover opens)
function createPageCanvas(book, kondisi) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  const isBaik = kondisi === 'Baik';
  const isCukup = kondisi === 'Cukup Baik';
  const isRusakRingan = kondisi === 'Rusak Ringan';
  const isRusakBerat = kondisi === 'Rusak Berat';

  // Base Paper Tone
  let paperTone = '#F7F3EB'; // Clean ivory
  if (isCukup) paperTone = '#EFE6D6'; // Aged parchment
  if (isRusakRingan) paperTone = '#DECDB1'; // Foxed paper
  if (isRusakBerat) paperTone = '#B8A484'; // Severely darkened / mildew paper

  ctx.fillStyle = paperTone;
  ctx.fillRect(0, 0, 512, 720);

  // Outer paper aging vignette
  const vignette = ctx.createRadialGradient(256, 360, 160, 256, 360, 380);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(
    1,
    isRusakBerat ? 'rgba(70, 50, 30, 0.45)' : isRusakRingan ? 'rgba(110, 85, 55, 0.25)' : 'rgba(160, 140, 110, 0.1)'
  );
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 512, 720);

  // Foxing spots on damaged paper
  if (isRusakRingan || isRusakBerat) {
    const spotCount = isRusakBerat ? 50 : 20;
    for (let p = 0; p < spotCount; p++) {
      const px = Math.random() * 512;
      const py = Math.random() * 720;
      const pr = 3 + Math.random() * (isRusakBerat ? 14 : 7);
      ctx.fillStyle = isRusakBerat ? 'rgba(60, 42, 25, 0.4)' : 'rgba(120, 95, 60, 0.25)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Torn Page Corner in Rusak Berat
  if (isRusakBerat) {
    ctx.fillStyle = '#2B231A'; // void / backing shadow
    ctx.beginPath();
    ctx.moveTo(430, 0);
    ctx.lineTo(512, 0);
    ctx.lineTo(512, 110);
    ctx.closePath();
    ctx.fill();
  }

  // Inner Title & Curator Archival Markings
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = isRusakBerat ? '#42382D' : '#2A3B34';
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText('Manuskrip Koleksi BookNest Ancient Sanctuary', 256, 120);

  ctx.strokeStyle = isRusakBerat ? '#72614E' : '#B89B6C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 135);
  ctx.lineTo(412, 135);
  ctx.stroke();

  // Book Title inside
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillStyle = isRusakBerat ? '#3D3328' : '#182420';
  ctx.fillText(book.judul || '', 256, 220);

  ctx.font = '16px sans-serif';
  ctx.fillStyle = isRusakBerat ? '#635545' : '#5C7065';
  ctx.fillText(`Karya: ${book.penulis || '-'}`, 256, 260);
  ctx.fillText(`Tahun: ${book.tahunTerbit || '-'} • Rak: ${book.lokasiRak || '-'}`, 256, 290);

  // Curator Stamp
  ctx.save();
  ctx.translate(256, 440);
  if (isRusakBerat) {
    ctx.rotate(-0.09);
    ctx.strokeStyle = '#A32929';
    ctx.lineWidth = 3;
    ctx.strokeRect(-150, -30, 300, 60);
    ctx.fillStyle = '#A32929';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('STATUS: PERLU RESTORASI TOTAL', 0, -4);
    ctx.font = '11px monospace';
    ctx.fillText('Dilarang dipinjam keluar kanopi', 0, 16);
  } else if (isRusakRingan) {
    ctx.rotate(0.04);
    ctx.strokeStyle = '#B38136';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-140, -28, 280, 56);
    ctx.fillStyle = '#B38136';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('STATUS: KONSERVASI KURATOR', 0, -3);
    ctx.font = '11px monospace';
    ctx.fillText('Penanganan hati-hati di ruang baca', 0, 15);
  } else {
    ctx.strokeStyle = '#2D6A4F';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-135, -28, 270, 56);
    ctx.fillStyle = '#2D6A4F';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('STATUS: TERVERIFIKASI UTUH', 0, -3);
    ctx.font = '11px monospace';
    ctx.fillText('Arsip Kanopi Siap Akses', 0, 15);
  }
  ctx.restore();

  ctx.restore();
  return canvas;
}

export default function InteractiveBook3DModal({ book, onClose }) {
  const mountRef = useRef(null);
  const [isOpenBook, setIsOpenBook] = useState(false);
  const [simulatedKondisi, setSimulatedKondisi] = useState(book?.kondisi || 'Baik');
  const openRef = useRef(false);

  // Pause background canvas rendering to conserve GPU/CPU cycles
  useEffect(() => {
    document.body.classList.add('modal-3d-open');
    window.dispatchEvent(new CustomEvent('modal-3d-toggle', { detail: { open: true } }));
    return () => {
      document.body.classList.remove('modal-3d-open');
      window.dispatchEvent(new CustomEvent('modal-3d-toggle', { detail: { open: false } }));
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    openRef.current = isOpenBook;
  }, [isOpenBook]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !book) return;

    // Clean previous children if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x101513, 0.05);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 4.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambient = new THREE.AmbientLight(0x2d443e, 1.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffecd1, 3.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const amberRim = new THREE.PointLight(0xd4a373, 2.8, 8);
    amberRim.position.set(-2.5, -0.5, 2);
    scene.add(amberRim);

    // 3. Dynamic Textures
    const coverCanvas = createCoverCanvas(book, simulatedKondisi);
    const coverTex = new THREE.CanvasTexture(coverCanvas);

    const pageCanvas = createPageCanvas(book, simulatedKondisi);
    const pageTex = new THREE.CanvasTexture(pageCanvas);

    // 4. Book Mesh Hierarchy
    const bookRoot = new THREE.Group();
    scene.add(bookRoot);

    const isRusakBerat = simulatedKondisi === 'Rusak Berat';
    const isRusakRingan = simulatedKondisi === 'Rusak Ringan';
    const isCukup = simulatedKondisi === 'Cukup Baik';

    // Proportional physical page block thickness based on volume copies / content
    const pageThickness = Math.min(0.34, Math.max(0.18, 0.18 + ((book.jumlahEksemplar || 1) % 6) * 0.024));
    const halfThick = pageThickness / 2;

    // Back Cover
    const backCoverGeo = new THREE.BoxGeometry(1.4, 1.95, 0.05);
    const coverLeatherColor = isRusakBerat ? 0x191714 : isRusakRingan ? 0x22211b : 0x182420;
    const coverLeatherMat = new THREE.MeshStandardMaterial({
      color: coverLeatherColor,
      roughness: isRusakBerat ? 0.95 : isRusakRingan ? 0.82 : 0.65,
      metalness: 0.1,
    });
    const backCover = new THREE.Mesh(backCoverGeo, coverLeatherMat);
    backCover.position.set(0, 0, -(halfThick + 0.025));
    bookRoot.add(backCover);

    // Pages Block (Color shifts with condition)
    let pageEdgeColor = 0xf5efe6;
    if (isCukup) pageEdgeColor = 0xe8ddcb;
    if (isRusakRingan) pageEdgeColor = 0xcbb48e;
    if (isRusakBerat) pageEdgeColor = 0x948268;

    const pagesGeo = new THREE.BoxGeometry(1.32, 1.88, pageThickness);
    const pagesMat = new THREE.MeshStandardMaterial({
      color: pageEdgeColor,
      roughness: isRusakBerat ? 0.98 : 0.9,
    });
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
    pagesMesh.position.set(0.02, 0, 0);
    bookRoot.add(pagesMesh);

    // First Inner Page (Revealed when front cover opens)
    const innerPageGeo = new THREE.PlaneGeometry(1.3, 1.86);
    const innerPageMat = new THREE.MeshStandardMaterial({
      map: pageTex,
      roughness: 0.85,
    });
    const innerPageMesh = new THREE.Mesh(innerPageGeo, innerPageMat);
    innerPageMesh.position.set(0.02, 0, halfThick + 0.002);
    bookRoot.add(innerPageMesh);

    // Front Cover with Hinge on the left (-0.7 x)
    const hingeGroup = new THREE.Group();
    hingeGroup.position.set(-0.7, 0, halfThick + 0.025);
    bookRoot.add(hingeGroup);

    const frontCoverGeo = new THREE.BoxGeometry(1.4, 1.95, 0.05);
    const frontMat = new THREE.MeshStandardMaterial({
      map: coverTex,
      roughness: isRusakBerat ? 0.95 : isRusakRingan ? 0.82 : 0.6,
      metalness: 0.1,
    });
    const insideEndpaperMat = new THREE.MeshStandardMaterial({
      color: isRusakBerat ? 0x8a775e : isRusakRingan ? 0xc4b293 : 0xede4d6,
      roughness: 0.9,
    });
    const edgeLeatherMat = new THREE.MeshStandardMaterial({
      color: coverLeatherColor,
      roughness: 0.75,
    });

    // BoxGeometry material array: [+X, -X, +Y, -Y, +Z (Outside cover), -Z (Inside endpaper)]
    const frontCoverMaterials = [
      edgeLeatherMat,
      edgeLeatherMat,
      edgeLeatherMat,
      edgeLeatherMat,
      frontMat,
      insideEndpaperMat,
    ];
    const frontCoverMesh = new THREE.Mesh(frontCoverGeo, frontCoverMaterials);
    frontCoverMesh.position.set(0.7, 0, 0);
    frontCoverMesh.castShadow = true;
    hingeGroup.add(frontCoverMesh);

    // 5. Interactive Mouse Drag Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = -0.4;
    let rotX = 0.2;

    function onPointerDown(e) {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rotY += deltaX * 0.012;
      rotX += deltaY * 0.012;
      rotX = Math.max(-0.6, Math.min(0.8, rotX));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }

    function onPointerUp() {
      isDragging = false;
    }

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 6. Animation Loop
    let animId;
    let targetHingeRot = 0;

    function animate() {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        rotY += 0.003;
      }
      bookRoot.rotation.y = rotY;
      bookRoot.rotation.x = rotX;

      // Cover opening / closing animation
      targetHingeRot = openRef.current ? -Math.PI * 0.75 : 0;
      hingeGroup.rotation.y += (targetHingeRot - hingeGroup.rotation.y) * 0.08;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      coverTex.dispose();
      pageTex.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [book, simulatedKondisi]);

  if (!book) return null;

  const activeDetail = KONDISI_DETAILS[simulatedKondisi] || KONDISI_DETAILS.Baik;
  const ActiveIcon = activeDetail.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#0C120F]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="sanctuary-card brass-corner max-w-2xl w-full p-5 sm:p-6 space-y-4 border-forest-amber/40 shadow-2xl relative overflow-hidden bg-[#121915]/95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-forest-sage hover:text-forest-mist hover:bg-forest-moss/40 transition-colors z-20"
          aria-label="Tutup Inspeksi 3D"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-forest-sage/15 pr-10">
          <div className="flex items-center gap-2">
            <Rotate3D size={17} className="text-forest-amber animate-spin-slow" />
            <span className="text-[11px] font-ancient tracking-widest text-forest-amber uppercase">
              3D Physical Inspection Sanctuary
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-forest-sage/20 text-forest-sage">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-amber animate-bio-pulse" />
            <span>WebGL Realtime Simulation</span>
          </div>
        </div>

        {/* Interactive 3D Canvas Area */}
        <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden bg-gradient-to-b from-[#141C18] to-[#0E1411] border border-forest-sage/25 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing">
          <div ref={mountRef} className="w-full h-full" />

          {/* Hint Overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-forest-sage/80 pointer-events-none">
            <span>Tarik kursor untuk memutar 360°</span>
            <span className="text-forest-amber">{activeDetail.integrity}</span>
          </div>
        </div>

        {/* Condition Interactive Simulator Tabs */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-forest-sage">
            <span className="flex items-center gap-1">
              <Info size={12} className="text-forest-amber" />
              <span>Simulasi Fisik Menurut Kondisi Koleksi:</span>
            </span>
            <span className="text-forest-mist font-semibold">
              Kondisi Tercatat: <strong className="text-forest-amber">{book.kondisi}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {KONDISI_LIST.map((k) => {
              const isActive = simulatedKondisi === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSimulatedKondisi(k)}
                  className={`px-3 py-2 rounded-xl text-xs font-serif transition-all duration-200 border text-center ${
                    isActive
                      ? 'bg-forest-moss border-forest-amber text-forest-amber shadow-bioglow font-bold scale-[1.02]'
                      : 'bg-[#101513] border-forest-sage/20 text-forest-sage hover:text-forest-mist hover:border-forest-amber/30'
                  }`}
                >
                  <div className="truncate">{k}</div>
                  <div className="text-[9px] font-mono text-forest-sage/70">
                    {k === 'Baik'
                      ? 'Sampul Mulus'
                      : k === 'Cukup Baik'
                      ? 'Patina Wajar'
                      : k === 'Rusak Ringan'
                      ? 'Terkelupas'
                      : 'Lapuk & Sobek'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Condition Curatorial Note Box */}
        <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${activeDetail.badgeClass}`}>
          <ActiveIcon size={18} className="shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5 min-w-0">
            <div className="font-serif font-bold text-sm text-forest-mist">
              {activeDetail.label} • {activeDetail.integrity}
            </div>
            <p className="text-forest-dew/90 text-[11px] leading-relaxed">
              {activeDetail.description}
            </p>
          </div>
        </div>

        {/* Footer Actions & Book Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-forest-sage/15">
          <div className="space-y-0.5 min-w-0">
            <h3 className="font-serif font-bold text-base text-forest-mist truncate">{book.judul}</h3>
            <p className="text-xs text-forest-sage truncate">
              {book.penulis} • {book.lokasiRak} ({book.jumlahEksemplar} eks.)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpenBook(!isOpenBook)}
            className="sanctuary-btn-amber shrink-0 flex items-center gap-2 py-2 px-4 text-xs"
          >
            <BookOpen size={15} />
            <span>{isOpenBook ? 'Tutup Lembaran' : 'Buka Lembaran 3D'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
