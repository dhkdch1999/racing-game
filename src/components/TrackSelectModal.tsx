import React from 'react';
import { TRACKS } from '../data/tracks';
import { TrackId } from '../types/game';
import { Flag, X, ArrowRight, Gauge, Check } from 'lucide-react';

interface TrackSelectModalProps {
  currentTrackId: TrackId;
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (trackId: TrackId) => void;
}

export const TrackSelectModal: React.FC<TrackSelectModalProps> = ({
  currentTrackId,
  isOpen,
  onClose,
  onSelectTrack,
}) => {
  if (!isOpen) return null;

  const trackList = Object.values(TRACKS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
              FORMULA 1 GRAND PRIX CIRCUITS
            </div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tight text-white mt-0.5">
              F1 공식 서킷 선택
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {trackList.map((t) => {
            const isSelected = t.id === currentTrackId;
            return (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTrack(t.id);
                  onClose();
                }}
                className={`relative group p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <div>
                  {/* Flag & Circuit Name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{t.flagEmoji}</span>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                          {t.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-400">
                          {t.country} ({t.countryCode}) • {t.circuitLength}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-full">
                        <Check className="w-3 h-3" /> 선택됨
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Key Features Bends */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {t.keyFeatures.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-amber-300/90 rounded border border-amber-500/20"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700/50 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>최고 랩타임: {t.recordLap}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>레이스 시작</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
