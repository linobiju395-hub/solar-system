import React, { useRef, useEffect } from 'react';

interface OrbitingBody {
  name: string;
  type: 'star' | 'planet' | 'spacecraft';
  color: string;
  radius: number;
  semiMajorAU: number; // In astronomical visual units
  semiMinorAU: number;
  tiltDeg: number; // Orbital plane inclination
  orbitalPeriodDays: number;
  initialAngle: number;
  imageUrl?: string;
}

// Map each planet to authentic NASA photographic asset
const PLANET_IMAGE_MAP: Record<string, string> = {
  SUN: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FGSFC_20171208_Archive_e001435%2FGSFC_20171208_Archive_e001435~thumb.jpg',
  MERCURY: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA15190%2FPIA15190~thumb.jpg',
  VENUS: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA00104%2FPIA00104~thumb.jpg',
  EARTH: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2Fas17-148-22727%2Fas17-148-22727~thumb.jpg',
  MOON: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2Fas11-44-6667%2Fas11-44-6667~thumb.jpg',
  MARS: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA04304%2FPIA04304~thumb.jpg',
  JUPITER: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA22949%2FPIA22949~thumb.jpg',
  SATURN: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA01482%2FPIA01482~thumb.jpg',
  URANUS: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA01360%2FPIA01360~thumb.jpg',
  NEPTUNE: '/api/space/image?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA01492%2FPIA01492~thumb.jpg'
};

// 3D Orbital Elements (Semi-major a, semi-minor b, inclination tiltDeg, authentic sidereal period)
const BODIES: OrbitingBody[] = [
  { name: 'SUN', type: 'star', color: '#fef3c7', radius: 10, semiMajorAU: 0, semiMinorAU: 0, tiltDeg: 0, orbitalPeriodDays: 1, initialAngle: 0, imageUrl: PLANET_IMAGE_MAP.SUN },
  { name: 'MERCURY', type: 'planet', color: '#cbd5e1', radius: 3.5, semiMajorAU: 105, semiMinorAU: 102, tiltDeg: 7.0, orbitalPeriodDays: 87.97, initialAngle: 1.8, imageUrl: PLANET_IMAGE_MAP.MERCURY },
  { name: 'VENUS', type: 'planet', color: '#fde68a', radius: 5.5, semiMajorAU: 170, semiMinorAU: 169, tiltDeg: 3.4, orbitalPeriodDays: 224.7, initialAngle: 0.9, imageUrl: PLANET_IMAGE_MAP.VENUS },
  { name: 'EARTH', type: 'planet', color: '#38bdf8', radius: 6, semiMajorAU: 240, semiMinorAU: 238, tiltDeg: 0.0, orbitalPeriodDays: 365.25, initialAngle: 3.4, imageUrl: PLANET_IMAGE_MAP.EARTH },
  { name: 'MARS', type: 'planet', color: '#fb923c', radius: 4.5, semiMajorAU: 320, semiMinorAU: 315, tiltDeg: 1.85, orbitalPeriodDays: 686.98, initialAngle: 5.2, imageUrl: PLANET_IMAGE_MAP.MARS },
  { name: 'JUPITER', type: 'planet', color: '#e2e8f0', radius: 8.5, semiMajorAU: 450, semiMinorAU: 446, tiltDeg: 1.3, orbitalPeriodDays: 4332.59, initialAngle: 2.1, imageUrl: PLANET_IMAGE_MAP.JUPITER },
  { name: 'SATURN', type: 'planet', color: '#fef08a', radius: 7.5, semiMajorAU: 580, semiMinorAU: 574, tiltDeg: 2.5, orbitalPeriodDays: 10759.22, initialAngle: 4.5, imageUrl: PLANET_IMAGE_MAP.SATURN },
  { name: 'URANUS', type: 'planet', color: '#a5f3fc', radius: 6, semiMajorAU: 700, semiMinorAU: 695, tiltDeg: 0.77, orbitalPeriodDays: 30685.4, initialAngle: 1.2, imageUrl: PLANET_IMAGE_MAP.URANUS },
  { name: 'NEPTUNE', type: 'planet', color: '#60a5fa', radius: 6, semiMajorAU: 820, semiMinorAU: 818, tiltDeg: 1.77, orbitalPeriodDays: 60189.0, initialAngle: 4.0, imageUrl: PLANET_IMAGE_MAP.NEPTUNE },
  // Interplanetary craft
  { name: 'Parker Solar Probe', type: 'spacecraft', color: '#94a3b8', radius: 3, semiMajorAU: 90, semiMinorAU: 55, tiltDeg: 3.4, orbitalPeriodDays: 88.0, initialAngle: 0.4 },
  { name: 'OSIRIS-APEX', type: 'spacecraft', color: '#94a3b8', radius: 3, semiMajorAU: 190, semiMinorAU: 175, tiltDeg: 6.0, orbitalPeriodDays: 290.0, initialAngle: 4.1 },
  { name: 'Psyche', type: 'spacecraft', color: '#94a3b8', radius: 3, semiMajorAU: 280, semiMinorAU: 260, tiltDeg: 3.1, orbitalPeriodDays: 1200.0, initialAngle: 1.5 },
  { name: 'STEREO Ahead', type: 'spacecraft', color: '#94a3b8', radius: 3, semiMajorAU: 250, semiMinorAU: 248, tiltDeg: 0.1, orbitalPeriodDays: 347.0, initialAngle: 5.8 },
  { name: 'Europa Clipper', type: 'spacecraft', color: '#94a3b8', radius: 3, semiMajorAU: 380, semiMinorAU: 350, tiltDeg: 2.2, orbitalPeriodDays: 1800.0, initialAngle: 3.1 },
  { name: 'Voyager 1', type: 'spacecraft', color: '#94a3b8', radius: 3, semiMajorAU: 910, semiMinorAU: 820, tiltDeg: 35.0, orbitalPeriodDays: 99999.0, initialAngle: 0.8 }
];

