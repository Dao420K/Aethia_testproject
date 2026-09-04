import * as THREE from 'three';
import { GeneratedPlanetTextures } from './aetheliaTexture';

export function generateAethelgardTextures(width = 2048, height = 1024): GeneratedPlanetTextures {
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

  // 1. BASE OCEAN: The Great Sea (La Grande Mer) - Vintage Parchment Teal Blue
  const oceanGrad = ctxColor.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.0, '#1c4a63'); // Polar North Ocean
  oceanGrad.addColorStop(0.2, '#1e526d');
  oceanGrad.addColorStop(0.5, '#1b5e78'); // Equatorial Great Sea
  oceanGrad.addColorStop(0.8, '#1e526d');
  oceanGrad.addColorStop(1.0, '#143c52'); // Polar South Ocean
  ctxColor.fillStyle = oceanGrad;
  ctxColor.fillRect(0, 0, width, height);

  ctxSpec.fillStyle = '#ffffff'; // Ocean is shiny
  ctxSpec.fillRect(0, 0, width, height);

  ctxBump.fillStyle = '#808080'; // Ocean baseline height
  ctxBump.fillRect(0, 0, width, height);

  ctxNight.fillStyle = '#000000';
  ctxNight.fillRect(0, 0, width, height);

  ctxCloud.clearRect(0, 0, width, height);

  // Shallow Continental Shelf Helper
  function drawShallowShelf(pts: [number, number][]) {
    ctxColor.save();
    ctxColor.filter = 'blur(10px)';
    ctxColor.fillStyle = '#22788c';
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

  // Draw Continent Shape
  function drawContinent(
    pts: [number, number][],
    baseColor: string,
    bumpHeight: number,
    isMatte = true,
    borderColor = '#2a4d33'
  ) {
    drawShallowShelf(pts);

    // Color
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

    // Specular
    ctxSpec.save();
    ctxSpec.fillStyle = isMatte ? '#1e1e1e' : '#999999';
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

    // Bump
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

  // Mountain Ridge Helper
  function drawMountainRange(
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number,
    widthPx = 20,
    snowCaps = true
  ) {
    const x1 = lngToX(startLng);
    const y1 = latToY(startLat);
    const x2 = lngToX(endLng);
    const y2 = latToY(endLat);

    ctxColor.save();
    ctxColor.strokeStyle = '#4e412e';
    ctxColor.lineWidth = widthPx;
    ctxColor.lineCap = 'round';
    ctxColor.beginPath();
    ctxColor.moveTo(x1, y1);
    ctxColor.lineTo(x2, y2);
    ctxColor.stroke();

    if (snowCaps) {
      ctxColor.strokeStyle = '#f0f6fc';
      ctxColor.lineWidth = widthPx * 0.45;
      ctxColor.beginPath();
      ctxColor.moveTo(x1, y1);
      ctxColor.lineTo(x2, y2);
      ctxColor.stroke();
    }
    ctxColor.restore();

    ctxBump.save();
    ctxBump.strokeStyle = '#ffffff';
    ctxBump.lineWidth = widthPx * 1.3;
    ctxBump.lineCap = 'round';
    ctxBump.beginPath();
    ctxBump.moveTo(x1, y1);
    ctxBump.lineTo(x2, y2);
    ctxBump.stroke();
    ctxBump.restore();
  }

  // City & Volcano Glow Helper
  function drawGlowPoint(lng: number, lat: number, radius = 10, color = '#ffcc44') {
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

  // --- DRAW CONTINENTS FROM AETHELGARD MAP ---

  // 1. THE FROZEN CROWN (North Pole / Pôle Nord)
  const frozenCrown: [number, number][] = [
    [-180, 90], [180, 90], [180, 65], [120, 60], [60, 63], [0, 58],
    [-60, 64], [-120, 60], [-180, 65]
  ];
  drawContinent(frozenCrown, '#f0f7ff', 0.85, false, '#99bbdd');

  // 2. THE GREAT ICE SHELF (South Pole / Pôle Sud)
  const iceShelf: [number, number][] = [
    [-180, -90], [180, -90], [180, -62], [110, -68], [40, -60], [-20, -65],
    [-90, -60], [-150, -66], [-180, -62]
  ];
  drawContinent(iceShelf, '#e8f4fc', 0.85, false, '#88aacc');

  // 3. VERIDIA (North-West Continent: Lush Forests & Rocky Ridge)
  const veridiaContinent: [number, number][] = [
    [-160, 52], [-110, 50], [-80, 42], [-90, 20], [-130, 25], [-165, 38]
  ];
  drawContinent(veridiaContinent, '#337a40', 0.65);
  drawMountainRange(-135, 48, -95, 25, 22, true); // Le Sentier Illustre
  drawGlowPoint(-110, 38, 12, '#ffdd66');

  // 4. AETHEL (South-West Continent: Deserts & Dragon's Teeth)
  const aethelContinent: [number, number][] = [
    [-145, 12], [-100, 10], [-70, -10], [-85, -42], [-125, -45], [-150, -15]
  ];
  drawContinent(aethelContinent, '#a39352', 0.6); // Warm olive desert/savannah
  drawMountainRange(-140, 5, -115, -38, 24, true); // The Dragon's Teeth
  drawGlowPoint(-95, -18, 11, '#ffaa44'); // Caatatifon

  // 5. SERAPHINA (Central-East Continent: Aeris Capital, Gilded Wastes, Port d'Argent)
  const seraphinaContinent: [number, number][] = [
    [10, 40], [65, 38], [80, 18], [75, -20], [45, -35], [20, -15], [0, 10]
  ];
  drawContinent(seraphinaContinent, '#c2ab67', 0.65); // Golden sands & savannas
  drawMountainRange(25, 32, 60, 28, 20, true); // Lion Mountains
  drawGlowPoint(15, -5, 16, '#ffee66'); // Aeris Capital
  drawGlowPoint(68, 8, 14, '#66ddff'); // Port d'Argent

  // 6. IGNIS (South-East Continent: Active Volcanoes & Fire)
  const ignisContinent: [number, number][] = [
    [75, -25], [135, -20], [155, -45], [120, -55], [85, -48]
  ];
  drawContinent(ignisContinent, '#7d3822', 0.8, true, '#ff3300'); // Burnt basaltic rock
  drawMountainRange(85, -28, 140, -42, 28, false); // Ignis Volcanic Ridge

  // Active Lava Calderas on Night Map
  [
    { lng: 105, lat: -32 },
    { lng: 125, lat: -38 },
    { lng: 138, lat: -44 },
  ].forEach(v => {
    drawGlowPoint(v.lng, v.lat, 24, '#ff2200'); // Intense lava glow
    drawGlowPoint(v.lng, v.lat, 10, '#ffffff'); // Core
  });

  // 7. OCEANA (Far East Archipelagos)
  const oceanaIslands: [number, number][] = [
    [150, 42], [168, 38], [175, 15], [165, -10], [148, 12]
  ];
  drawContinent(oceanaIslands, '#2f8251', 0.45);
  drawGlowPoint(162, 22, 10, '#55ffff');

  // Swirling Clouds for Aethelgard
  for (let i = 0; i < 200; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height * 0.85 + height * 0.08;
    const rx = 35 + Math.random() * 110;
    const ry = 12 + Math.random() * 35;

    const grad = ctxCloud.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
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
