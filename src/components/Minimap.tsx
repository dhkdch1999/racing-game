import React, { useEffect, useRef } from 'react';
import { BuiltTrack } from '../game/trackBuilder';
import { RacerState } from '../types/game';

interface MinimapProps {
  track: BuiltTrack;
  playerState: RacerState;
  aiStates: RacerState[];
}

export const Minimap: React.FC<MinimapProps> = ({ track, playerState, aiStates }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track.points || track.points.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    track.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    const padding = 20;
    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const scale = Math.min((w - padding * 2) / rangeX, (h - padding * 2) / rangeZ);

    const toCanvasX = (x: number) => padding + (x - minX) * scale;
    const toCanvasY = (z: number) => padding + (z - minZ) * scale;

    // Draw track path
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < track.points.length; i++) {
      const p = track.points[i];
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.z);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.closePath();
    ctx.stroke();

    // Start line marker
    const startPt = track.points[0];
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(toCanvasX(startPt.x) - 4, toCanvasY(startPt.z) - 4, 8, 8);

    // Draw AI racers (Red / Orange dots)
    aiStates.forEach((ai) => {
      const cx = toCanvasX(ai.position.x);
      const cy = toCanvasY(ai.position.z);
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    });

    // Draw Player marker (Cyan pulsing arrow)
    const px = toCanvasX(playerState.position.x);
    const py = toCanvasY(playerState.position.z);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-playerState.heading + Math.PI);

    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

  }, [track, playerState, aiStates]);

  return (
    <div className="relative p-2 bg-slate-900/80 border border-slate-700/60 rounded-xl backdrop-blur-md shadow-2xl">
      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center justify-between">
        <span>GPS RADAR</span>
        <span className="text-cyan-400 font-mono">LIVE</span>
      </div>
      <canvas ref={canvasRef} width={130} height={130} className="rounded-lg" />
    </div>
  );
};
