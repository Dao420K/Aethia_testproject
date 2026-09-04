import * as THREE from 'three';

export interface GeneratedPlanetTextures {
  colorTexture: THREE.CanvasTexture;
  bumpTexture: THREE.CanvasTexture;
  specularTexture: THREE.CanvasTexture;
  nightTexture: THREE.CanvasTexture;
  cloudTexture: THREE.CanvasTexture;
}

export function generateAetheliaTextures(width = 2048, height = 1024): GeneratedPlanetTextures {
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

  // Helpers for coordinate mapping
  // x: 0 to width -> lng: -180 to 180
  // y: 0 to height -> lat: 90 to -90
  const lngToX = (lng: number) => ((lng + 180) / 360) * width;
  const latToY = (lat: number) => ((90 - lat) / 180) * height;

  // 1. BASE OCEAN & DEEP WATER (Vibrant Sapphire & Deep Turquoise)
  const oceanGrad = ctxColor.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.0, '#133a5e'); // North icy polar sea
  oceanGrad.addColorStop(0.2, '#184e77'); // Subpolar blue
  oceanGrad.addColorStop(0.5, '#1e6091'); // Deep equatorial ocean blue
  oceanGrad.addColorStop(0.8, '#1a5490'); // South sea
  oceanGrad.addColorStop(1.0, '#10304f'); // South icy polar sea
  ctxColor.fillStyle = oceanGrad;
  ctxColor.fillRect(0, 0, width, height);

  // Specular map: Oceans are highly reflective (white = shiny)
  ctxSpec.fillStyle = '#ffffff';
  ctxSpec.fillRect(0, 0, width, height);

  // Bump map: Ocean is baseline flat (gray 128)
  ctxBump.fillStyle = '#808080';
  ctxBump.fillRect(0, 0, width, height);

  // Night map: Ocean is dark
  ctxNight.fillStyle = '#000000';
  ctxNight.fillRect(0, 0, width, height);

  // Cloud map: Clear fully transparent background
  ctxCloud.clearRect(0, 0, width, height);

  // Draw Shallow Waters / Coral Reefs / Shelf Gradients
  function drawShallowShelf(pts: [number, number][], radius = 25) {
    ctxColor.save();
    ctxColor.filter = 'blur(12px)';
    ctxColor.fillStyle = '#1e6878';
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

  // Draw Continent Landmass with realistic biomes, mountains, & shorelines
  function drawContinent(
    pts: [number, number][],
    baseColor: string,
    bumpHeight: number,
    isMatte = true
  ) {
    // 1. Draw Shallow shelf
    drawShallowShelf(pts, 30);

    // 2. Draw Main Land shape on Color
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

    // Subtle dark beach border
    ctxColor.strokeStyle = '#2b4d32';
    ctxColor.lineWidth = 2;
    ctxColor.stroke();
    ctxColor.restore();

    // 3. Draw on Specular (land is matte / dark gray)
    ctxSpec.save();
    ctxSpec.fillStyle = isMatte ? '#1a1a1a' : '#888888';
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

    // 4. Draw on Height Bump
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

  // Helper for drawing Mountain Ranges
  function drawMountainRange(
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number,
    widthPx = 18,
    snowCaps = true
  ) {
    const x1 = lngToX(startLng);
    const y1 = latToY(startLat);
    const x2 = lngToX(endLng);
    const y2 = latToY(endLat);

    // Draw dark ridge on Color
    ctxColor.save();
    ctxColor.strokeStyle = '#4a3d2c';
    ctxColor.lineWidth = widthPx;
    ctxColor.lineCap = 'round';
    ctxColor.beginPath();
    ctxColor.moveTo(x1, y1);
    ctxColor.lineTo(x2, y2);
    ctxColor.stroke();

    if (snowCaps) {
      ctxColor.strokeStyle = '#e2edf8';
      ctxColor.lineWidth = widthPx * 0.4;
      ctxColor.beginPath();
      ctxColor.moveTo(x1, y1);
      ctxColor.lineTo(x2, y2);
      ctxColor.stroke();
    }
    ctxColor.restore();

    // Height Bump
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

  // Helper for drawing glowing Cities / Volcanoes on Night Texture
  function drawCityGlow(lng: number, lat: number, radius = 8, color = '#ffcc44') {
    const x = lngToX(lng);
    const y = latToY(lat);

    const grad = ctxNight.createRadialGradient(x, y, 0, x, y, radius * 3);
    grad.addColorStop(0, color);
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctxNight.fillStyle = grad;
    ctxNight.beginPath();
    ctxNight.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctxNight.fill();
  }

  // --- DRAW CONTINENTS FROM AETHELIA MAP ---

  // 1. HYPERBOREA (North Ice Cap)
  const hyperborea: [number, number][] = [
    [-180, 90], [180, 90], [180, 68], [140, 62], [100, 66], [50, 60],
    [0, 64], [-40, 61], [-80, 65], [-120, 60], [-160, 66], [-180, 68]
  ];
  drawContinent(hyperborea, '#e6f0fa', 0.8, false);

  // 2. PÔLE SUD GLACÉ (South Ice Cap)
  const poleSud: [number, number][] = [
    [-180, -90], [180, -90], [180, -68], [130, -62], [80, -65], [20, -60],
    [-30, -66], [-80, -62], [-130, -67], [-170, -63], [-180, -68]
  ];
  drawContinent(poleSud, '#dceaf7', 0.8, false);

  // 3. AETHEL (Central-West Large Continent)
  const aethel: [number, number][] = [
    [-125, 45], [-105, 40], [-85, 30], [-70, 15], [-60, -5], [-75, -20],
    [-90, -35], [-105, -30], [-115, -15], [-110, 5], [-120, 25], [-130, 38]
  ];
  drawContinent(aethel, '#2d6a38', 0.65); // Forest green
  drawMountainRange(-120, 35, -80, -15, 22, true); // Les Monts du Dragon
  drawCityGlow(-85, 10, 12, '#ffee88');

  // 4. MÉRIDIA (Far West Continent)
  const meridia: [number, number][] = [
    [-175, 20], [-150, 15], [-140, 0], [-145, -25], [-165, -35], [-180, -20], [-180, 10]
  ];
  drawContinent(meridia, '#7a6e4d', 0.5); // Warm desert/ruins terrain
  drawMountainRange(-170, 10, -150, -20, 16, true); // Monts Ombreux
  drawCityGlow(-155, -10, 9, '#ffaa44'); // Ruines anciennes glow

  // 5. AQUILA (South-West Continent)
  const aquila: [number, number][] = [
    [-155, -38], [-130, -35], [-115, -50], [-125, -62], [-145, -60], [-160, -48]
  ];
  drawContinent(aquila, '#5a784d', 0.55);
  drawMountainRange(-145, -42, -125, -58, 14, true); // Chaîne de l'Aigle
  drawCityGlow(-125, -50, 10, '#ffeeaa'); // Cité de Grissom

  // 6. AURORA (North-Central Continent)
  const aurora: [number, number][] = [
    [-55, 50], [-30, 48], [-20, 30], [-35, 15], [-50, 20], [-60, 35]
  ];
  drawContinent(aurora, '#427848', 0.45); // Plaine des Étoiles
  drawCityGlow(-35, 30, 8, '#aaddff');

  // 7. VERIDIA (North-Central Main Continent)
  const veridia: [number, number][] = [
    [-15, 58], [20, 56], [40, 48], [35, 28], [10, 25], [-10, 35]
  ];
  drawContinent(veridia, '#225d2b', 0.6); // Forêt Millénaire
  // Fleuve d'Or (Gold River)
  ctxColor.save();
  ctxColor.strokeStyle = '#ffd700';
  ctxColor.lineWidth = 4;
  ctxColor.beginPath();
  ctxColor.moveTo(lngToX(30), latToY(45));
  ctxColor.quadraticCurveTo(lngToX(15), latToY(38), lngToX(10), latToY(28));
  ctxColor.stroke();
  ctxColor.restore();
  drawCityGlow(15, 38, 15, '#ffea00'); // Aeris Capital

  // 8. AËRIS (North-East Continent)
  const aeris: [number, number][] = [
    [55, 62], [85, 58], [95, 42], [80, 30], [60, 38], [50, 52]
  ];
  drawContinent(aeris, '#4b7556', 0.5);
  drawCityGlow(70, 50, 10, '#88ffdd');

  // 9. SILVANIA (Far East Continent)
  const silvania: [number, number][] = [
    [135, 32], [170, 28], [178, 0], [165, -22], [140, -18], [130, 10]
  ];
  drawContinent(silvania, '#1a5223', 0.6); // La Grande Forêt de Chênes
  drawCityGlow(155, 8, 12, '#66ff88'); // Cédria

  // 10. IGNIS (South-East Scorched Continent of Fire & Volcanoes)
  const ignis: [number, number][] = [
    [55, -5], [105, -2], [120, -25], [115, -45], [75, -42], [50, -25]
  ];
  drawContinent(ignis, '#b84a1e', 0.75); // Volcanic orange & burnt sulfur ground

  // Montagnes de Feu Volcanic Chain
  drawMountainRange(65, -12, 105, -30, 24, false);

  // Lava Veins & Volcano Calderas on Night Map!
  [
    { lng: 85, lat: -22 },
    { lng: 72, lat: -15 },
    { lng: 98, lat: -28 },
  ].forEach(v => {
    drawCityGlow(v.lng, v.lat, 22, '#ff3300'); // Intense red-orange lava glow
    drawCityGlow(v.lng, v.lat, 10, '#ffffff'); // Lava core
  });

  // 11. VALKYRIA & OCEANA (South Central Continent)
  const valkyria: [number, number][] = [
    [-38, -28], [-10, -26], [5, -40], [-10, -52], [-35, -48]
  ];
  drawContinent(valkyria, '#3b6140', 0.5);
  drawCityGlow(-15, -42, 10, '#ffeeaa'); // Villa Valk / Port Royal

  // 12. CELESTIA (Floating Cloud Islands - North West)
  // Draw floating island silhouettes with golden energy cores
  const celestiaIslands = [
    { lng: -145, lat: 52, r: 12 },
    { lng: -155, lat: 58, r: 8 },
    { lng: -135, lat: 48, r: 9 },
  ];
  celestiaIslands.forEach(isl => {
    const x = lngToX(isl.lng);
    const y = latToY(isl.lat);
    ctxColor.save();
    ctxColor.fillStyle = '#6b829c';
    ctxColor.beginPath();
    ctxColor.arc(x, y, isl.r, 0, Math.PI * 2);
    ctxColor.fill();

    ctxColor.fillStyle = '#d4f0ff';
    ctxColor.beginPath();
    ctxColor.arc(x, y, isl.r * 0.6, 0, Math.PI * 2);
    ctxColor.fill();
    ctxColor.restore();

    drawCityGlow(isl.lng, isl.lat, 14, '#00e1ff'); // Floating Ether magic glow
  });

  // --- GENERATE PROCEDURAL VOLUMETRIC CLOUDS TEXTURE ---
  // Soft swirling atmosphere cloud map
  for (let i = 0; i < 180; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height * 0.8 + height * 0.1;
    const rx = 40 + Math.random() * 120;
    const ry = 15 + Math.random() * 40;

    const grad = ctxCloud.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctxCloud.save();
    ctxCloud.fillStyle = grad;
    ctxCloud.beginPath();
    ctxCloud.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctxCloud.fill();
    ctxCloud.restore();
  }

  // Create Three.js Textures
  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.ClampToEdgeWrapping;
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.needsUpdate = true;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.ClampToEdgeWrapping;
  bumpTex.needsUpdate = true;

  const specTex = new THREE.CanvasTexture(specCanvas);
  specTex.wrapS = THREE.RepeatWrapping;
  specTex.wrapT = THREE.ClampToEdgeWrapping;
  specTex.needsUpdate = true;

  const nightTex = new THREE.CanvasTexture(nightCanvas);
  nightTex.wrapS = THREE.RepeatWrapping;
  nightTex.wrapT = THREE.ClampToEdgeWrapping;
  nightTex.colorSpace = THREE.SRGBColorSpace;
  nightTex.needsUpdate = true;

  const cloudTex = new THREE.CanvasTexture(cloudCanvas);
  cloudTex.wrapS = THREE.RepeatWrapping;
  cloudTex.wrapT = THREE.ClampToEdgeWrapping;
  cloudTex.needsUpdate = true;

  return {
    colorTexture: colorTex,
    bumpTexture: bumpTex,
    specularTexture: specTex,
    nightTexture: nightTex,
    cloudTexture: cloudTex
  };
}
