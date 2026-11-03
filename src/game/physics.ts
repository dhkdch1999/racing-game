import * as THREE from 'three';
import { CarConfig, RacerState } from '../types/game';
import { BuiltTrack } from './trackBuilder';
import { soundManager } from '../audio/soundManager';

export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export interface ControlInput {
  throttle: boolean;
  brake: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  nitroTap: boolean;
  handbrake: boolean;
  spin360: boolean;
}

export class RacingPhysics {
  public particles: Particle[] = [];
  public track: BuiltTrack;
  public playerState: RacerState;
  public aiStates: RacerState[];
  public playerConfig: CarConfig;
  public onTakedown?: (rivalName: string) => void;
  public onNitroStateChange?: (state: 'off' | 'single' | 'perfect' | 'shockwave') => void;
  public onAirtime?: (duration: number) => void;

  private nitroPulseWindow: { start: number; end: number } = { start: 0.65, end: 0.85 };
  private perfectNitroEligible: boolean = false;
  private airtimeTimer: number = 0;
  private previousPosition = new THREE.Vector3();

  constructor(
    track: BuiltTrack,
    playerConfig: CarConfig,
    aiConfigs: { id: string; name: string; carConfig: CarConfig }[]
  ) {
    this.track = track;
    this.playerConfig = playerConfig;

    const startPt = track.points[0];
    const tangent = track.curve.getTangentAt(0).normalize();
    const heading = Math.atan2(tangent.x, tangent.z);

    this.playerState = {
      id: 'player',
      name: 'Player 1',
      isPlayer: true,
      carId: playerConfig.id,
      color: playerConfig.bodyColor,
      position: { x: startPt.x, y: startPt.y, z: startPt.z },
      velocity: { x: 0, y: 0, z: 0 },
      speedKmh: 0,
      heading,
      progress: 0,
      lap: 1,
      rank: 6,
      isDrifting: false,
      driftAngle: 0,
      nitroLevel: 60,
      nitroState: 'off',
      isAirborne: false,
      spinAngle: 0,
      lapTimes: [],
      currentLapTime: 0,
      bestLapTime: null,
      driftScore: 0,
      wreckCooldown: 0,
    };

    // Stagger AI cars on starting grid
    const up = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();

    this.aiStates = aiConfigs.map((ai, index) => {
      const gridDist = (index + 1) * -8;
      const laneOffset = (index % 2 === 0 ? 1 : -1) * 3.5;
      const gridPos = startPt.clone()
        .addScaledVector(tangent, gridDist)
        .addScaledVector(binormal, laneOffset);

      return {
        id: ai.id,
        name: ai.name,
        isPlayer: false,
        carId: ai.carConfig.id,
        color: ai.carConfig.bodyColor,
        position: { x: gridPos.x, y: gridPos.y, z: gridPos.z },
        velocity: { x: 0, y: 0, z: 0 },
        speedKmh: 0,
        heading,
        progress: (track.sampleLength + gridDist) / track.sampleLength,
        lap: 1,
        rank: index + 1,
        isDrifting: false,
        driftAngle: 0,
        nitroLevel: 50,
        nitroState: 'off',
        isAirborne: false,
        spinAngle: 0,
        lapTimes: [],
        currentLapTime: 0,
        bestLapTime: null,
        driftScore: 0,
        wreckCooldown: 0,
      };
    });
  }

  public handleNitroPress() {
    const p = this.playerState;

    if (p.nitroState === 'off') {
      if (p.nitroLevel < 15) return;
      // Check if Shockwave (full bar activation)
      if (p.nitroLevel >= 95) {
        p.nitroState = 'shockwave';
        soundManager.playNitroBlast('shockwave');
      } else {
        p.nitroState = 'single';
        this.perfectNitroEligible = true;
        soundManager.playNitroBlast('single');
      }
    } else if (p.nitroState === 'single') {
      // Perfect Nitro check
      const levelNorm = p.nitroLevel / 100;
      if (levelNorm >= this.nitroPulseWindow.start && levelNorm <= this.nitroPulseWindow.end) {
        p.nitroState = 'perfect';
        soundManager.playNitroBlast('perfect');
      } else if (p.nitroLevel >= 90) {
        p.nitroState = 'shockwave';
        soundManager.playNitroBlast('shockwave');
      } else {
        // Normal boost re-tap
        p.nitroState = 'off';
      }
    } else {
      p.nitroState = 'off';
    }

    if (this.onNitroStateChange) {
      this.onNitroStateChange(p.nitroState);
    }
  }

