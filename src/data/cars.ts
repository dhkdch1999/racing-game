import { CarConfig } from '../types/game';

export const CARS: Record<string, CarConfig> = {
  phantom: {
    id: 'phantom',
    name: 'Apex Phantom GT',
    category: 'Class S • 하이퍼카',
    tagline: '직선 주로의 지배자! 최고 속도 410km/h를 돌파하는 괴물',
    topSpeed: 385,
    acceleration: 2.1,
    handling: 7.8,
    driftControl: 8.2,
    nitroBoost: 9.6,
    nitroEfficiency: 8.5,
    bodyColor: '#e11d48', // Crimson Red
    accentColor: '#111827',
    neonColor: '#f43f5e',
    finish: 'metallic',
  },
  vortex: {
    id: 'vortex',
    name: 'Vortex GT-R Drift',
    category: 'Class A • 드리프트 스페셜',
    tagline: '코너링의 마술사! 드리프트 시 니트로가 초고속 충전',
    topSpeed: 360,
    acceleration: 2.3,
    handling: 9.7,
    driftControl: 9.8,
    nitroBoost: 8.8,
    nitroEfficiency: 9.5,
    bodyColor: '#0ea5e9', // Sky Blue
    accentColor: '#0f172a',
    neonColor: '#38bdf8',
    finish: 'gloss',
  },
  scuderia: {
    id: 'scuderia',
    name: 'Scuderia F1-X Prototype',
    category: 'Class S+ • 포뮬러 하이브리드',
    tagline: 'F1 다운포스와 하이퍼카의 만남. 초극강 가속력 & 접지력',
    topSpeed: 375,
    acceleration: 1.8,
    handling: 9.5,
    driftControl: 8.6,
    nitroBoost: 9.8,
    nitroEfficiency: 8.9,
    bodyColor: '#f59e0b', // Cyber Gold / Papaya Orange
    accentColor: '#18181b',
    neonColor: '#fbbf24',
    finish: 'carbon',
  },
  nemesis: {
    id: 'nemesis',
    name: 'Cyber Nemesis EV',
    category: 'Class Hyper • 쇼크웨이브 마스터',
    tagline: '쇼크웨이브 니트로 발동 시 충돌 무적 및 광속 질주',
    topSpeed: 370,
    acceleration: 1.9,
    handling: 8.8,
    driftControl: 8.9,
    nitroBoost: 10.0,
    nitroEfficiency: 9.2,
    bodyColor: '#8b5cf6', // Electric Purple
    accentColor: '#09090b',
    neonColor: '#c084fc',
    finish: 'matte',
  },
};

export const COLOR_PALETTE = [
  { name: '로쏘 코르사 (Rosso Corsa)', hex: '#e11d48', neon: '#fb7185' },
  { name: '일렉트릭 사이언 (Cyan Neon)', hex: '#06b6d4', neon: '#67e8f9' },
  { name: '파파야 레이스 (Papaya Orange)', hex: '#f97316', neon: '#fdba74' },
  { name: '스텔스 매트 블랙 (Stealth Black)', hex: '#1e293b', neon: '#38bdf8' },
  { name: '바이올렛 쇼크 (Violet Shock)', hex: '#7c3aed', neon: '#c084fc' },
  { name: '하이퍼 에메랄드 (Hyper Emerald)', hex: '#10b981', neon: '#6ee7b7' },
  { name: '골든 엠페러 (Golden Luxury)', hex: '#eab308', neon: '#fde047' },
  { name: '퓨어 티타늄 (Pure Titanium)', hex: '#94a3b8', neon: '#cbd5e1' },
];

export const AI_NAMES = [
  'Max V. (챔피언)',
  'Lewis H. (레전드)',
  'Charles L. (페라리스타)',
  'Lando N. (스피드스터)',
  'Fernando A. (베테랑)',
  'Oscar P. (루키 몬스터)',
];
