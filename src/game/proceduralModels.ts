import * as THREE from 'three';
import { CarConfig, PaintFinish } from '../types/game';

// Procedural Canvas Textures Cache
let carbonFiberTexture: THREE.CanvasTexture | null = null;
let tireTreadTexture: THREE.CanvasTexture | null = null;
let checkerTexture: THREE.CanvasTexture | null = null;
let curbTexture: THREE.CanvasTexture | null = null;
let asphaltTexture: THREE.CanvasTexture | null = null;
let speedPadTexture: THREE.CanvasTexture | null = null;

export function getCarbonFiberTexture(): THREE.CanvasTexture {
  if (carbonFiberTexture) return carbonFiberTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111317';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#1e232a';
  for (let y = 0; y < 128; y += 8) {
    for (let x = 0; x < 128; x += 8) {
      if ((x + y) % 16 === 0) {
        ctx.fillRect(x, y, 8, 8);
      }
    }
  }

  carbonFiberTexture = new THREE.CanvasTexture(canvas);
  carbonFiberTexture.wrapS = THREE.RepeatWrapping;
  carbonFiberTexture.wrapT = THREE.RepeatWrapping;
  carbonFiberTexture.repeat.set(8, 8);
  carbonFiberTexture.colorSpace = THREE.SRGBColorSpace;
  return carbonFiberTexture;
}

export function getTireTreadTexture(): THREE.CanvasTexture {
  if (tireTreadTexture) return tireTreadTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#151515';
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = '#222222';
  for (let i = 0; i < 64; i += 8) {
    ctx.fillRect(0, i, 64, 3);
    ctx.fillRect(i, 0, 3, 64);
  }

  tireTreadTexture = new THREE.CanvasTexture(canvas);
  tireTreadTexture.wrapS = THREE.RepeatWrapping;
  tireTreadTexture.wrapT = THREE.RepeatWrapping;
  tireTreadTexture.repeat.set(2, 6);
  tireTreadTexture.colorSpace = THREE.SRGBColorSpace;
  return tireTreadTexture;
}

export function getCheckerTexture(): THREE.CanvasTexture {
  if (checkerTexture) return checkerTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#111111';
  const size = 32;
  for (let y = 0; y < 128; y += size) {
    for (let x = 0; x < 256; x += size) {
      if ((x / size + y / size) % 2 === 0) {
        ctx.fillRect(x, y, size, size);
      }
    }
  }

  checkerTexture = new THREE.CanvasTexture(canvas);
  checkerTexture.wrapS = THREE.RepeatWrapping;
  checkerTexture.wrapT = THREE.RepeatWrapping;
  checkerTexture.repeat.set(6, 1);
  checkerTexture.colorSpace = THREE.SRGBColorSpace;
  return checkerTexture;
}

export function getCurbTexture(): THREE.CanvasTexture {
  if (curbTexture) return curbTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // FIA Red and White kerb pattern
  ctx.fillStyle = '#e11d48'; // Red
  ctx.fillRect(0, 0, 64, 32);
  ctx.fillStyle = '#f8fafc'; // White
  ctx.fillRect(64, 0, 64, 32);

  curbTexture = new THREE.CanvasTexture(canvas);
  curbTexture.wrapS = THREE.RepeatWrapping;
  curbTexture.wrapT = THREE.RepeatWrapping;
  curbTexture.repeat.set(24, 1);
  curbTexture.colorSpace = THREE.SRGBColorSpace;
  return curbTexture;
}

export function getAsphaltTexture(): THREE.CanvasTexture {
  if (asphaltTexture) return asphaltTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#27292d';
  ctx.fillRect(0, 0, 256, 256);

  // Noise specks for tarmac realism
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const val = Math.random() > 0.5 ? 45 : 30;
    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle tire skid mark strips
  ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
  ctx.fillRect(40, 0, 30, 256);
  ctx.fillRect(180, 0, 30, 256);

  asphaltTexture = new THREE.CanvasTexture(canvas);
  asphaltTexture.wrapS = THREE.RepeatWrapping;
  asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(4, 32);
  asphaltTexture.colorSpace = THREE.SRGBColorSpace;
  return asphaltTexture;
}