  public update(delta: number, input: ControlInput, isRacing: boolean) {
    if (delta > 0.1) delta = 0.1; // clamp lag spikes

    if (isRacing) {
      this.updatePlayer(delta, input);
      this.updateAI(delta);
      this.updateRanks();
      this.checkCollisions();
    }

    this.updateParticles(delta);
  }

  private updatePlayer(delta: number, input: ControlInput) {
    const p = this.playerState;
    const cfg = this.playerConfig;

    // Lap timer
    p.currentLapTime += delta;

    // 1. Top Speed & Acceleration calculation based on Nitro State
    let maxSpeed = cfg.topSpeed;
    let accelRate = (100 / (cfg.acceleration * 1.5)) * 1.8; // m/s^2

    if (p.nitroState === 'single') {
      maxSpeed *= 1.18;
      accelRate *= 1.6;
      p.nitroLevel -= (22 / cfg.nitroEfficiency) * delta;
    } else if (p.nitroState === 'perfect') {
      maxSpeed *= 1.32;
      accelRate *= 2.2;
      p.nitroLevel -= (28 / cfg.nitroEfficiency) * delta;
    } else if (p.nitroState === 'shockwave') {
      maxSpeed *= 1.48;
      accelRate *= 3.0;
      p.nitroLevel -= (38 / cfg.nitroEfficiency) * delta;
    }

    // Auto turn off nitro when depleted
    if (p.nitroLevel <= 0) {
      p.nitroLevel = 0;
      if (p.nitroState !== 'off') {
        p.nitroState = 'off';
        if (this.onNitroStateChange) this.onNitroStateChange('off');
      }
    }

    // 2. Throttle / Brake / Drag
    let speed = p.speedKmh / 3.6; // convert to m/s
    if (input.throttle) {
      speed += accelRate * delta;
    } else if (input.brake) {
      speed -= 25.0 * delta;
    } else {
      speed -= 4.5 * delta; // rolling resistance
    }

    if (speed < 0) speed = 0;
    const maxSpeedMs = maxSpeed / 3.6;
    if (speed > maxSpeedMs) speed = maxSpeedMs;

    p.speedKmh = speed * 3.6;

    // 3. Drifting & Steering
    const isTryingToDrift = (input.handbrake || (input.brake && speed > 15)) && (input.steerLeft || input.steerRight);
    if (isTryingToDrift && !p.isAirborne) {
      p.isDrifting = true;
      const targetDriftAngle = input.steerLeft ? 0.45 : -0.45;
      p.driftAngle = THREE.MathUtils.damp(p.driftAngle, targetDriftAngle, 6, delta);

      // Fast nitro recharge during drift
      p.nitroLevel = Math.min(100, p.nitroLevel + 22 * delta);
      p.driftScore += Math.floor(speed * delta * 20);

      // Spawn drift tire smoke & sparks
      this.spawnDriftParticles(p, delta);
    } else {
      p.isDrifting = false;
      p.driftAngle = THREE.MathUtils.damp(p.driftAngle, 0, 8, delta);
    }

    // Turn rate
    let turnSpeed = (cfg.handling / 10) * 1.6;
    if (p.isDrifting) turnSpeed *= 1.3;
    if (input.steerLeft) p.heading += turnSpeed * delta;
    if (input.steerRight) p.heading -= turnSpeed * delta;

    // 4. Flat spin / 360 Spin
    if (input.spin360 && p.spinAngle === 0) {
      p.spinAngle = Math.PI * 2;
      soundManager.playNitroBlast('perfect');
    }
    if (p.spinAngle > 0) {
      const spinDelta = 12 * delta;
      p.heading += spinDelta;
      p.spinAngle = Math.max(0, p.spinAngle - spinDelta);
    }

    // 5. Airborne Physics & Ramp jump
    if (p.isAirborne) {
      this.airtimeTimer += delta;
      p.velocity.y -= 28 * delta; // Gravity
      p.position.y += p.velocity.y * delta;

      // Ground raycast check
      const groundY = this.getTrackGroundY(p.position.x, p.position.z);
      if (p.position.y <= groundY) {
        p.position.y = groundY;
        p.isAirborne = false;
        p.velocity.y = 0;
        if (this.onAirtime && this.airtimeTimer > 0.3) {
          this.onAirtime(this.airtimeTimer);
        }
        this.airtimeTimer = 0;
        // Nitro reward for clean landing
        p.nitroLevel = Math.min(100, p.nitroLevel + 18);
      }
    }

    // 6. Move player position along heading
    const moveDist = speed * delta;
    const moveAngle = p.heading + p.driftAngle;
    p.position.x += Math.sin(moveAngle) * moveDist;
    p.position.z += Math.cos(moveAngle) * moveDist;

    if (!p.isAirborne) {
      p.position.y = this.getTrackGroundY(p.position.x, p.position.z);
    }

    // 7. Track collision bounds & Boost Pad detection
    this.checkTrackFeatures(p);

    // 8. Progress and Laps
    this.updateRacerProgress(p);

    // Audio update
    soundManager.updateEngine(
      p.speedKmh,
      cfg.topSpeed * 1.35,
      p.isDrifting,
      p.nitroState !== 'off'
    );
  }

