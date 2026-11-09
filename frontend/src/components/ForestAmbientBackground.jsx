import { useEffect, useRef } from 'react';

export default function ForestAmbientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for gentle particle attraction/swirl
    let mouse = { x: width / 2, y: height / 2, active: false };
    let isPaused = document.body.classList.contains('modal-3d-open');

    function onMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }

    function onResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function onModalToggle(e) {
      isPaused = Boolean(e.detail?.open);
    }

    function onVisibilityChange() {
      if (document.hidden) isPaused = true;
      else isPaused = document.body.classList.contains('modal-3d-open');
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);
    window.addEventListener('modal-3d-toggle', onModalToggle);
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 1. Spores & Fireflies (Bioluminescent amber & sage particles)
    const sporeCount = 42;
    const spores = Array.from({ length: sporeCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.5,
      radius: 1.2 + Math.random() * 2.2,
      baseAlpha: 0.2 + Math.random() * 0.5,
      alpha: 0.5,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.3 ? '#D4A373' : '#8FA294',
    }));

    // 2. Drifting Organic Falling Leaves
    const leafCount = 14;
    const leaves = Array.from({ length: leafCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 10 + Math.random() * 14,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      vx: 0.2 + Math.random() * 0.6,
      vy: 0.4 + Math.random() * 0.8,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobblePhase: Math.random() * Math.PI,
      color: Math.random() > 0.5 ? 'rgba(82, 121, 111, 0.28)' : 'rgba(212, 163, 115, 0.2)',
    }));

    // 3. Drifting Mist Patches
    const mistPatches = [
      { x: 0, y: height * 0.2, r: width * 0.4, vx: 0.15, alpha: 0.045 },
      { x: width * 0.5, y: height * 0.6, r: width * 0.5, vx: -0.12, alpha: 0.05 },
      { x: width * 0.8, y: height * 0.8, r: width * 0.45, vx: 0.1, alpha: 0.04 },
    ];

    let frame = 0;

    function render() {
      if (isPaused) {
        animId = requestAnimationFrame(render);
        return;
      }

      frame++;
      ctx.clearRect(0, 0, width, height);

      // Render Drifting Canopy Mist
      mistPatches.forEach((m) => {
        m.x += m.vx;
        if (m.x > width + m.r) m.x = -m.r;
        if (m.x < -m.r) m.x = width + m.r;

        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        grad.addColorStop(0, `rgba(45, 68, 62, ${m.alpha})`);
        grad.addColorStop(1, 'rgba(16, 21, 19, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render & Update Leaves
      leaves.forEach((l) => {
        l.y += l.vy;
        l.x += l.vx + Math.sin(frame * l.wobbleSpeed + l.wobblePhase) * 0.7;
        l.angle += l.rotationSpeed;

        if (l.y > height + 20) {
          l.y = -20;
          l.x = Math.random() * width;
        }
        if (l.x > width + 20) l.x = -20;

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        ctx.fillStyle = l.color;
        ctx.beginPath();
        // Leaf shape
        ctx.moveTo(0, -l.size);
        ctx.quadraticCurveTo(l.size * 0.6, -l.size * 0.3, l.size * 0.2, l.size);
        ctx.quadraticCurveTo(-l.size * 0.6, l.size * 0.3, 0, -l.size);
        ctx.fill();
        ctx.restore();
      });

      // Render & Update Bioluminescent Spores
      spores.forEach((s) => {
        // Natural upward float
        s.y += s.vy;
        s.x += s.vx + Math.sin(frame * 0.02 + s.pulsePhase) * 0.3;

        // Gentle reaction to cursor proximity
        if (mouse.active) {
          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const angle = Math.atan2(dy, dx);
            s.x -= Math.cos(angle) * 0.8;
            s.y -= Math.sin(angle) * 0.8;
          }
        }

        if (s.y < -10) {
          s.y = height + 10;
          s.x = Math.random() * width;
        }

        // Bioluminescent flicker
        const currentAlpha = s.baseAlpha + Math.sin(frame * s.pulseSpeed + s.pulsePhase) * 0.25;
        const radius = s.radius * (1 + Math.sin(frame * s.pulseSpeed) * 0.15);

        // Core glow
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = s.color;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('modal-3d-toggle', onModalToggle);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-85"
      aria-hidden="true"
    />
  );
}
