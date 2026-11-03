import * as THREE from 'three';
import { F1Track } from '../types/game';
import {
  getAsphaltTexture,
  getCheckerTexture,
  getCurbTexture,
  getSpeedPadTexture,
  createGrandstand,
  createStartGantry,
  createProceduralTree,
  createMonacoYacht,
} from './proceduralModels';

export interface BuiltTrack {
  group: THREE.Group;
  curve: THREE.CatmullRomCurve3;
  points: THREE.Vector3[];
  sampleLength: number;
  boostPads: { position: THREE.Vector3; index: number; mesh: THREE.Mesh }[];
  ramps: { position: THREE.Vector3; index: number; mesh: THREE.Mesh }[];
  checkpointDistances: number[];
}

export function buildF1Circuit(track: F1Track): BuiltTrack {
  const group = new THREE.Group();

  // 1. Build continuous 3D Catmull-Rom spline
  const points = track.splinePoints.map(
    (p) => new THREE.Vector3(p[0], p[1], p[2])
  );
  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);

  const SEGMENTS = 600;
  const samplePoints = curve.getSpacedPoints(SEGMENTS);
  const sampleLength = curve.getLength();

  const trackWidth = track.width;
  const curbWidth = 1.8;

  // Geometry buffers for Asphalt ribbon
  const roadPositions: number[] = [];
  const roadNormals: number[] = [];
  const roadUvs: number[] = [];
  const roadIndices: number[] = [];

  // Geometry buffers for Curbs
  const curbLeftPositions: number[] = [];
  const curbRightPositions: number[] = [];
  const curbUvs: number[] = [];
  const curbIndices: number[] = [];

  // Barrier safety rails
  const barrierPositions: number[] = [];
  const barrierIndices: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const pt = samplePoints[i % SEGMENTS];
    const tangent = curve.getTangentAt(t).normalize();

    // Normal and Binormal
    const normal = new THREE.Vector3();
    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    normal.crossVectors(binormal, tangent).normalize();

    // Track surface vertices (left and right edges)
    const leftPt = pt.clone().addScaledVector(binormal, -trackWidth / 2);
    const rightPt = pt.clone().addScaledVector(binormal, trackWidth / 2);

    roadPositions.push(leftPt.x, leftPt.y, leftPt.z);
    roadPositions.push(rightPt.x, rightPt.y, rightPt.z);

    roadNormals.push(normal.x, normal.y, normal.z);
    roadNormals.push(normal.x, normal.y, normal.z);

    const vCoord = (i / SEGMENTS) * (sampleLength / 12);
    roadUvs.push(0, vCoord);
    roadUvs.push(1, vCoord);

    // Outer kerbs
    const curbLeftOuter = leftPt.clone().addScaledVector(binormal, -curbWidth);
    const curbRightOuter = rightPt.clone().addScaledVector(binormal, curbWidth);

    curbLeftPositions.push(curbLeftOuter.x, curbLeftOuter.y + 0.05, curbLeftOuter.z);
    curbLeftPositions.push(leftPt.x, leftPt.y + 0.05, leftPt.z);

    curbRightPositions.push(rightPt.x, rightPt.y + 0.05, rightPt.z);
    curbRightPositions.push(curbRightOuter.x, curbRightOuter.y + 0.05, curbRightOuter.z);

    curbUvs.push(0, vCoord * 4);
    curbUvs.push(1, vCoord * 4);

    // Barrier vertices (steel armco barriers on both sides)
    const barLeftBot = curbLeftOuter.clone();
    const barLeftTop = curbLeftOuter.clone().add(new THREE.Vector3(0, 1.4, 0));
    const barRightBot = curbRightOuter.clone();
    const barRightTop = curbRightOuter.clone().add(new THREE.Vector3(0, 1.4, 0));

    barrierPositions.push(barLeftBot.x, barLeftBot.y, barLeftBot.z);
    barrierPositions.push(barLeftTop.x, barLeftTop.y, barLeftTop.z);
    barrierPositions.push(barRightBot.x, barRightBot.y, barRightBot.z);
    barrierPositions.push(barRightTop.x, barRightTop.y, barRightTop.z);

    if (i < SEGMENTS) {
      const base = i * 2;
      roadIndices.push(base, base + 1, base + 2);
      roadIndices.push(base + 1, base + 3, base + 2);

      curbIndices.push(base, base + 1, base + 2);
      curbIndices.push(base + 1, base + 3, base + 2);

      const bBase = i * 4;
      // Left barrier quad
      barrierIndices.push(bBase, bBase + 1, bBase + 4);
      barrierIndices.push(bBase + 1, bBase + 5, bBase + 4);
      // Right barrier quad
      barrierIndices.push(bBase + 2, bBase + 6, bBase + 3);
      barrierIndices.push(bBase + 3, bBase + 6, bBase + 7);
    }
  }

  // 1. Road Mesh
  const roadGeom = new THREE.BufferGeometry();
  roadGeom.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
  roadGeom.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
  roadGeom.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
  roadGeom.setIndex(roadIndices);

  const roadMat = new THREE.MeshStandardMaterial({
    map: getAsphaltTexture(),
    roughness: 0.85,
    metalness: 0.1,
  });
  const roadMesh = new THREE.Mesh(roadGeom, roadMat);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // 2. Curbs Meshes
  const curbLeftGeom = new THREE.BufferGeometry();
  curbLeftGeom.setAttribute('position', new THREE.Float32BufferAttribute(curbLeftPositions, 3));
  curbLeftGeom.setAttribute('uv', new THREE.Float32BufferAttribute(curbUvs, 2));
  curbLeftGeom.setIndex(curbIndices);
  curbLeftGeom.computeVertexNormals();

  const curbRightGeom = new THREE.BufferGeometry();
  curbRightGeom.setAttribute('position', new THREE.Float32BufferAttribute(curbRightPositions, 3));
  curbRightGeom.setAttribute('uv', new THREE.Float32BufferAttribute(curbUvs, 2));
  curbRightGeom.setIndex(curbIndices);
  curbRightGeom.computeVertexNormals();

  const curbMat = new THREE.MeshStandardMaterial({
    map: getCurbTexture(),
    roughness: 0.6,
    metalness: 0.1,
  });

  const curbLeftMesh = new THREE.Mesh(curbLeftGeom, curbMat);
  curbLeftMesh.receiveShadow = true;
  const curbRightMesh = new THREE.Mesh(curbRightGeom, curbMat);
  curbRightMesh.receiveShadow = true;
  group.add(curbLeftMesh, curbRightMesh);

  // 3. Barriers
  const barrierGeom = new THREE.BufferGeometry();
  barrierGeom.setAttribute('position', new THREE.Float32BufferAttribute(barrierPositions, 3));
  barrierGeom.setIndex(barrierIndices);
  barrierGeom.computeVertexNormals();

  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.7,
    roughness: 0.3,
  });
  const barrierMesh = new THREE.Mesh(barrierGeom, barrierMat);
  barrierMesh.castShadow = true;
  group.add(barrierMesh);

  // 4. Start / Finish Line Decal
  const startPt = samplePoints[0];
  const startTan = curve.getTangentAt(0).normalize();
  const startBino = new THREE.Vector3().crossVectors(startTan, up).normalize();

  const checkerGeom = new THREE.PlaneGeometry(trackWidth, 4);
  const checkerMat = new THREE.MeshBasicMaterial({
    map: getCheckerTexture(),
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const checkerMesh = new THREE.Mesh(checkerGeom, checkerMat);
  checkerMesh.rotation.x = -Math.PI / 2;
  checkerMesh.rotation.z = Math.atan2(startTan.x, startTan.z);
  checkerMesh.position.set(startPt.x, startPt.y + 0.04, startPt.z);
  group.add(checkerMesh);

  // 5. Start / Finish Gantry with red starting lights
  const gantry = createStartGantry(trackWidth);
  gantry.position.set(startPt.x, startPt.y, startPt.z);
  gantry.rotation.y = Math.atan2(startBino.x, startBino.z);
  group.add(gantry);

  // 6. Grandstands along main straight and famous corners
  const gs1 = createGrandstand(50);
  gs1.position.copy(startPt).addScaledVector(startBino, trackWidth / 2 + 10);
  gs1.rotation.y = Math.atan2(startTan.x, startTan.z) - Math.PI / 2;
  group.add(gs1);

  const gs2 = createGrandstand(45);
  const midPointIdx = Math.floor(SEGMENTS * 0.45);
  const midPt = samplePoints[midPointIdx];
  const midTan = curve.getTangentAt(0.45).normalize();
  const midBino = new THREE.Vector3().crossVectors(midTan, up).normalize();
  gs2.position.copy(midPt).addScaledVector(midBino, trackWidth / 2 + 12);
  gs2.rotation.y = Math.atan2(midTan.x, midTan.z) - Math.PI / 2;
  group.add(gs2);

  // 7. Interactive Asphalt Boost Pads
  const boostPads: { position: THREE.Vector3; index: number; mesh: THREE.Mesh }[] = [];
  const boostIndices = track.boostPads || [2, 10, 18];
  boostIndices.forEach((nodeIdx) => {
    const t = (nodeIdx / track.splinePoints.length);
    const pos = curve.getPointAt(t);
    const tan = curve.getTangentAt(t).normalize();

    const padGeom = new THREE.PlaneGeometry(6, 10);
    const padMat = new THREE.MeshBasicMaterial({
      map: getSpeedPadTexture(),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    const padMesh = new THREE.Mesh(padGeom, padMat);
    padMesh.rotation.x = -Math.PI / 2;
    padMesh.rotation.z = Math.atan2(tan.x, tan.z);
    padMesh.position.set(pos.x, pos.y + 0.05, pos.z);

    // Glowing outline
    const glowLight = new THREE.PointLight(0x06b6d4, 2, 8);
    glowLight.position.set(0, 0.5, 0);
    padMesh.add(glowLight);

    group.add(padMesh);
    boostPads.push({ position: pos, index: nodeIdx, mesh: padMesh });
  });

  // 8. Asphalt Jump Ramps
  const ramps: { position: THREE.Vector3; index: number; mesh: THREE.Mesh }[] = [];
  const rampIndices = track.ramps || [5, 14];
  rampIndices.forEach((nodeIdx) => {
    const t = (nodeIdx / track.splinePoints.length);
    const pos = curve.getPointAt(t);
    const tan = curve.getTangentAt(t).normalize();
    const bino = new THREE.Vector3().crossVectors(tan, up).normalize();

    // Wedge ramp
    const rampWidth = 6;
    const rampLength = 9;
    const rampHeight = 1.8;

    const rampGeom = new THREE.BufferGeometry();
    const v = [
      // Base
      -rampWidth / 2, 0, 0,
      rampWidth / 2, 0, 0,
      rampWidth / 2, 0, rampLength,
      -rampWidth / 2, 0, rampLength,
      // Slope
      -rampWidth / 2, rampHeight, rampLength,
      rampWidth / 2, rampHeight, rampLength,
    ];
    const ind = [
      0, 1, 5, 0, 5, 4, // Incline surface
      4, 5, 2, 4, 2, 3, // Back drop
      0, 4, 3, // Left side
      1, 2, 5, // Right side
    ];
    rampGeom.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    rampGeom.setIndex(ind);
    rampGeom.computeVertexNormals();

    const rampMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const rampMesh = new THREE.Mesh(rampGeom, rampMat);
    rampMesh.position.copy(pos).addScaledVector(bino, 0);
    rampMesh.rotation.y = Math.atan2(tan.x, tan.z);
    rampMesh.castShadow = true;
    group.add(rampMesh);

    ramps.push({ position: pos, index: nodeIdx, mesh: rampMesh });
  });

  // 9. Theme-specific scenery
  if (track.ambientTheme === 'park' || track.ambientTheme === 'forest_hills') {
    // Trees along perimeter
    const treeCount = track.ambientTheme === 'forest_hills' ? 120 : 60;
    for (let i = 0; i < treeCount; i++) {
      const tree = createProceduralTree();
      const t = Math.random();
      const pt = curve.getPointAt(t);
      const tan = curve.getTangentAt(t).normalize();
      const bino = new THREE.Vector3().crossVectors(tan, up).normalize();
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = (trackWidth / 2 + 14 + Math.random() * 60) * side;
      tree.position.copy(pt).addScaledVector(bino, offset);
      tree.position.y = Math.max(0, pt.y);
      const scale = 0.8 + Math.random() * 0.5;
      tree.scale.set(scale, scale, scale);
      group.add(tree);
    }
  } else if (track.ambientTheme === 'city_harbor') {
    // Monaco yachts in harbor & city buildings
    for (let i = 0; i < 8; i++) {
      const yacht = createMonacoYacht();
      yacht.position.set(70 + (i % 4) * 22, -1.2, 50 + Math.floor(i / 4) * 35);
      yacht.rotation.y = Math.PI / 4 + Math.random() * 0.3;
      group.add(yacht);
    }
    // Water plane
    const waterGeom = new THREE.PlaneGeometry(350, 300);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f4c81,
      roughness: 0.1,
      metalness: 0.8,
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(110, -1.3, 100);
    group.add(water);

    // Iconic Monaco Tunnel enclosure
    const tunnelCurvePoints = [
      new THREE.Vector3(60, -1, -10),
      new THREE.Vector3(110, -1, 60),
      new THREE.Vector3(150, -1, 140),
    ];
    const tunnelCurve = new THREE.CatmullRomCurve3(tunnelCurvePoints);
    const tunnelGeom = new THREE.TubeGeometry(tunnelCurve, 20, trackWidth * 0.65, 12, false);
    const tunnelMat = new THREE.MeshStandardMaterial({
      color: 0x1e222d,
      side: THREE.BackSide,
      roughness: 0.7,
    });
    const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
    tunnel.position.y = 2.5;
    group.add(tunnel);

    // Neon lights inside tunnel
    for (let i = 0; i < 4; i++) {
      const tLight = new THREE.PointLight(0xffaa44, 2.5, 20);
      const p = tunnelCurve.getPointAt(i / 3);
      tLight.position.set(p.x, p.y + 4, p.z);
      group.add(tLight);
    }
  } else if (track.ambientTheme === 'figure8') {
    // Suzuka Ferris Wheel & Bridge
    const ferrisGroup = new THREE.Group();
    const wheelRim = new THREE.Mesh(
      new THREE.TorusGeometry(26, 0.8, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.7, roughness: 0.3 })
    );
    ferrisGroup.add(wheelRim);
    ferrisGroup.position.set(180, 30, -50);
    ferrisGroup.rotation.y = Math.PI / 3;
    group.add(ferrisGroup);
  }

  // 10. Checkpoint sector distances for sector times
  const checkpointDistances = track.sectors.map((s) => s.percentage * sampleLength);

  return {
    group,
    curve,
    points: samplePoints,
    sampleLength,
    boostPads,
    ramps,
    checkpointDistances,
  };
}