  private updateAI(delta: number) {
    const track = this.track;
    const totalDist = track.sampleLength;

    this.aiStates.forEach((ai, idx) => {
      // AI follows the optimal track spline line with slight lateral variance
      const laneOffset = Math.sin(ai.progress * Math.PI * 6 + idx) * 3.2;

      // Desired speed varies between 310 and 370 km/h with occasional nitro
      let aiMaxSpeed = 330 + (idx % 3) * 15;
      if (Math.random() < 0.008 && ai.nitroLevel > 30) {
        ai.nitroState = 'single';
      }
      if (ai.nitroState !== 'off') {
        aiMaxSpeed += 40;
        ai.nitroLevel -= 20 * delta;
        if (ai.nitroLevel <= 0) ai.nitroState = 'off';
      } else {
        ai.nitroLevel = Math.min(100, ai.nitroLevel + 5 * delta);
      }

      // Accelerate AI
      const speedMs = (aiMaxSpeed / 3.6);
      ai.speedKmh = THREE.MathUtils.damp(ai.speedKmh, aiMaxSpeed, 2, delta);

      // Advance along spline
      const currentDist = ai.progress * totalDist;
      const nextDist = (currentDist + (ai.speedKmh / 3.6) * delta) % totalDist;
      ai.progress = nextDist / totalDist;

      // Position from spline
      const pt = track.curve.getPointAt(ai.progress);
      const tan = track.curve.getTangentAt(ai.progress).normalize();
      const bino = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();

      ai.position.x = pt.x + bino.x * laneOffset;
      ai.position.y = pt.y;
      ai.position.z = pt.z + bino.z * laneOffset;

      ai.heading = Math.atan2(tan.x, tan.z);

      // Update lap
      if (ai.progress < 0.05 && currentDist > totalDist * 0.9) {
        ai.lap += 1;
      }
    });
  }

  private updateRacerProgress(racer: RacerState) {
    const currentPos = new THREE.Vector3(racer.position.x, racer.position.y, racer.position.z);
    // Find closest point on spline to track progress
    const points = this.track.points;
    let closestIdx = 0;
    let minDist = Infinity;

    for (let i = 0; i < points.length; i += 4) {
      const d = currentPos.distanceToSquared(points[i]);
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }

    const prevProgress = racer.progress;
    racer.progress = closestIdx / points.length;

    // Check lap completion
    if (prevProgress > 0.85 && racer.progress < 0.15) {
      racer.lapTimes.push(racer.currentLapTime);
      if (!racer.bestLapTime || racer.currentLapTime < racer.bestLapTime) {
        racer.bestLapTime = racer.currentLapTime;
      }
      racer.currentLapTime = 0;
      racer.lap += 1;
      soundManager.playCheckpoint();
    }
  }

