import * as THREE from 'three';
import { GeneratedPlanetTextures } from './aetheliaTexture';

export function generateGaiaTextures(width = 2048, height = 1024): GeneratedPlanetTextures {
  // Create canvases for maps
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

  // 1. BASE OCEAN & DEEP WATER (Deep Sapphire & Aquamarine Sea)
  const oceanGrad = ctxColor.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.0, '#102a45'); // North icy polar ocean
  oceanGrad.addColorStop(0.18, '#144168'); // Subpolar ocean
  oceanGrad.addColorStop(0.5, '#0d5c75'); // Deep equatorial ocean
  oceanGrad.addColorStop(0.82, '#12486b'); // South ocean
  oceanGrad.addColorStop(1.0, '#0c2238'); // South icy polar ocean
  ctxColor.fillStyle = oceanGrad;
  ctxColor.fillRect(0, 0, width, height);

  // Specular map: Oceans are highly reflective
  ctxSpec.fillStyle = '#ffffff';
  ctxSpec.fillRect(0, 0, width, height);

  // Bump map: Baseline ocean flat
  ctxBump.fillStyle = '#808080';
  ctxBump.fillRect(0, 0, width, height);

  // Night map: Deep dark ocean baseline
  ctxNight.fillStyle = '#000000';
  ctxNight.fillRect(0, 0, width, height);

  // Cloud map: Clear background
  ctxCloud.clearRect(0, 0, width, height);

  // Helper: Shallow Water Shelf
  function drawShallowShelf(pts: [number, number][]) {
    ctxColor.save();
    ctxColor.filter = 'blur(14px)';
    ctxColor.fillStyle = '#1c829b';
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

  // Helper: Continent Drawing
  function drawContinent(
    pts: [number, number][],
    baseColor: string,
    bumpHeight: number
  ) {
    drawShallowShelf(pts);

    // Color shape
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
    ctxColor.restore();

    // Specular shape (land is matte)
    ctxSpec.save();
    ctxSpec.fillStyle = '#222222';
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

    // Bump shape
    ctxBump.save();
    ctxBump.fillStyle = `rgb(${bumpHeight}, ${bumpHeight}, ${bumpHeight})`;
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

  // Helper: Mountain Range
  function drawMountainRange(pts: [number, number][], color = '#733219') {
    ctxColor.save();
    ctxColor.strokeStyle = color;
    ctxColor.lineWidth = 14;
    ctxColor.lineCap = 'round';
    ctxColor.lineJoin = 'round';
    ctxColor.filter = 'blur(3px)';
    ctxColor.beginPath();
    pts.forEach(([lng, lat], i) => {
      const x = lngToX(lng);
      const y = latToY(lat);
      if (i === 0) ctxColor.moveTo(x, y);
      else ctxColor.lineTo(x, y);
    });
    ctxColor.stroke();

    // Peaks
    ctxColor.strokeStyle = '#e6c8a0';
    ctxColor.lineWidth = 6;
    ctxColor.stroke();
    ctxColor.restore();

    // Bump peaks
    ctxBump.save();
    ctxBump.strokeStyle = '#ffffff';
    ctxBump.lineWidth = 12;
    ctxBump.lineCap = 'round';
    ctxBump.filter = 'blur(4px)';
    ctxBump.beginPath();
    pts.forEach(([lng, lat], i) => {
      const x = lngToX(lng);
      const y = latToY(lat);
      if (i === 0) ctxBump.moveTo(x, y);
      else ctxBump.lineTo(x, y);
    });
    ctxBump.stroke();
    ctxBump.restore();
  }

  // Helper: City Night Lights Cluster
  function drawCityLightCluster(lng: number, lat: number, radius = 25, intensity = '#ffd166') {
    const x = lngToX(lng);
    const y = latToY(lat);
    const grad = ctxNight.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, intensity);
    grad.addColorStop(0.4, '#ff9f1c');
    grad.addColorStop(0.8, '#90be6d');
    grad.addColorStop(1, 'transparent');
    ctxNight.fillStyle = grad;
    ctxNight.beginPath();
    ctxNight.arc(x, y, radius, 0, Math.PI * 2);
    ctxNight.fill();
  }

  // ---------------------------------------------------------------------
  // 1. TERRE DES GLACES ÉTERNELLES (North Pole Ice Cap)
  // ---------------------------------------------------------------------
  const northIcePts: [number, number][] = [
    [-180, 88], [-120, 82], [-60, 78], [0, 85], [60, 80], [120, 84], [180, 88],
    [180, 90], [-180, 90]
  ];
  drawContinent(northIcePts, '#e0f4fc', 210);

  // 2. CONTINENT CENTRAL GAIA (Main Massive Landmass)
  const gaiaCentralPts: [number, number][] = [
    [-90, 45], [-60, 52], [-20, 55], [20, 48], [60, 50], [90, 42],
    [110, 20], [130, -10], [110, -35], [80, -55], [30, -65], [-10, -58],
    [-40, -42], [-65, -28], [-80, -10], [-95, 15]
  ];
  drawContinent(gaiaCentralPts, '#2d6a4f', 165);

  // 3. CONTINENT DU COUCHANT (Western Americas / Western Landmass)
  const couchantPts: [number, number][] = [
    [-175, 35], [-145, 42], [-120, 28], [-110, 0], [-125, -25], [-150, -45],
    [-170, -38], [-180, 10]
  ];
  drawContinent(couchantPts, '#40916c', 160);

  // 4. FORÊT D'ORPHÉE (Dense Emerald Jungle Belt in South-East)
  ctxColor.save();
  ctxColor.filter = 'blur(8px)';
  ctxColor.fillStyle = '#1b4332';
  ctxColor.beginPath();
  const orpheeX = lngToX(75);
  const orpheeY = latToY(-45);
  ctxColor.arc(orpheeX, orpheeY, width * 0.08, 0, Math.PI * 2);
  ctxColor.fill();
  ctxColor.restore();

  // 5. PAYS DES ÉPICES (Golden Spice Desert & Dunes in South-West)
  ctxColor.save();
  ctxColor.filter = 'blur(6px)';
  ctxColor.fillStyle = '#d4a373';
  ctxColor.beginPath();
  const epicesX = lngToX(-25);
  const epicesY = latToY(-32);
  ctxColor.arc(epicesX, epicesY, width * 0.07, 0, Math.PI * 2);
  ctxColor.fill();
  ctxColor.restore();

  // 6. LE LAC DE CRISTAL D'GAIA (Glowing Crystal Central Lake)
  const crystalLakeX = lngToX(-10);
  const crystalLakeY = latToY(28);
  ctxColor.save();
  ctxColor.fillStyle = '#80ed99';
  ctxColor.filter = 'blur(2px)';
  ctxColor.beginPath();
  ctxColor.ellipse(crystalLakeX, crystalLakeY, width * 0.035, height * 0.045, 0, 0, Math.PI * 2);
  ctxColor.fill();
  ctxColor.restore();

  // Lake specular & glow
  ctxSpec.save();
  ctxSpec.fillStyle = '#ffffff';
  ctxSpec.beginPath();
  ctxSpec.ellipse(crystalLakeX, crystalLakeY, width * 0.035, height * 0.045, 0, 0, Math.PI * 2);
  ctxSpec.fill();
  ctxSpec.restore();

  // Crystal lake night glow
  const lakeGlow = ctxNight.createRadialGradient(crystalLakeX, crystalLakeY, 0, crystalLakeX, crystalLakeY, width * 0.05);
  lakeGlow.addColorStop(0, '#57cc99');
  lakeGlow.addColorStop(0.5, '#38a3a5');
  lakeGlow.addColorStop(1, 'transparent');
  ctxNight.fillStyle = lakeGlow;
  ctxNight.beginPath();
  ctxNight.arc(crystalLakeX, crystalLakeY, width * 0.05, 0, Math.PI * 2);
  ctxNight.fill();

  // 7. MONTS DE BRASE (Volcanic Flame Range)
  drawMountainRange([[-70, 20], [-65, 0], [-60, -20], [-55, -35]], '#a4161a');

  // Glowing lava peaks on night map
  ctxNight.save();
  ctxNight.strokeStyle = '#ff4d6d';
  ctxNight.lineWidth = 6;
  ctxNight.filter = 'blur(3px)';
  ctxNight.beginPath();
  const ptsLava: [number, number][] = [[-70, 20], [-65, 0], [-60, -20], [-55, -35]];
  ptsLava.forEach(([lng, lat], i) => {
    const x = lngToX(lng);
    const y = latToY(lat);
    if (i === 0) ctxNight.moveTo(x, y);
    else ctxNight.lineTo(x, y);
  });
  ctxNight.stroke();
  ctxNight.restore();

  // 8. ARCHIPEL DU LEVANT & ARCHIPEL DU RAISE (Eastern Tropical Islands)
  const islands: [number, number][] = [
    [115, 20], [120, 15], [125, 10], [130, 2], [135, -8], [140, -18],
    [118, 30], [128, -25], [145, -5]
  ];
  islands.forEach(([lng, lat]) => {
    drawContinent(
      [[lng - 2, lat + 2], [lng + 3, lat + 1], [lng + 2, lat - 3], [lng - 3, lat - 2]],
      '#52b788',
      150
    );
  });

  // 9. CITY NIGHT LIGHT CLUSTERS
  drawCityLightCluster(-10, 28, 35, '#aacc00'); // Crystal Lake Metropolis
  drawCityLightCluster(75, -45, 30, '#52b788'); // Cité d'Orphée
  drawCityLightCluster(-135, -5, 28, '#ffb703'); // Citadel of Couchant
  drawCityLightCluster(120, 15, 22, '#48cae4'); // Levant Harbor
  drawCityLightCluster(70, 58, 25, '#fb8500'); // Caravane d'Eurama

  // 10. CLOUD MAP (Lush Ethereal Clouds)
  ctxCloud.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const rx = 80 + Math.random() * 180;
    const ry = 15 + Math.random() * 35;
    ctxCloud.save();
    ctxCloud.filter = 'blur(10px)';
    ctxCloud.beginPath();
    ctxCloud.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctxCloud.fill();
    ctxCloud.restore();
  }

  // Create THREE CanvasTextures
  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  const specularTexture = new THREE.CanvasTexture(specCanvas);
  const nightTexture = new THREE.CanvasTexture(nightCanvas);
  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);

  [colorTexture, bumpTexture, specularTexture, nightTexture, cloudTexture].forEach(t => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
  });

  return { colorTexture, bumpTexture, specularTexture, nightTexture, cloudTexture };
}