export function getSpeedPadTexture(): THREE.CanvasTexture {
  if (speedPadTexture) return speedPadTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(10, 20, 35, 0.9)';
  ctx.fillRect(0, 0, 128, 256);

  // Neon glowing chevron arrows
  ctx.fillStyle = '#06b6d4';
  for (let y = 30; y < 240; y += 70) {
    ctx.beginPath();
    ctx.moveTo(20, y + 40);
    ctx.lineTo(64, y);
    ctx.lineTo(108, y + 40);
    ctx.lineTo(88, y + 40);
    ctx.lineTo(64, y + 16);
    ctx.lineTo(40, y + 40);
    ctx.closePath();
    ctx.fill();
  }

  speedPadTexture = new THREE.CanvasTexture(canvas);
  speedPadTexture.wrapS = THREE.ClampToEdgeWrapping;
  speedPadTexture.wrapT = THREE.ClampToEdgeWrapping;
  speedPadTexture.colorSpace = THREE.SRGBColorSpace;
  return speedPadTexture;
}

export interface ProceduralCarObject {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  bodyMaterial: THREE.MeshStandardMaterial;
  wheels: THREE.Mesh[];
  exhaustPipes: THREE.Mesh[];
  leftNitroFlame: THREE.Mesh;
  rightNitroFlame: THREE.Mesh;
  neonUnderglow: THREE.PointLight;
  headlights: THREE.Mesh[];
  taillights: THREE.Mesh[];
}