  private updateRanks() {
    const allRacers = [this.playerState, ...this.aiStates];
    allRacers.sort((a, b) => {
      if (a.lap !== b.lap) return b.lap - a.lap;
      return b.progress - a.progress;
    });

    allRacers.forEach((r, rankIdx) => {
      r.rank = rankIdx + 1;
    });
  }

  private checkTrackFeatures(p: RacerState) {
    const pPos = new THREE.Vector3(p.position.x, p.position.y, p.position.z);

    // Boost pads check
    this.track.boostPads.forEach((pad) => {
      if (pPos.distanceTo(pad.position) < 5) {
        p.speedKmh = Math.min(430, p.speedKmh + 50);
        p.nitroLevel = Math.min(100, p.nitroLevel + 35);
        soundManager.playCheckpoint();
      }
    });

    // Jump ramps check
    this.track.ramps.forEach((ramp) => {
      if (!p.isAirborne && pPos.distanceTo(ramp.position) < 6 && p.speedKmh > 100) {
        p.isAirborne = true;
        p.velocity.y = 12 + (p.speedKmh / 40); // Launch velocity
        soundManager.playRampJump();
      }
    });
  }

  private getTrackGroundY(x: number, z: number): number {
    // Smooth ground interpolation from nearest spline segment
    const pos = new THREE.Vector3(x, 0, z);
    let nearestY = 0;
    let minDist = Infinity;
    for (let i = 0; i < this.track.points.length; i += 6) {
      const pt = this.track.points[i];
      const d = (pt.x - x) * (pt.x - x) + (pt.z - z) * (pt.z - z);
      if (d < minDist) {
        minDist = d;
        nearestY = pt.y;
      }
    }
    return nearestY;
  }

  private checkCollisions() {
    const p = this.playerState;
    const pPos = new THREE.Vector3(p.position.x, p.position.y, p.position.z);

    this.aiStates.forEach((ai) => {
      if (ai.wreckCooldown > 0) {
        ai.wreckCooldown -= 0.016;
        return;
      }
      const aiPos = new THREE.Vector3(ai.position.x, ai.position.y, ai.position.z);
      const dist = pPos.distanceTo(aiPos);

      if (dist < 3.2) {
        // Collision!
        if (p.nitroState === 'shockwave' || p.spinAngle > 0) {
          // Asphalt TAKEDOWN!
          ai.wreckCooldown = 2.5;
          ai.speedKmh = 40;
          soundManager.playCrash();
          if (this.onTakedown) this.onTakedown(ai.name);
          p.nitroLevel = 100; // Refill nitro on takedown
          this.spawnExplosionSparks(aiPos);
        } else {
          // Minor side bump / scrape
          p.speedKmh *= 0.94;
          ai.speedKmh *= 0.94;
          soundManager.playCrash();
        }
      }
    });
  }

  private spawnDriftParticles(p: RacerState, delta: number) {
    if (Math.random() > 0.4) return;
    const offset = (Math.random() - 0.5) * 1.5;
    const behindAngle = p.heading + Math.PI;

    this.particles.push({
      position: new THREE.Vector3(
        p.position.x + Math.sin(behindAngle) * 2 + offset,
        p.position.y + 0.2,
        p.position.z + Math.cos(behindAngle) * 2 + offset
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 2
      ),
      color: new THREE.Color(0xddeeff),
      size: 0.6,
      life: 0.5,
      maxLife: 0.5,
    });
  }

  public spawnExplosionSparks(pos: THREE.Vector3) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 25,
          Math.random() * 20 + 5,
          (Math.random() - 0.5) * 25
        ),
        color: new THREE.Color(Math.random() > 0.5 ? 0xff4400 : 0xffaa00),
        size: 0.8,
        life: 0.8,
        maxLife: 0.8,
      });
    }
  }

  private updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      p.position.addScaledVector(p.velocity, delta);
      p.size *= 0.96;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}
