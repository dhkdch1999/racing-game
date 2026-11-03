/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TRACKS } from './data/tracks';
import { CARS } from './data/cars';
import { TrackId, CarId, PaintFinish, CameraView, RaceResults, RacerState } from './types/game';
import { RacingEngine } from './game/racingEngine';
import { soundManager } from './audio/soundManager';
import { HUD } from './components/HUD';
import { TrackSelectModal } from './components/TrackSelectModal';
import { GarageModal } from './components/GarageModal';
import { PodiumModal } from './components/PodiumModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<RacingEngine | null>(null);

  // Game States
  const [currentTrackId, setCurrentTrackId] = useState<TrackId>('monza');
  const [currentCarId, setCurrentCarId] = useState<CarId>('phantom');
  const [bodyColor, setBodyColor] = useState<string>(CARS.phantom.bodyColor);
  const [finish, setFinish] = useState<PaintFinish>(CARS.phantom.finish);
  const [neonColor, setNeonColor] = useState<string>(CARS.phantom.neonColor);

  const [cameraMode, setCameraMode] = useState<CameraView>('chase');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bgmActive, setBgmActive] = useState<boolean>(true);

  const [notification, setNotification] = useState<string | null>(null);
  const notifTimerRef = useRef<number | null>(null);

  const [countdown, setCountdown] = useState<number | null>(3);
  const [isRacing, setIsRacing] = useState<boolean>(false);

  // Modals
  const [isTrackSelectOpen, setIsTrackSelectOpen] = useState<boolean>(false);
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [isPodiumOpen, setIsPodiumOpen] = useState<boolean>(false);
  const [raceResults, setRaceResults] = useState<RaceResults | null>(null);

  const [takedowns, setTakedowns] = useState<number>(0);
  const totalRaceTimeRef = useRef<number>(0);

  // Active HUD state (polled from physics for fluid 60fps HUD rendering)
  const [hudState, setHudState] = useState<{
    player: RacerState;
    ai: RacerState[];
  }>(() => ({
    player: {
      id: 'player',
      name: 'Player 1',
      isPlayer: true,
      carId: 'phantom' as CarId,
      color: CARS.phantom.bodyColor,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      speedKmh: 0,
      heading: 0,
      progress: 0,
      lap: 1,
      rank: 6,
      isDrifting: false,
      driftAngle: 0,
      nitroLevel: 60,
      nitroState: 'off' as const,
      isAirborne: false,
      spinAngle: 0,
      lapTimes: [] as number[],
      currentLapTime: 0,
      bestLapTime: null as number | null,
      driftScore: 0,
      wreckCooldown: 0,
    },
    ai: [] as RacerState[],
  }));

  const showNotification = useCallback((text: string) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotification(text);
    notifTimerRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 2200);
  }, []);

  // Initialize or Re-initialize 3D Racing Engine
  const initEngine = useCallback(() => {
    if (!canvasMountRef.current) return;

    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    const track = TRACKS[currentTrackId];
    const carConfig = CARS[currentCarId];

    const engine = new RacingEngine(
      canvasMountRef.current,
      track,
      carConfig,
      bodyColor,
      finish,
      neonColor
    );
    engine.cameraMode = cameraMode;
    engineRef.current = engine;

    // Callbacks
    engine.physics.onTakedown = (rivalName: string) => {
      setTakedowns((prev) => prev + 1);
      showNotification(`💥 TAKEDOWN! ${rivalName}`);
      engine.triggerShake(0.5);
    };

    engine.physics.onNitroStateChange = (state) => {
      if (state === 'shockwave') {
        showNotification('⚡ SHOCKWAVE NITRO OVERDRIVE!');
        engine.triggerShake(0.35);
      } else if (state === 'perfect') {
        showNotification('✨ PERFECT NITRO BOOST!');
      }
    };

    engine.physics.onAirtime = (duration) => {
      showNotification(`🚀 AIR TIME ${duration.toFixed(1)}s! +${Math.round(duration * 250)}`);
    };

    // Reset Race State
    setTakedowns(0);
    totalRaceTimeRef.current = 0;
    setIsPodiumOpen(false);
    setRaceResults(null);
    setCountdown(3);
    setIsRacing(false);
    engine.isRacing = false;

    // Start Countdown
    soundManager.startEngine();
    soundManager.playCountdown(false);

    let count = 3;
    const interval = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundManager.playCountdown(false);
      } else if (count === 0) {
        setCountdown(0);
        soundManager.playCountdown(true);
        setIsRacing(true);
        if (engineRef.current) {
          engineRef.current.isRacing = true;
        }
      } else {
        setCountdown(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrackId, currentCarId, bodyColor, finish, neonColor, cameraMode, showNotification]);

  // Mount effect
  useEffect(() => {
    initEngine();

    const handleResize = () => {
      if (engineRef.current && canvasMountRef.current) {
        engineRef.current.resize(
          canvasMountRef.current.clientWidth,
          canvasMountRef.current.clientHeight
        );
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (engineRef.current) {
        engineRef.current.dispose();
      }
      soundManager.stopEngine();
    };
  }, [initEngine]);

  // Sync HUD loop
  useEffect(() => {
    let animId = 0;
    const syncHud = () => {
      if (engineRef.current) {
        const p = engineRef.current.physics.playerState;
        const ai = engineRef.current.physics.aiStates;
        setHudState({
          player: { ...p },
          ai: ai.map((a) => ({ ...a })),
        });

        if (engineRef.current.isRacing) {
          totalRaceTimeRef.current += 0.016;

          // Check race finish
          const track = TRACKS[currentTrackId];
          if (p.lap > track.totalLaps && !isPodiumOpen) {
            engineRef.current.isRacing = false;
            setIsRacing(false);
            soundManager.playVictory();

            const allRacers = [p, ...ai];
            const sorted = [...allRacers].sort((a, b) => a.rank - b.rank);

            setRaceResults({
              trackId: currentTrackId,
              playerRank: p.rank,
              totalRacers: allRacers.length,
              totalTime: totalRaceTimeRef.current,
              bestLap: p.bestLapTime || p.currentLapTime,
              driftPoints: p.driftScore,
              takedowns,
              standings: sorted.map((r) => ({
                rank: r.rank,
                name: r.name,
                isPlayer: r.isPlayer,
                totalTime: totalRaceTimeRef.current + (r.rank - 1) * 1.8,
                bestLap: r.bestLapTime || 0,
              })),
            });
            setIsPodiumOpen(true);
          }
        }
      }
      animId = requestAnimationFrame(syncHud);
    };
    animId = requestAnimationFrame(syncHud);
    return () => cancelAnimationFrame(animId);
  }, [currentTrackId, isPodiumOpen, takedowns]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const input = engineRef.current.input;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          input.throttle = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          input.brake = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          input.steerLeft = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          input.steerRight = true;
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          engineRef.current.physics.handleNitroPress();
          break;
        case 'KeyX':
          input.handbrake = true;
          break;
        case 'KeyE':
          input.spin360 = true;
          break;
        case 'KeyC':
          cycleCamera();
          break;
        case 'KeyR':
          resetCar();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const input = engineRef.current.input;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          input.throttle = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          input.brake = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          input.steerLeft = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          input.steerRight = false;
          break;
        case 'KeyX':
          input.handbrake = false;
          break;
        case 'KeyE':
          input.spin360 = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const cycleCamera = () => {
    const modes: CameraView[] = ['chase', 'hood', 'bumper', 'cockpit', 'cinematic'];
    const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
    const next = modes[nextIdx];
    setCameraMode(next);
    if (engineRef.current) {
      engineRef.current.cameraMode = next;
    }
    showNotification(`카메라 뷰: ${next.toUpperCase()}`);
  };

  const resetCar = () => {
    if (!engineRef.current) return;
    const p = engineRef.current.physics.playerState;
    const track = TRACKS[currentTrackId];
    // Find closest point or start
    const pt = engineRef.current.physics.track.points[0];
    p.position.x = pt.x;
    p.position.y = pt.y;
    p.position.z = pt.z;
    p.speedKmh = 0;
    p.driftAngle = 0;
    p.isAirborne = false;
    showNotification('차량 위치 복구 완료!');
  };

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const toggleBGM = () => {
    const active = soundManager.toggleBGM();
    setBgmActive(active);
  };

  const handleNitroPress = () => {
    if (engineRef.current) {
      engineRef.current.physics.handleNitroPress();
    }
  };

  const handleControlChange = (
    control: 'throttle' | 'brake' | 'steerLeft' | 'steerRight' | 'handbrake',
    active: boolean
  ) => {
    if (engineRef.current) {
      engineRef.current.input[control] = active;
    }
  };

  const handleNextTrack = () => {
    const trackKeys = Object.keys(TRACKS) as TrackId[];
    const nextIdx = (trackKeys.indexOf(currentTrackId) + 1) % trackKeys.length;
    setCurrentTrackId(trackKeys[nextIdx]);
    setIsPodiumOpen(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. 3D WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* 2. Interactive Racing HUD */}
      {engineRef.current && (
        <HUD
          track={TRACKS[currentTrackId]}
          builtTrack={engineRef.current.physics.track}
          playerState={hudState.player}
          aiStates={hudState.ai}
          cameraMode={cameraMode}
          isMuted={isMuted}
          bgmActive={bgmActive}
          notification={notification}
          countdown={countdown}
          onNitroPress={handleNitroPress}
          onCameraChange={cycleCamera}
          onToggleMute={toggleMute}
          onToggleBGM={toggleBGM}
          onResetCar={resetCar}
          onOpenTrackSelect={() => setIsTrackSelectOpen(true)}
          onOpenGarage={() => setIsGarageOpen(true)}
          onControlChange={handleControlChange}
        />
      )}

      {/* 3. Track Selection Modal */}
      <TrackSelectModal
        currentTrackId={currentTrackId}
        isOpen={isTrackSelectOpen}
        onClose={() => setIsTrackSelectOpen(false)}
        onSelectTrack={(id) => setCurrentTrackId(id)}
      />

      {/* 4. Garage & Customization Modal */}
      <GarageModal
        currentCarId={currentCarId}
        bodyColor={bodyColor}
        finish={finish}
        neonColor={neonColor}
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        onSelectCar={(id) => {
          setCurrentCarId(id);
          setBodyColor(CARS[id].bodyColor);
          setFinish(CARS[id].finish);
          setNeonColor(CARS[id].neonColor);
          if (engineRef.current) {
            engineRef.current.updateCarAppearance(CARS[id].bodyColor, CARS[id].finish, CARS[id].neonColor);
          }
        }}
        onChangeColor={(hex) => {
          setBodyColor(hex);
          if (engineRef.current) {
            engineRef.current.updateCarAppearance(hex, finish, neonColor);
          }
        }}
        onChangeFinish={(f) => {
          setFinish(f);
          if (engineRef.current) {
            engineRef.current.updateCarAppearance(bodyColor, f, neonColor);
          }
        }}
        onChangeNeon={(hex) => {
          setNeonColor(hex);
          if (engineRef.current) {
            engineRef.current.updateCarAppearance(bodyColor, finish, hex);
          }
        }}
      />

      {/* 5. Podium Victory Modal */}
      <PodiumModal
        results={raceResults}
        isOpen={isPodiumOpen}
        onRestart={initEngine}
        onNextTrack={handleNextTrack}
      />
    </div>
  );
}