interface Props {
  selectedBody: string;
  onSelectBody: (name: string) => void;
  speedMultiplier: number;
  zoomScale: number;
}

export function EyesSolarCanvas({ selectedBody, onSelectBody, speedMultiplier, zoomScale }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Full 3D 360° Spherical Orbit Camera: yaw (azimuth 0–360°), pitch (elevation -89° to +89°)
  const cameraRef = useRef<{
    yaw: number; // Horizontal orbital rotation around center (radians)
    pitch: number; // Vertical orbital tilt (radians)
    panX: number;
    panY: number;
    distance: number;
  }>({
    yaw: -0.65, // Authentic NASA Eyes oblique start angle
    pitch: 0.58, // ~33° inclination viewing downward onto ecliptic plane
    panX: 0,
    panY: 0,
    distance: 1000
  });

  const interactionMode = useRef<'orbit' | 'pan' | 'none'>('none');
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseMovedDistance = useRef<number>(0);

  const accumulatedDaysRef = useRef<number>(0);
  const selectedBodyRef = useRef<string>(selectedBody);
  const speedMultiplierRef = useRef<number>(speedMultiplier);
  const zoomScaleRef = useRef<number>(zoomScale);
  const onSelectBodyRef = useRef<(name: string) => void>(onSelectBody);

  // Preload and cache planet images
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    Object.entries(PLANET_IMAGE_MAP).forEach(([key, url]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        imageCacheRef.current[key] = img;
      };
    });
  }, []);

  useEffect(() => {
    selectedBodyRef.current = selectedBody;
  }, [selectedBody]);

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    zoomScaleRef.current = zoomScale;
  }, [zoomScale]);

  useEffect(() => {
    onSelectBodyRef.current = onSelectBody;
  }, [onSelectBody]);

  // Project a 3D coordinate (x, y, z) into 2D screen coordinate using camera's 360° yaw/pitch
  const project3D = (
    x: number,
    y: number,
    z: number,
    viewWidth: number,
    viewHeight: number,
    zoom: number
  ) => {
    const cam = cameraRef.current;
    const centerX = viewWidth / 2 + (viewWidth > 900 ? 50 : 0) + cam.panX;
    const centerY = viewHeight / 2 + cam.panY;

    // 1. Rotate around Y axis (Yaw - horizontal 360° orbit)
    const cosY = Math.cos(cam.yaw);
    const sinY = Math.sin(cam.yaw);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // 2. Rotate around X axis (Pitch - elevation / vertical tilt)
    const cosP = Math.cos(cam.pitch);
    const sinP = Math.sin(cam.pitch);
    const y2 = y * cosP - z1 * sinP;
    const z2 = y * sinP + z1 * cosP;

    // 3. Perspective projection
    const fov = 1100;
    const dist = cam.distance;
    const cameraZ = z2 + dist;
    const scale = (fov / Math.max(100, cameraZ)) * zoom;

    const screenX = centerX + x1 * scale;
    const screenY = centerY + y2 * scale;

    return {
      screenX,
      screenY,
      scale,
      depth: z2,
      visible: cameraZ > 50
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse Controls (Left Click = 360° Orbit Tumble; Right Click / Shift = Pan; Wheel = Zoom)
    const handleMouseDown = (e: MouseEvent) => {
      mouseMovedDistance.current = 0;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (e.button === 0 && !e.shiftKey) {
        interactionMode.current = 'orbit'; // 360° Orbital Rotate
      } else if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        interactionMode.current = 'pan'; // Pan view
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (interactionMode.current === 'none') return;

      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      mouseMovedDistance.current += Math.hypot(dx, dy);

      if (interactionMode.current === 'orbit') {
        // Full 360° Orbit rotation sensitivity
        const orbitSpeed = 0.006;
        cameraRef.current.yaw += dx * orbitSpeed;
        cameraRef.current.pitch = Math.max(
          -1.45,
          Math.min(1.45, cameraRef.current.pitch + dy * orbitSpeed)
        );
      } else if (interactionMode.current === 'pan') {
        cameraRef.current.panX += dx;
        cameraRef.current.panY += dy;
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      interactionMode.current = 'none';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Interactive perspective distance / zoom
      const zoomFactor = e.deltaY < 0 ? 0.92 : 1.08;
      cameraRef.current.distance = Math.max(
        350,
        Math.min(3000, cameraRef.current.distance * zoomFactor)
      );
    };

    const handleClick = (e: MouseEvent) => {
      // If user was dragging / rotating, do not trigger click select
      if (mouseMovedDistance.current > 6) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const curZoom = zoomScaleRef.current;
      const width = rect.width;
      const height = rect.height;

      // Project Sun
      const sunProj = project3D(0, 0, 0, width, height, curZoom);
      if (sunProj.visible && Math.hypot(clickX - sunProj.screenX, clickY - sunProj.screenY) < 30) {
        onSelectBodyRef.current('SUN');
        return;
      }

      // Check all orbiting bodies in current 3D positions
      for (const b of BODIES) {
        if (b.name === 'SUN') continue;
        const angle = b.initialAngle + (Math.PI * 2 * accumulatedDaysRef.current) / b.orbitalPeriodDays;
        const incRad = (b.tiltDeg * Math.PI) / 180;

        const x3d = b.semiMajorAU * Math.cos(angle);
        const z3d = b.semiMinorAU * Math.sin(angle) * Math.cos(incRad);
        const y3d = -b.semiMinorAU * Math.sin(angle) * Math.sin(incRad);

        const proj = project3D(x3d, y3d, z3d, width, height, curZoom);
        if (proj.visible) {
          const dist = Math.hypot(clickX - proj.screenX, clickY - proj.screenY);
          if (dist < 26) {
            onSelectBodyRef.current(b.name);
            return;
          }
        }
      }
    };

    const preventContext = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', preventContext);

    // Main 3D Orbital Projection Render Loop
    const render = (timestamp: number) => {
      const deltaSec = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const currentSpeed = speedMultiplierRef.current;
      const currentZoom = zoomScaleRef.current;
      const currentSelected = selectedBodyRef.current;

      accumulatedDaysRef.current += 10 * currentSpeed * deltaSec;
      const simDays = accumulatedDaysRef.current;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Deep Astronomical Sky Background
      const sunProj = project3D(0, 0, 0, width, height, currentZoom);
      const bgGrad = ctx.createRadialGradient(
        sunProj.screenX,
        sunProj.screenY,
        10,
        sunProj.screenX,
        sunProj.screenY,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0a0d14');
      bgGrad.addColorStop(0.5, '#05070a');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw 3D Ecliptic Reference Plane Grid (Polar concentric orbits reference)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;

      // Polar concentric rings on ecliptic
      const gridRadii = [100, 240, 450, 700, 950];
      for (const r of gridRadii) {
        ctx.beginPath();
        let first = true;
        for (let th = 0; th <= Math.PI * 2 + 0.1; th += 0.1) {
          const gx = r * Math.cos(th);
          const gz = r * Math.sin(th);
          const p = project3D(gx, 0, gz, width, height, currentZoom);
          if (p.visible) {
            if (first) {
              ctx.moveTo(p.screenX, p.screenY);
              first = false;
            } else {
              ctx.lineTo(p.screenX, p.screenY);
            }
          }
        }
        ctx.stroke();
      }

      // Radial cardinal reference spokes
      for (let th = 0; th < Math.PI * 2; th += Math.PI / 4) {
        ctx.beginPath();
        const p1 = project3D(0, 0, 0, width, height, currentZoom);
        const p2 = project3D(950 * Math.cos(th), 0, 950 * Math.sin(th), width, height, currentZoom);
        if (p1.visible && p2.visible) {
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.lineTo(p2.screenX, p2.screenY);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 2. Render 3D Elliptical Orbit Paths
      for (const b of BODIES) {
        if (b.name === 'SUN') continue;

        const isCurrent = currentSelected.toUpperCase() === b.name.toUpperCase();
        const incRad = (b.tiltDeg * Math.PI) / 180;

        ctx.save();
        ctx.beginPath();

        if (isCurrent) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.75;
          ctx.setLineDash([]);
        } else if (b.type === 'spacecraft') {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }

        // Trace orbital trajectory points in 3D
        let firstPoint = true;
        const steps = 90;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const ox = b.semiMajorAU * Math.cos(theta);
          const oz = b.semiMinorAU * Math.sin(theta) * Math.cos(incRad);
          const oy = -b.semiMinorAU * Math.sin(theta) * Math.sin(incRad);

          const proj = project3D(ox, oy, oz, width, height, currentZoom);
          if (proj.visible) {
            if (firstPoint) {
              ctx.moveTo(proj.screenX, proj.screenY);
              firstPoint = false;
            } else {
              ctx.lineTo(proj.screenX, proj.screenY);
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Central Sun in 3D (Luminous solar core with outer corona, no flat photograph)
      if (sunProj.visible) {
        const sunRadius = Math.max(18, 30 * sunProj.scale);
        const sunGradient = ctx.createRadialGradient(
          sunProj.screenX,
          sunProj.screenY,
          1,
          sunProj.screenX,
          sunProj.screenY,
          sunRadius
        );
        sunGradient.addColorStop(0, '#ffffff');
        sunGradient.addColorStop(0.2, '#fffbeb');
        sunGradient.addColorStop(0.4, 'rgba(251, 191, 36, 0.85)');
        sunGradient.addColorStop(0.7, 'rgba(245, 158, 11, 0.35)');
        sunGradient.addColorStop(1, 'rgba(217, 119, 6, 0)');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunProj.screenX, sunProj.screenY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Brilliant pure-white fusion plasma core
        const sunCoreR = Math.max(5.5, 9 * sunProj.scale);
        const coreGrad = ctx.createRadialGradient(
          sunProj.screenX,
          sunProj.screenY,
          0,
          sunProj.screenX,
          sunProj.screenY,
          sunCoreR
        );
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.65, '#fef08a');
        coreGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sunProj.screenX, sunProj.screenY, sunCoreR, 0, Math.PI * 2);
        ctx.fill();

        // Subtle corona ring
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sunProj.screenX, sunProj.screenY, sunCoreR, 0, Math.PI * 2);
        ctx.stroke();

        // Sun Label
        ctx.font = '600 11px Plus Jakarta Sans, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText('SUN', sunProj.screenX + sunCoreR + 8, sunProj.screenY + 4);
      }

      // 4. Calculate 3D positions for all bodies and sort by depth (Z-buffer)
      const renderedBodies = [];

      for (const b of BODIES) {
        if (b.name === 'SUN') continue;

        const angle = b.initialAngle + (Math.PI * 2 * simDays) / b.orbitalPeriodDays;
        const incRad = (b.tiltDeg * Math.PI) / 180;

        const bx = b.semiMajorAU * Math.cos(angle);
        const bz = b.semiMinorAU * Math.sin(angle) * Math.cos(incRad);
        const by = -b.semiMinorAU * Math.sin(angle) * Math.sin(incRad);

        const proj = project3D(bx, by, bz, width, height, currentZoom);
        if (proj.visible) {
          renderedBodies.push({
            body: b,
            proj,
            depth: proj.depth
          });
        }
      }

      // Sort by depth (farthest first) so near objects naturally occlude far objects
      renderedBodies.sort((a, b) => b.depth - a.depth);

      // 5. Draw Orbiting Bodies with Depth & Small Photographic Disc Plates
      for (const item of renderedBodies) {
        const { body: b, proj } = item;
        const isCurrent = currentSelected.toUpperCase() === b.name.toUpperCase();
        const px = proj.screenX;
        const py = proj.screenY;

        if (b.type === 'planet') {
          const baseRadius = isCurrent ? 8 : 6;
          const planetRadius = Math.max(4, Math.min(16, baseRadius * proj.scale));

          // Selected target reticle & crosshair
          if (isCurrent) {
            ctx.beginPath();
            ctx.arc(px, py, planetRadius + 7, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Reticle tick crosshairs
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px - planetRadius - 11, py); ctx.lineTo(px - planetRadius - 7, py);
            ctx.moveTo(px + planetRadius + 7, py); ctx.lineTo(px + planetRadius + 11, py);
            ctx.moveTo(px, py - planetRadius - 11); ctx.lineTo(px, py - planetRadius - 7);
            ctx.moveTo(px, py + planetRadius + 7); ctx.lineTo(px, py + planetRadius + 11);
            ctx.stroke();
          }

          // Photographic planet disc
          const pImg = imageCacheRef.current[b.name.toUpperCase()];
          if (pImg && pImg.complete && pImg.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
              pImg,
              px - planetRadius,
              py - planetRadius,
              planetRadius * 2,
              planetRadius * 2
            );
            ctx.restore();

            // Subtle limb edge highlight
            ctx.strokeStyle = isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = isCurrent ? 1.5 : 1;
            ctx.beginPath();
            ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
            ctx.fillStyle = isCurrent ? '#ffffff' : b.color;
            ctx.fill();
          }

          // Selected body luminescence
          if (isCurrent) {
            const glow = ctx.createRadialGradient(px, py, 1, px, py, planetRadius + 12);
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(px, py, planetRadius + 12, 0, Math.PI * 2);
            ctx.fill();
          }

          // Clean Typographic Label
          ctx.font = isCurrent
            ? '600 11px Plus Jakarta Sans, sans-serif'
            : '500 10px Plus Jakarta Sans, sans-serif';
          ctx.fillStyle = isCurrent ? '#ffffff' : 'rgba(226, 232, 240, 0.8)';
          ctx.fillText(b.name, px + planetRadius + 6, py + 3.5);
        } else {
          // Spacecraft diamond marker
          ctx.strokeStyle = isCurrent ? '#ffffff' : 'rgba(148, 163, 184, 0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py - 4);
          ctx.lineTo(px + 4, py);
          ctx.lineTo(px, py + 4);
          ctx.lineTo(px - 4, py);
          ctx.closePath();
          ctx.stroke();

          ctx.font = '400 9.5px JetBrains Mono, monospace';
          ctx.fillStyle = isCurrent ? '#ffffff' : 'rgba(148, 163, 184, 0.7)';
          ctx.fillText(b.name, px + 8, py + 3);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('contextmenu', preventContext);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#030508] select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        style={{ display: 'block' }}
      />
    </div>
  );
}