export function createProceduralCar(
  config: CarConfig,
  customColor?: string,
  customFinish?: PaintFinish,
  customNeon?: string
): ProceduralCarObject {
  const group = new THREE.Group();

  const colorHex = customColor || config.bodyColor;
  const finish = customFinish || config.finish;
  const neonHex = customNeon || config.neonColor;

  // Material properties by finish
  let roughness = 0.2;
  let metalness = 0.8;
  let map: THREE.CanvasTexture | null = null;

  if (finish === 'metallic') {
    roughness = 0.15;
    metalness = 0.95;
  } else if (finish === 'matte') {
    roughness = 0.65;
    metalness = 0.1;
  } else if (finish === 'carbon') {
    roughness = 0.35;
    metalness = 0.5;
    map = getCarbonFiberTexture();
  }

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness,
    metalness,
    map: map || undefined,
  });

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0x111115,
    roughness: 0.4,
    metalness: 0.9,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x112233,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.1,
    metalness: 0.98,
  });

  // 1. Primary Silhouette: Lower Chassis & Aerodynamic Body
  const bodyGeom = new THREE.BoxGeometry(2.1, 0.5, 4.4);
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterial);
  bodyMesh.position.y = 0.45;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Cockpit Canopy / Glass Dome
  const cabinGeom = new THREE.BoxGeometry(1.5, 0.45, 2.0);
  const cabinMesh = new THREE.Mesh(cabinGeom, glassMaterial);
  cabinMesh.position.set(0, 0.82, -0.2);
  cabinMesh.castShadow = true;
  group.add(cabinMesh);

  // Front Splitter / Nosecone
  const noseGeom = new THREE.BoxGeometry(1.9, 0.15, 0.8);
  const noseMesh = new THREE.Mesh(noseGeom, trimMaterial);
  noseMesh.position.set(0, 0.22, 2.3);
  group.add(noseMesh);

  // Rear Wing / Spoiler
  const wingGeom = new THREE.BoxGeometry(2.2, 0.08, 0.5);
  const wingMesh = new THREE.Mesh(wingGeom, bodyMaterial);
  wingMesh.position.set(0, 0.95, -2.1);
  wingMesh.castShadow = true;
  group.add(wingMesh);

  // Wing Struts (Pylons)
  const strutGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.35);
  const leftStrut = new THREE.Mesh(strutGeom, trimMaterial);
  leftStrut.position.set(-0.6, 0.75, -2.1);
  const rightStrut = leftStrut.clone();
  rightStrut.position.x = 0.6;
  group.add(leftStrut, rightStrut);

  // Rear Aero Diffuser
  const diffuserGeom = new THREE.BoxGeometry(1.7, 0.2, 0.5);
  const diffuserMesh = new THREE.Mesh(diffuserGeom, trimMaterial);
  diffuserMesh.position.set(0, 0.25, -2.25);
  group.add(diffuserMesh);

  // 2. Secondary Read: 4 Wheels (with rims and tires)
  const wheels: THREE.Mesh[] = [];
  const wheelGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.34, 18);
  wheelGeom.rotateZ(Math.PI / 2);

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x1f1f22,
    roughness: 0.85,
    metalness: 0.1,
    map: getTireTreadTexture(),
  });

  const rimGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 12);
  rimGeom.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-1.05, 0.38, 1.4],  // Front Left
    [1.05, 0.38, 1.4],   // Front Right
    [-1.08, 0.38, -1.3], // Rear Left
    [1.08, 0.38, -1.3],  // Rear Right
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheelGroup = new THREE.Mesh(wheelGeom, tireMat);
    wheelGroup.position.set(x, y, z);
    wheelGroup.castShadow = true;

    // Rim inner
    const rim = new THREE.Mesh(rimGeom, chromeMaterial);
    wheelGroup.add(rim);

    // Brake caliper accent
    const caliperGeom = new THREE.BoxGeometry(0.08, 0.14, 0.14);
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3 });
    const caliper = new THREE.Mesh(caliperGeom, caliperMat);
    caliper.position.set(x > 0 ? -0.1 : 0.1, 0.1, 0);
    wheelGroup.add(caliper);

    group.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  // 3. Accent Details: Headlights & Taillights
  const headlightGeom = new THREE.BoxGeometry(0.4, 0.1, 0.15);
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    emissive: 0x93c5fd,
    emissiveIntensity: 2.0,
    roughness: 0.1,
  });
  const leftHeadlight = new THREE.Mesh(headlightGeom, headlightMat);
  leftHeadlight.position.set(-0.7, 0.52, 2.18);
  const rightHeadlight = leftHeadlight.clone();
  rightHeadlight.position.x = 0.7;
  group.add(leftHeadlight, rightHeadlight);

  const taillightGeom = new THREE.BoxGeometry(0.7, 0.08, 0.1);
  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xff1122,
    emissive: 0xff1122,
    emissiveIntensity: 2.5,
    roughness: 0.2,
  });
  const leftTaillight = new THREE.Mesh(taillightGeom, taillightMat);
  leftTaillight.position.set(-0.6, 0.55, -2.22);
  const rightTaillight = leftTaillight.clone();
  rightTaillight.position.x = 0.6;
  group.add(leftTaillight, rightTaillight);

  // Exhaust Pipes
  const exhaustGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.3, 12);
  exhaustGeom.rotateX(Math.PI / 2);
  const leftExhaust = new THREE.Mesh(exhaustGeom, chromeMaterial);
  leftExhaust.position.set(-0.35, 0.32, -2.25);
  const rightExhaust = leftExhaust.clone();
  rightExhaust.position.x = 0.35;
  group.add(leftExhaust, rightExhaust);

  // Nitro Flames (Cone emitter when boosting)
  const flameGeom = new THREE.ConeGeometry(0.16, 1.2, 12);
  flameGeom.rotateX(-Math.PI / 2);
  flameGeom.translate(0, 0, -0.6);

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });

  const leftNitroFlame = new THREE.Mesh(flameGeom, flameMat);
  leftNitroFlame.position.set(-0.35, 0.32, -2.35);
  const rightNitroFlame = leftNitroFlame.clone();
  rightNitroFlame.position.x = 0.35;
  group.add(leftNitroFlame, rightNitroFlame);

  // Neon Underglow Light
  const neonLight = new THREE.PointLight(new THREE.Color(neonHex), 2.2, 5);
  neonLight.position.set(0, 0.12, 0);
  group.add(neonLight);

  return {
    group,
    bodyMesh,
    bodyMaterial,
    wheels,
    exhaustPipes: [leftExhaust, rightExhaust],
    leftNitroFlame,
    rightNitroFlame,
    neonUnderglow: neonLight,
    headlights: [leftHeadlight, rightHeadlight],
    taillights: [leftTaillight, rightTaillight],
  };
}

