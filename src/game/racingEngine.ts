import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { F1Track, CarConfig, CameraView, RacerState } from '../types/game';
import { buildF1Circuit, BuiltTrack } from './trackBuilder';
import { createProceduralCar, ProceduralCarObject } from './proceduralModels';
import { RacingPhysics, ControlInput } from './physics';
import { CARS, AI_NAMES } from '../data/cars';

export class RacingEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private pmremGenerator: THREE.PMREMGenerator;

  public physics: RacingPhysics;
  private builtTrack: BuiltTrack;
  private playerCarObj: ProceduralCarObject;
  private aiCarObjs: { id: string; obj: ProceduralCarObject; state: RacerState }[] = [];

  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  public cameraMode: CameraView = 'chase';
  public input: ControlInput = {
    throttle: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    nitroTap: false,
    handbrake: false,
    spin360: false,
  };

  private particlesMesh: THREE.InstancedMesh | null = null;
  private dummyObj: THREE.Object3D = new THREE.Object3D();
  private maxParticles: number = 300;

  private cameraShake: number = 0;
  public isRacing: boolean = false;

  constructor(
    container: HTMLElement,
    track: F1Track,
    playerCarConfig: CarConfig,
    customColor?: string,
    customFinish?: string,
    customNeon?: string
  ) {
    this.container = container;

    // 1. Software WebGL Guard (Skill requirement)
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(track.skyColor);
    this.scene.fog = new THREE.FogExp2(track.fogColor, 0.0022);

    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.5,
      1400
    );

    // 4. Studio Reflection Environment (Skill requirement)
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    // 5. Lighting Rig (Key Light + Cool Hemisphere Fill)
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    sunLight.position.set(120, 180, 80);
    sunLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 400;
      const d = 120;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
    }
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, track.groundColor, 0.9);
    this.scene.add(hemiLight);

    // Ground terrain base plane
    const terrainGeom = new THREE.PlaneGeometry(1600, 1600, 8, 8);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: track.groundColor,
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.y = -0.4;
    terrainMesh.receiveShadow = true;
    this.scene.add(terrainMesh);

    // 6. Build Circuit
    this.builtTrack = buildF1Circuit(track);
    this.scene.add(this.builtTrack.group);

    // 7. Initialize Cars
    // Player Car
    this.playerCarObj = createProceduralCar(
      playerCarConfig,
      customColor,
      customFinish as any,
      customNeon
    );
    this.scene.add(this.playerCarObj.group);

    // 5 AI Competitors
    const aiKeys = Object.keys(CARS);
    const aiConfigs = AI_NAMES.slice(0, 5).map((name, i) => {
      const cKey = aiKeys[(i + 1) % aiKeys.length];
      return {
        id: `ai_${i}`,
        name,
        carConfig: CARS[cKey],
      };
    });

    // 8. Racing Physics
    this.physics = new RacingPhysics(this.builtTrack, playerCarConfig, aiConfigs);

    // Instantiate 3D Models for AI
    this.aiCarObjs = this.physics.aiStates.map((aiState, i) => {
      const cfg = aiConfigs[i].carConfig;
      const carObj = createProceduralCar(cfg);
      this.scene.add(carObj.group);
      return {
        id: aiState.id,
        obj: carObj,
        state: aiState,
      };
    });

    // 9. Particle Instanced Mesh
    this.initParticles();

    // 10. Start Animation Loop
    this.startLoop();
  }

  private initParticles() {
    const pGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    this.particlesMesh = new THREE.InstancedMesh(pGeom, pMat, this.maxParticles);
    this.particlesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.particlesMesh);
  }

  public triggerShake(amount = 0.4) {
    this.cameraShake = Math.max(this.cameraShake, amount);
  }

  private startLoop() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.05);

      // 1. Update Physics
      this.physics.update(delta, this.input, this.isRacing);

      // 2. Sync Player 3D Car
      const p = this.physics.playerState;
      const pGroup = this.playerCarObj.group;
      pGroup.position.set(p.position.x, p.position.y, p.position.z);
      pGroup.rotation.y = p.heading + p.driftAngle;
      // Slight pitch when airborne or accelerating
      pGroup.rotation.x = p.isAirborne ? -0.15 : 0;
      // Drift roll
      pGroup.rotation.z = p.driftAngle * -0.3;

      // Spin 4 wheels
      const wheelSpin = (p.speedKmh / 3.6) * delta * 8;
      this.playerCarObj.wheels.forEach((w) => {
        w.rotation.x += wheelSpin;
      });

      // Update Nitro Flame visual effects
      const flameOpacity = p.nitroState === 'off' ? 0 : 0.95;
      const flameMat = this.playerCarObj.leftNitroFlame.material as THREE.MeshBasicMaterial;
      flameMat.opacity = flameOpacity;
      (this.playerCarObj.rightNitroFlame.material as THREE.MeshBasicMaterial).opacity = flameOpacity;

      if (p.nitroState === 'shockwave') {
        flameMat.color.setHex(0xff3300); // Shockwave blazing fire
        this.playerCarObj.leftNitroFlame.scale.set(1.6, 2.2, 1.6);
        this.playerCarObj.rightNitroFlame.scale.set(1.6, 2.2, 1.6);
      } else if (p.nitroState === 'perfect') {
        flameMat.color.setHex(0xb5179e); // Purple perfect trail
        this.playerCarObj.leftNitroFlame.scale.set(1.3, 1.7, 1.3);
        this.playerCarObj.rightNitroFlame.scale.set(1.3, 1.7, 1.3);
      } else if (p.nitroState === 'single') {
        flameMat.color.setHex(0x00d4ff); // Blue neon fire
        this.playerCarObj.leftNitroFlame.scale.set(1.0, 1.3, 1.0);
        this.playerCarObj.rightNitroFlame.scale.set(1.0, 1.3, 1.0);
      }

      // 3. Sync AI Cars
      this.aiCarObjs.forEach(({ obj, state }) => {
        obj.group.position.set(state.position.x, state.position.y, state.position.z);
        obj.group.rotation.y = state.heading;
        const aiWheelSpin = (state.speedKmh / 3.6) * delta * 8;
        obj.wheels.forEach((w) => {
          w.rotation.x += aiWheelSpin;
        });

        const aiFlame = obj.leftNitroFlame.material as THREE.MeshBasicMaterial;
        aiFlame.opacity = state.nitroState !== 'off' ? 0.9 : 0;
        (obj.rightNitroFlame.material as THREE.MeshBasicMaterial).opacity = aiFlame.opacity;
      });

      // 4. Update Particle Instanced Mesh
      if (this.particlesMesh) {
        const particles = this.physics.particles;
        let count = 0;
        for (let i = 0; i < Math.min(particles.length, this.maxParticles); i++) {
          const pt = particles[i];
          this.dummyObj.position.copy(pt.position);
          this.dummyObj.scale.set(pt.size, pt.size, pt.size);
          this.dummyObj.updateMatrix();
          this.particlesMesh.setMatrixAt(i, this.dummyObj.matrix);
          this.particlesMesh.setColorAt(i, pt.color);
          count++;
        }
        // Hide unused instances
        for (let i = count; i < this.maxParticles; i++) {
          this.dummyObj.scale.set(0, 0, 0);
          this.dummyObj.updateMatrix();
          this.particlesMesh.setMatrixAt(i, this.dummyObj.matrix);
        }
        this.particlesMesh.instanceMatrix.needsUpdate = true;
        if (this.particlesMesh.instanceColor) {
          this.particlesMesh.instanceColor.needsUpdate = true;
        }
      }

      // 5. Update Camera
      this.updateCamera(delta);

      // 6. Render
      this.renderer.render(this.scene, this.camera);

      // Skill: software WebGL pacing
      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateCamera(delta: number) {
    const p = this.physics.playerState;
    const cam = this.camera;

    // FOV Rush based on speed & Nitro
    let targetFov = 62;
    if (p.nitroState === 'shockwave') targetFov = 86;
    else if (p.nitroState === 'perfect') targetFov = 78;
    else if (p.nitroState === 'single') targetFov = 72;
    else targetFov = 62 + (p.speedKmh / 400) * 8;

    cam.fov = THREE.MathUtils.damp(cam.fov, targetFov, 5, delta);
    cam.updateProjectionMatrix();

    // Camera shake decay
    let shakeX = 0;
    let shakeY = 0;
    if (this.cameraShake > 0) {
      shakeX = (Math.random() - 0.5) * this.cameraShake;
      shakeY = (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake = Math.max(0, this.cameraShake - delta * 1.5);
    }

    const angle = p.heading;
    const pPos = new THREE.Vector3(p.position.x, p.position.y, p.position.z);

    if (this.cameraMode === 'chase') {
      // Third-person dynamic Asphalt chase cam
      const followDist = 8.8 + (p.speedKmh / 350) * 2.2;
      const followHeight = 3.6 + (p.speedKmh / 350) * 0.8;

      const targetX = p.position.x - Math.sin(angle) * followDist + shakeX;
      const targetZ = p.position.z - Math.cos(angle) * followDist;
      const targetY = p.position.y + followHeight + shakeY;

      cam.position.x = THREE.MathUtils.damp(cam.position.x, targetX, 10, delta);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, targetY, 10, delta);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, targetZ, 10, delta);

      const lookAhead = 14;
      const lookTarget = new THREE.Vector3(
        p.position.x + Math.sin(angle) * lookAhead,
        p.position.y + 1.2,
        p.position.z + Math.cos(angle) * lookAhead
      );
      cam.lookAt(lookTarget);
    } else if (this.cameraMode === 'hood') {
      // Hood camera
      const hDist = 1.6;
      cam.position.set(
        p.position.x + Math.sin(angle) * hDist + shakeX,
        p.position.y + 1.1 + shakeY,
        p.position.z + Math.cos(angle) * hDist
      );
      cam.lookAt(
        p.position.x + Math.sin(angle) * 30,
        p.position.y + 1.0,
        p.position.z + Math.cos(angle) * 30
      );
    } else if (this.cameraMode === 'bumper') {
      // Bumper / low camera
      cam.position.set(
        p.position.x + Math.sin(angle) * 2.4,
        p.position.y + 0.45,
        p.position.z + Math.cos(angle) * 2.4
      );
      cam.lookAt(
        p.position.x + Math.sin(angle) * 30,
        p.position.y + 0.45,
        p.position.z + Math.cos(angle) * 30
      );
    } else if (this.cameraMode === 'cockpit') {
      // Interior / Cockpit
      cam.position.set(
        p.position.x - Math.sin(angle) * 0.1,
        p.position.y + 0.88,
        p.position.z - Math.cos(angle) * 0.1
      );
      cam.lookAt(
        p.position.x + Math.sin(angle) * 30,
        p.position.y + 0.88,
        p.position.z + Math.cos(angle) * 30
      );
    } else if (this.cameraMode === 'cinematic') {
      // Showroom / slow orbit
      const time = Date.now() * 0.0008;
      cam.position.set(
        pPos.x + Math.sin(time) * 12,
        pPos.y + 4.5,
        pPos.z + Math.cos(time) * 12
      );
      cam.lookAt(pPos.x, pPos.y + 1, pPos.z);
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public updateCarAppearance(color: string, finish: string, neon: string) {
    const pMat = this.playerCarObj.bodyMaterial;
    pMat.color.set(color);

    if (finish === 'metallic') {
      pMat.roughness = 0.15;
      pMat.metalness = 0.95;
    } else if (finish === 'matte') {
      pMat.roughness = 0.65;
      pMat.metalness = 0.1;
    }

    this.playerCarObj.neonUnderglow.color.set(neon);
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.pmremGenerator.dispose();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
