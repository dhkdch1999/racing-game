import React from 'react';
import { CARS, COLOR_PALETTE } from '../data/cars';
import { CarId, PaintFinish } from '../types/game';
import { X, Zap, Award, Sparkles, Check } from 'lucide-react';

interface GarageModalProps {
  currentCarId: CarId;
  bodyColor: string;
  finish: PaintFinish;
  neonColor: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCar: (carId: CarId) => void;
  onChangeColor: (hex: string) => void;
  onChangeFinish: (finish: PaintFinish) => void;
  onChangeNeon: (hex: string) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  currentCarId,
  bodyColor,
  finish,
  neonColor,
  isOpen,
  onClose,
  onSelectCar,
  onChangeColor,
  onChangeFinish,
  onChangeNeon,
}) => {
  if (!isOpen) return null;

  const currentCar = CARS[currentCarId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              HYPERCAR FLEET & CUSTOMIZATION
            </div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tight text-white mt-0.5">
              차고 & 튜닝 숍
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Car Selection Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {Object.values(CARS).map((car) => {
            const isSelected = car.id === currentCarId;
            return (
              <div
                key={car.id}
                onClick={() => onSelectCar(car.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400/90">{car.category}</div>
                  <h4 className="text-sm font-black text-white mt-0.5">{car.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/40"
                      style={{ backgroundColor: car.bodyColor }}
                    />
                    <span className="text-[11px] font-mono font-bold text-cyan-300">
                      {car.topSpeed} km/h
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-amber-300">
                    <Check className="w-3 h-3" /> 선택됨
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 2. Selected Car Specs Radar */}
        <div className="mt-6 p-5 bg-slate-800/60 border border-slate-700/70 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-black text-white">{currentCar.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {currentCar.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">{currentCar.tagline}</p>

            {/* Performance Stat Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>최고 속도</span>
                  <span className="font-mono text-white font-bold">{currentCar.topSpeed} km/h</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${(currentCar.topSpeed / 420) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>제로백 (0-100)</span>
                  <span className="font-mono text-white font-bold">{currentCar.acceleration} 초</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${((3.0 - currentCar.acceleration) / 1.5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>코너링 핸들링</span>
                  <span className="font-mono text-white font-bold">{currentCar.handling} / 10</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400"
                    style={{ width: `${currentCar.handling * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>니트로 부스트 화력</span>
                  <span className="font-mono text-white font-bold">{currentCar.nitroBoost} / 10</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${currentCar.nitroBoost * 10}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Paint, Finish & Neon Customization */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Finish selector */}
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 도장 마감 (Finish)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(['metallic', 'gloss', 'matte', 'carbon'] as PaintFinish[]).map((f) => (
                <button
                  key={f}
                  onClick={() => onChangeFinish(f)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    finish === f
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  {f === 'metallic' && '메탈릭 (Metallic)'}
                  {f === 'gloss' && '글로스 (Gloss)'}
                  {f === 'matte' && '매트 (Matte)'}
                  {f === 'carbon' && '카본 (Carbon)'}
                </button>
              ))}
            </div>
          </div>

          {/* Color palette */}
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-3 flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" /> 바디 컬러
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    onChangeColor(c.hex);
                    onChangeNeon(c.neon);
                  }}
                  className={`w-10 h-10 rounded-xl border-2 transition-all active:scale-90 flex items-center justify-center ${
                    bodyColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {bodyColor === c.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Neon Underglow color */}
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 네온 언더글로우
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.neon}
                  onClick={() => onChangeNeon(c.neon)}
                  className={`w-10 h-10 rounded-xl border-2 transition-all active:scale-90 flex items-center justify-center ${
                    neonColor === c.neon ? 'border-white scale-110 shadow-[0_0_15px_currentColor]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.neon }}
                  title={`네온: ${c.name}`}
                >
                  {neonColor === c.neon && <Check className="w-4 h-4 text-slate-900 font-bold" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            서킷으로 복귀
          </button>
        </div>
      </div>
    </div>
  );
};
