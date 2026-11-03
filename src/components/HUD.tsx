import React, { useEffect, useState } from 'react';
import { RacerState, CameraView, F1Track } from '../types/game';
import { BuiltTrack } from '../game/trackBuilder';
import { Minimap } from './Minimap';
import {
  Flame,
  Gauge,
  Camera,
  Volume2,
  VolumeX,
  RotateCcw,
  Flag,
  Award,
  Zap,
} from 'lucide-react';

interface HUDProps {
  track: F1Track;
  builtTrack: BuiltTrack;
  playerState: RacerState;
  aiStates: RacerState[];
  cameraMode: CameraView;
  isMuted: boolean;
  bgmActive: boolean;
  notification: string | null;
  countdown: number | null; // 3, 2, 1, 0 (GO!)
  onNitroPress: () => void;
  onCameraChange: () => void;
  onToggleMute: () => void;
  onToggleBGM: () => void;
  onResetCar: () => void;
  onOpenTrackSelect: () => void;
  onOpenGarage: () => void;
  onControlChange: (control: 'throttle' | 'brake' | 'steerLeft' | 'steerRight' | 'handbrake', active: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  track,
  builtTrack,
  playerState,
  aiStates,
  cameraMode,
  isMuted,
  notification,
  countdown,
  onNitroPress,
  onCameraChange,
  onToggleMute,
  onResetCar,
  onOpenTrackSelect,
  onOpenGarage,
  onControlChange,
}) => {
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setTouchDevice(true);
    }
  }, []);

  const speedKmh = Math.round(playerState.speedKmh);
  const gear = speedKmh < 10 ? 1 : Math.min(8, Math.floor(speedKmh / 45) + 1);
  const nitro = Math.round(playerState.nitroLevel);

  // Nitro state color
  let nitroBarBg = 'bg-cyan-500';
  let nitroGlow = 'shadow-cyan-500/50';
  let nitroStateLabel = 'NORMAL NITRO';
  if (playerState.nitroState === 'perfect') {
    nitroBarBg = 'bg-gradient-to-r from-fuchsia-500 to-purple-600';
    nitroGlow = 'shadow-fuchsia-500/80';
    nitroStateLabel = 'PERFECT NITRO! (1.45X)';
  } else if (playerState.nitroState === 'shockwave') {
    nitroBarBg = 'bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 animate-pulse';
    nitroGlow = 'shadow-red-500/90';
    nitroStateLabel = 'SHOCKWAVE OVERDRIVE! (1.75X)';
  }

  // Format lap time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
  };

  // Rank suffix
  const getRankSuffix = (rank: number) => {
    if (rank === 1) return '1ST';
    if (rank === 2) return '2ND';
    if (rank === 3) return '3RD';
    return `${rank}TH`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20 font-sans text-white">
      {/* 1. TOP HEADER BAR */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        {/* Left: Position & Lap Badge */}
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <div className="flex items-baseline gap-1 px-4 py-2 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border border-amber-500/40 rounded-xl shadow-xl backdrop-blur-md">
            <span className="text-3xl font-black italic tracking-tighter text-amber-400">
              {getRankSuffix(playerState.rank)}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 6</span>
          </div>

          {/* Lap info */}
          <div className="px-3 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl shadow-lg backdrop-blur-md flex flex-col">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Flag className="w-3 h-3 text-cyan-400" /> LAP
            </div>
            <div className="text-lg font-black tracking-tight text-white">
              {Math.min(playerState.lap, track.totalLaps)} / {track.totalLaps}
            </div>
          </div>

          {/* Time splits */}
          <div className="px-3 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl shadow-lg backdrop-blur-md hidden sm:flex flex-col">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TIME</div>
            <div className="text-base font-mono font-bold text-cyan-300">
              {formatTime(playerState.currentLapTime)}
            </div>
            {playerState.bestLapTime && (
              <div className="text-[10px] text-emerald-400 font-mono">
                BEST: {formatTime(playerState.bestLapTime)}
              </div>
            )}
          </div>
        </div>

        {/* Center: Track Name & Quick Menu Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTrackSelect}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-bold text-slate-200 transition-all shadow-md active:scale-95"
            title="F1 서킷 변경"
          >
            <span>{track.flagEmoji}</span>
            <span className="hidden md:inline">{track.name}</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 border border-cyan-500/30">
              서킷
            </span>
          </button>

          <button
            onClick={onOpenGarage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-bold text-amber-300 transition-all shadow-md active:scale-95"
            title="차고 및 슈퍼카 튜닝"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">차고</span>
          </button>

          <button
            onClick={onCameraChange}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 transition-all shadow-md active:scale-95"
            title={`카메라 뷰 (${cameraMode}) [C키]`}
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 transition-all shadow-md active:scale-95"
            title="사운드 온/오프 [M키]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onResetCar}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 transition-all shadow-md active:scale-95"
            title="차량 위치 리셋 [R키]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: GPS Radar Minimap */}
        <div className="hidden sm:block">
          <Minimap track={builtTrack} playerState={playerState} aiStates={aiStates} />
        </div>
      </div>

      {/* 2. CENTER NOTIFICATIONS & COUNTDOWN */}
      <div className="flex flex-col items-center justify-center my-auto">
        {/* Countdown */}
        {countdown !== null && (
          <div className="text-center animate-bounce">
            <div className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-rose-500 to-red-600 drop-shadow-[0_10px_20px_rgba(239,68,68,0.8)]">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-200 mt-2 bg-slate-900/80 px-4 py-1 rounded-full border border-amber-500/40">
              {countdown === 0 ? 'PEDAL TO THE METAL!' : 'ENGINES READY'}
            </div>
          </div>
        )}

        {/* Dynamic Action Notification */}
        {notification && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-red-600/90 via-fuchsia-600/90 to-cyan-600/90 border border-white/40 rounded-2xl shadow-2xl backdrop-blur-md transform animate-pulse scale-105">
            <div className="text-xl md:text-2xl font-black italic tracking-wide text-white drop-shadow-md text-center">
              {notification}
            </div>
          </div>
        )}

        {/* Drift Score Realtime Floating Banner */}
        {playerState.isDrifting && (
          <div className="mt-4 px-4 py-1.5 bg-amber-500/80 border border-amber-300/50 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2">
            <Flame className="w-4 h-4 text-white animate-spin" />
            <span className="text-sm font-black italic tracking-wider text-white">
              DRIFT SCORE +{playerState.driftScore}
            </span>
          </div>
        )}
      </div>

      {/* 3. BOTTOM GAUGES & CONTROLS */}
      <div className="w-full flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-auto">
        {/* Bottom Left: Controls Legend (Desktop) or Steering (Mobile) */}
        <div className="flex flex-col gap-2">
          {!touchDevice ? (
            <div className="hidden lg:flex flex-col gap-1 px-3 py-2 bg-slate-900/70 border border-slate-800 rounded-xl text-[11px] text-slate-300 backdrop-blur-sm">
              <div className="font-bold text-slate-400 mb-0.5 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" /> 조작법 가이드
              </div>
              <div className="flex gap-3">
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono">W / ↑</kbd> 가속</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono">S / ↓</kbd> 감속/후진</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono">A / D</kbd> 핸들</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono">Shift / Space</kbd> 니트로</span>
              </div>
            </div>
          ) : (
            /* Mobile Touch Steer Controls */
            <div className="flex items-center gap-3">
              <button
                onTouchStart={() => onControlChange('steerLeft', true)}
                onTouchEnd={() => onControlChange('steerLeft', false)}
                className="w-16 h-16 bg-slate-800/80 active:bg-cyan-600/80 border border-slate-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl active:scale-95"
              >
                ◀
              </button>
              <button
                onTouchStart={() => onControlChange('steerRight', true)}
                onTouchEnd={() => onControlChange('steerRight', false)}
                className="w-16 h-16 bg-slate-800/80 active:bg-cyan-600/80 border border-slate-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl active:scale-95"
              >
                ▶
              </button>
              <button
                onTouchStart={() => onControlChange('handbrake', true)}
                onTouchEnd={() => onControlChange('handbrake', false)}
                className="w-16 h-16 bg-amber-900/70 active:bg-amber-600 border border-amber-600 rounded-2xl flex items-center justify-center text-xs font-bold shadow-xl active:scale-95 text-amber-200"
              >
                DRIFT
              </button>
            </div>
          )}
        </div>

        {/* Center Bottom: Asphalt NITRO GAUGE */}
        <div className="flex-1 max-w-md w-full mx-auto flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase mb-1">
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> {nitroStateLabel}
            </span>
            <span className="font-mono text-cyan-300">{nitro}%</span>
          </div>

          {/* Nitro Segmented Bar */}
          <div
            onClick={onNitroPress}
            className="w-full h-7 bg-slate-900/90 border-2 border-slate-700/80 rounded-full p-1 relative cursor-pointer overflow-hidden shadow-2xl backdrop-blur-md group hover:border-cyan-400 transition-colors"
          >
            {/* Perfect Nitro Pulse Target Zone Marker */}
            <div className="absolute top-1 bottom-1 left-[65%] w-[20%] bg-purple-500/20 border-x border-purple-400/60 pointer-events-none z-10 flex items-center justify-center">
              <span className="text-[8px] font-bold text-purple-300 uppercase tracking-tighter opacity-80">
                PERFECT ZONE
              </span>
            </div>

            {/* The fill bar */}
            <div
              className={`h-full rounded-full transition-all duration-75 ${nitroBarBg} ${nitroGlow} shadow-lg`}
              style={{ width: `${nitro}%` }}
            />
          </div>

          <div className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-2">
            <span>[SPACE / SHIFT] 키 또는 바를 터치하여 니트로 점화</span>
            {nitro >= 95 && (
              <span className="text-red-400 font-bold animate-pulse">
                ★ 쇼크웨이브 준비완료!
              </span>
            )}
          </div>
        </div>

        {/* Bottom Right: High-tech Speedometer & Tachometer */}
        <div className="flex items-center gap-3">
          {/* Speedometer Cluster */}
          <div className="relative px-6 py-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col items-center min-w-[170px]">
            {/* Gear indicator */}
            <div className="absolute top-2 left-3 flex items-baseline gap-0.5 text-xs font-mono font-bold text-slate-400">
              <span>GEAR</span>
              <span className="text-base text-amber-400 font-black">{gear}</span>
            </div>

            {/* Huge Speed Number */}
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                {speedKmh}
              </span>
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                KM/H
              </span>
            </div>

            {/* RPM Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-75"
                style={{ width: `${Math.min(100, (speedKmh / 380) * 100)}%` }}
              />
            </div>
          </div>

          {/* Big Nitro Button (for mobile / fast click) */}
          <button
            onClick={onNitroPress}
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black italic shadow-2xl transition-all active:scale-95 border-2 ${
              playerState.nitroState !== 'off'
                ? 'bg-gradient-to-br from-red-600 to-amber-500 border-amber-300 animate-pulse text-white'
                : nitro > 20
                ? 'bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Flame className="w-7 h-7 mb-0.5" />
            <span className="text-xs tracking-wider">NITRO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
