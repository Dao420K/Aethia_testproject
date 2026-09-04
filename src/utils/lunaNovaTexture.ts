import * as THREE from 'three';
import { GeneratedPlanetTextures } from './aetheliaTexture';

export function generateLunaNovaTextures(width = 2048, height = 1024): GeneratedPlanetTextures {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctxColor = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const ctxBump = bumpCanvas.getContext('2d')!;

  const specCanvas = document.createElement('canvas');
  specCanvas.width = width;
  specCanvas.height = height;
  const ctxSpec = specCanvas.getContext('2d')!;

  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = width;
  nightCanvas.height = height;
  const ctxNight = nightCanvas.getContext('2d')!;

  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = width;
  cloudCanvas.height = height;
  const ctxCloud = cloudCanvas.getContext('2d')!;

  const lngToX = (lng: number) => ((lng + 180) / 360) * width;
  const latToY = (lat: number) => ((90 - lat) / 180) * height;

  // 1. BASE OCEAN: Mer Majeure (44% water ocean) - Vintage Sapphire / Steel Blue
  const oceanGrad = ctxColor.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.0, '#153648'); // Polar North Sea
  oceanGrad.addColorStop(0.2, '#184257');
  oceanGrad.addColorStop(0.5, '#1b506b'); // Equatorial Mer Majeure
  oceanGrad.addColorStop(0.8, '#184257');
  oceanGrad.addColorStop(1.0, '#112c3b'); // Polar South Sea
  ctxColor.fillStyle = oceanGrad;
  ctxColor.fillRect(0, 0, width, height);

  ctxSpec.fillStyle = '#ffffff'; // Ocean is specular reflective
  ctxSpec.fillRect(0, 0, width, height);

  ctxBump.fillStyle = '#808080'; // Baseline sea level height
  ctxBump.fillRect(0, 0, width, height);

  ctxNight.fillStyle = '#000000';
  ctxNight.fillRect(0, 0, width, height);

  ctxCloud.clearRect(0, 0, width, height);

  // Helper for continental shelf
  function drawShelf(pts: [number, number][]) {
    ctxColor.save();
    ctxColor.filter = 'blur(8px)';
    ctxColor.fillStyle = '#22637a';
    ctxColor.beginPath();
    pts.forEach(([lng, lat], i) => {
      const x = lngToX(lng);
      const y = latToY(lat);
      if (i === 0) ctxColor.moveTo(x, y);
      else ctxColor.lineTo(x, y);
    });
    ctxColor.closePath();
    ctxColor.fill();
    ctxColor.restore();
  }

  // Helper for drawing continent
  function drawContinent(
    pts: [number, number][],
    baseColor: string,
    bumpHeight: number,
    isMatte = true,
    borderColor = '#223d2a'
  ) {
    drawShelf(pts);

    // Land Color
    ctxColor.save();
    ctxColor.fillStyle = baseColor;
    ctxColor.beginPath();
    pts.forEach(([lng, lat], i) => {
      const x = lngToX(lng);
      const y = latToY(lat);
      if (i === 0) ctxColor.moveTo(x, y);
      else ctxColor.lineTo(x, y);
    });
    ctxColor.closePath();
    ctxColor.fill();

    ctxColor.strokeStyle = borderColor;
    ctxColor.lineWidth = 2;
    ctxColor.stroke();
    ctxColor.restore();

    // Specular (land is matte)
    ctxSpec.save();
    ctxSpec.fillStyle = isMatte ? '#151515' : '#888888';
    ctxSpec.beginPath();
    pts.forEach(([lng, lat], i) => {
      const x = lngToX(lng);
      const y = latToY(lat);
      if (i === 0) ctxSpec.moveTo(x, y);
      else ctxSpec.lineTo(x, y);
    });
    ctxSpec.closePath();
    ctxSpec.fill();
    ctxSpec.restore();

    // Bump map
    ctxBump.save();
    const bumpVal = Math.floor(128 + bumpHeight * 80);
    const hexBump = '#' + bumpVal.toString(16).padStart(2, '0').repeat(3);
    ctxBump.fillStyle = hexBump;
    ctxBump.beginPath();
    pts.forEach(([lng, lat], i) => {
      const x = lngToX(lng);
      const y = latToY(lat);
      if (i === 0) ctxBump.moveTo(x, y);
      else ctxBump.lineTo(x, y);
    });
    ctxBump.closePath();
    ctxBump.fill();
    ctxBump.restore();
  }

  // Mountain Range Helper
  function drawMountains(
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number,
    widthPx = 22,
    snowCaps = true
  ) {
    const x1 = lngToX(startLng);
    const y1 = latToY(startLat);
    const x2 = lngToX(endLng);
    const y2 = latToY(endLat);

    ctxColor.save();
    ctxColor.strokeStyle = '#423725';
    ctxColor.lineWidth = widthPx;
    ctxColor.lineCap = 'round';
    ctxColor.beginPath();
    ctxColor.moveTo(x1, y1);
    ctxColor.lineTo(x2, y2);
    ctxColor.stroke();

    if (snowCaps) {
      ctxColor.strokeStyle = '#f0f6ff';
      ctxColor.lineWidth = widthPx * 0.4;
      ctxColor.beginPath();
      ctxColor.moveTo(x1, y1);
      ctxColor.lineTo(x2, y2);
      ctxColor.stroke();
    }
    ctxColor.restore();

    ctxBump.save();
    ctxBump.strokeStyle = '#ffffff';
    ctxBump.lineWidth = widthPx * 1.2;
    ctxBump.lineCap = 'round';
    ctxBump.beginPath();
    ctxBump.moveTo(x1, y1);
    ctxBump.lineTo(x2, y2);
    ctxBump.stroke();
    ctxBump.restore();
  }

  // Glow point for cities and volcanic craters
  function drawGlow(lng: number, lat: number, radius = 10, color = '#ffcc44') {
    const x = lngToX(lng);
    const y = latToY(lat);

    const grad = ctxNight.createRadialGradient(x, y, 0, x, y, radius * 2.5);
    grad.addColorStop(0, color);
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctxNight.fillStyle = grad;
    ctxNight.beginPath();
    ctxNight.arc(x, y, radius * 2.5, 0, Math.PI * 2);
    ctxNight.fill();
  }

  // --- DRAW LUNA NOVA CONTINENTS (3 CONTINENTS, POLAR CAPS & MER MAJEURE) ---

  // 1. PÔLE NORD GLACÉ (Frozen Polar North)
  const poleNord: [number, number][] = [
    [-180, 90], [180, 90], [180, 68], [100, 64], [10, 60], [-80, 65], [-180, 68]
  ];
  drawContinent(poleNord, '#f0f7fc', 0.85, false, '#99bacc');

  // 2. PÔLE SUD GLACÉ (Frozen Polar South)
  const poleSud: [number, number][] = [
    [-180, -90], [180, -90], [180, -66], [80, -62], [-20, -68], [-110, -64], [-180, -66]
  ];
  drawContinent(poleSud, '#e8f2fc', 0.85, false, '#88a6cc');

  // 3. CONTINENT D'AETHEL (West Continent: Les Monts du Dragon, Forêt d'Aethel, Port-Aethel)
  const aethelContinent: [number, number][] = [
    [-160, 48], [-110, 45], [-80, 22], [-95, -12], [-120, -52], [-145, -20], [-170, 20]
  ];
  drawContinent(aethelContinent, '#788c42', 0.65); // Green-olive lush continent
  drawMountains(-145, 42, -98, -8, 26, true); // Les Monts du Dragon
  drawGlow(-92, -2, 14, '#ffdd55'); // Port-Aethel

  // 4. CONTINENT DE VERIDIA (Central Continent: Forêt Millénaire, Fleuve d'Or, Aeris Capital)
  const veridiaContinent: [number, number][] = [
    [0, 52], [55, 48], [75, 28], [60, -5], [10, -15], [-20, 18]
  ];
  drawContinent(veridiaContinent, '#2d7a3a', 0.7); // Deep ancient forest green
  drawMountains(15, 42, 45, 38, 20, true);
  drawGlow(35, 8, 16, '#ffaa33'); // Aeris Capital

  // 5. CONTINENT D'IGNIS (South-East Continent: Montagnes de Feu, Désert de Soufre)
  const ignisContinent: [number, number][] = [
    [65, -15], [140, -10], [165, -42], [115, -55], [75, -45]
  ];
  drawContinent(ignisContinent, '#a36233', 0.78, true, '#cc4400'); // Volcanic sulfur orange
  drawMountains(85, -18, 148, -38, 28, false); // Montagnes de Feu

  // Active Volcanic Eruptions on Ignis
  [
    { lng: 110, lat: -22 },
    { lng: 135, lat: -28 },
    { lng: 152, lat: -36 },
  ].forEach(v => {
    drawGlow(v.lng, v.lat, 22, '#ff3300');
    drawGlow(v.lng, v.lat, 8, '#ffffff');
  });

  // 6. SWIRLING LUNA NOVA CLOUDS (Subtle atmosphere)
  for (let i = 0; i < 180; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height * 0.82 + height * 0.09;
    const rx = 30 + Math.random() * 90;
    const ry = 10 + Math.random() * 30;

    const grad = ctxCloud.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctxCloud.save();
    ctxCloud.fillStyle = grad;
    ctxCloud.beginPath();
    ctxCloud.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctxCloud.fill();
    ctxCloud.restore();
  }

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.needsUpdate = true;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.needsUpdate = true;

  const specTex = new THREE.CanvasTexture(specCanvas);
  specTex.wrapS = THREE.RepeatWrapping;
  specTex.needsUpdate = true;

  const nightTex = new THREE.CanvasTexture(nightCanvas);
  nightTex.wrapS = THREE.RepeatWrapping;
  nightTex.colorSpace = THREE.SRGBColorSpace;
  nightTex.needsUpdate = true;

  const cloudTex = new THREE.CanvasTexture(cloudCanvas);
  cloudTex.wrapS = THREE.RepeatWrapping;
  cloudTex.needsUpdate = true;

  return {
    colorTexture: colorTex,
    bumpTexture: bumpTex,
    specularTexture: specTex,
    nightTexture: nightTex,
    cloudTexture: cloudTex,
  };
}