// Procedural Grandstand
export function createGrandstand(width = 40): THREE.Group {
  const group = new THREE.Group();

  // Tiered seats
  const tiersGeom = new THREE.BoxGeometry(width, 6, 12);
  const tiersMat = new THREE.MeshStandardMaterial({ color: 0x3b4252, roughness: 0.8 });
  const tiers = new THREE.Mesh(tiersGeom, tiersMat);
  tiers.position.set(0, 3, 0);
  tiers.castShadow = true;
  group.add(tiers);

  // Roof canopy
  const roofGeom = new THREE.BoxGeometry(width + 2, 0.4, 14);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.4, metalness: 0.6 });
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.set(0, 8.5, 0);
  roof.castShadow = true;
  group.add(roof);

  // Roof Pillars
  const pillarGeom = new THREE.CylinderGeometry(0.3, 0.3, 8.5);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.5, metalness: 0.8 });
  const p1 = new THREE.Mesh(pillarGeom, pillarMat);
  p1.position.set(-width / 2 + 1, 4.25, 5);
  const p2 = p1.clone();
  p2.position.x = width / 2 - 1;
  group.add(p1, p2);

  // Sponsor Banner across front
  const bannerGeom = new THREE.PlaneGeometry(width, 1.8);
  const bannerMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
  const banner = new THREE.Mesh(bannerGeom, bannerMat);
  banner.position.set(0, 7.2, 6.05);
  group.add(banner);

  return group;
}

// Procedural Start/Finish Gantry
export function createStartGantry(trackWidth: number): THREE.Group {
  const gantry = new THREE.Group();
  const height = 9;

  const beamMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, metalness: 0.85, roughness: 0.3 });
  const leftColGeom = new THREE.CylinderGeometry(0.4, 0.4, height);
  const leftCol = new THREE.Mesh(leftColGeom, beamMat);
  leftCol.position.set(-trackWidth / 2 - 1.5, height / 2, 0);
  leftCol.castShadow = true;

  const rightCol = leftCol.clone();
  rightCol.position.x = trackWidth / 2 + 1.5;

  const crossGeom = new THREE.BoxGeometry(trackWidth + 4, 1.2, 1.2);
  const cross = new THREE.Mesh(crossGeom, beamMat);
  cross.position.set(0, height - 0.6, 0);
  cross.castShadow = true;

  // LED Signboard
  const boardGeom = new THREE.PlaneGeometry(trackWidth, 1.4);
  const boardMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const board = new THREE.Mesh(boardGeom, boardMat);
  board.position.set(0, height - 0.6, 0.62);

  // Start Lights (5 red FIA start light bulbs)
  for (let i = 0; i < 5; i++) {
    const bulbGeom = new THREE.SphereGeometry(0.2, 12, 12);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const bulb = new THREE.Mesh(bulbGeom, bulbMat);
    bulb.position.set(-2 + i * 1.0, height - 0.6, 0.7);
    gantry.add(bulb);
  }

  gantry.add(leftCol, rightCol, cross, board);
  return gantry;
}

// Procedural Tree for Monza / Spa
export function createProceduralTree(): THREE.Group {
  const tree = new THREE.Group();

  // Trunk
  const trunkGeom = new THREE.CylinderGeometry(0.35, 0.55, 3.5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = 1.75;
  trunk.castShadow = true;
  tree.add(trunk);

  // Foliage 3-tiered pine/deciduous cones
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x225522,
    roughness: 0.75,
    metalness: 0.05,
  });

  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.5, 8), foliageMat);
  cone1.position.y = 4.2;
  cone1.castShadow = true;

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.0, 8), foliageMat);
  cone2.position.y = 5.8;
  cone2.castShadow = true;

  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.2, 8), foliageMat);
  cone3.position.y = 7.2;
  cone3.castShadow = true;

  tree.add(cone1, cone2, cone3);
  return tree;
}

// Procedural Monaco Harbor Yacht
export function createMonacoYacht(): THREE.Group {
  const yacht = new THREE.Group();

  const hullGeom = new THREE.BoxGeometry(7, 2.2, 18);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.2 });
  const hull = new THREE.Mesh(hullGeom, hullMat);
  hull.position.y = 1.1;
  hull.castShadow = true;
  yacht.add(hull);

  // Cabin
  const cabinGeom = new THREE.BoxGeometry(5.2, 2.0, 10);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const cabin = new THREE.Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 3.1, -1);
  yacht.add(cabin);

  // Flybridge / Sundeck
  const flyGeom = new THREE.BoxGeometry(4.2, 1.2, 5);
  const flyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const fly = new THREE.Mesh(flyGeom, flyMat);
  fly.position.set(0, 4.6, -2);
  yacht.add(fly);

  // Radar Arch
  const radarGeom = new THREE.CylinderGeometry(0.1, 0.1, 2.2);
  const radarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
  const radar = new THREE.Mesh(radarGeom, radarMat);
  radar.position.set(0, 6.0, -3);
  yacht.add(radar);

  return yacht;
}
