import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RaceResults } from '../types/game';
import { Trophy, Award, Flame, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import { TRACKS } from '../data/tracks';

interface PodiumModalProps {
  results: RaceResults | null;
  isOpen: boolean;
  onRestart: () => void;
  onNextTrack: () => void;
}

export const PodiumModal: React.FC<PodiumModalProps> = ({
  results,
  isOpen,
  onRestart,
  onNextTrack,
}) => {
  useEffect(() => {
    if (isOpen && results) {
      if (results.playerRank <= 3) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  }, [isOpen, results]);

  if (!isOpen || !results) return null;

  const track = TRACKS[results.trackId];
  const isPodium = results.playerRank <= 3;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Trophy / Header */}
        <div className="relative mb-2">
          {isPodium ? (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.5)] border-4 border-amber-300">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-600">
              <Award className="w-10 h-10 text-slate-400" />
            </div>
          )}
        </div>

        <div className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
          {track?.name} GRAND PRIX FINISH
        </div>

        <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mt-1">
          {results.playerRank === 1
            ? '🏆 챔피언! 그랑프리 우승!'
            : isPodium
            ? `포디움 입성! (${results.playerRank}위)`
            : `레이스 완주 (${results.playerRank}위)`}
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-6">
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-bold uppercase">순위</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {results.playerRank}위
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-bold uppercase">총 레이스 기록</div>
            <div className="text-lg font-mono font-black text-white mt-0.5">
              {formatTime(results.totalTime)}
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> 드리프트 점수
            </div>
            <div className="text-lg font-mono font-black text-rose-400 mt-0.5">
              +{results.driftPoints.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> 테이크다운
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-0.5">
              {results.takedowns} 회
            </div>
          </div>
        </div>

        {/* Standings Table */}
        <div className="w-full mt-6 bg-slate-850/80 border border-slate-800 rounded-2xl overflow-hidden text-left">
          <div className="px-4 py-2 bg-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>최종 순위표</span>
            <span>최고 랩타임</span>
          </div>
          <div className="divide-y divide-slate-800/60 text-xs">
            {results.standings.map((s) => (
              <div
                key={s.name}
                className={`px-4 py-2.5 flex items-center justify-between ${
                  s.isPlayer ? 'bg-cyan-950/40 font-bold text-cyan-300' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold ${s.rank <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                    #{s.rank}
                  </span>
                  <span>{s.name} {s.isPlayer && '(YOU)'}</span>
                </div>
                <div className="font-mono text-slate-400">
                  {s.bestLap > 0 ? formatTime(s.bestLap) : '--:--.--'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 w-full justify-center">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> 다시 레이스
          </button>
          <button
            onClick={onNextTrack}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>다음 서킷으로</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
