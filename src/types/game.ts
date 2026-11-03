export type TrackId = 'monza' | 'spa' | 'monaco' | 'suzuka' | 'silverstone';

export type CarId = 'phantom' | 'vortex' | 'scuderia' | 'nemesis';

export type PaintFinish = 'gloss' | 'matte' | 'metallic' | 'carbon';

export interface CarConfig {
  id: CarId;
  name: string;
  category: string;
  tagline: string;
  topSpeed: number; // km/h (base, e.g. 340)
  acceleration: number; // 0-100 in sec (e.g. 2.1)
  handling: number; // 1-10
  driftControl: number; // 1-10
  nitroBoost: number; // 1-10
  nitroEfficiency: number; // how long nitro lasts
  bodyColor: string;
  accentColor: string;
  neonColor: string;
  finish: PaintFinish;
}

export interface TrackSector {
  name: string;
  percentage: number;
}

export interface F1Track {
  id: TrackId;
  name: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  circuitLength: string; // e.g. "5.793 km"
  recordLap: string; // e.g. "1:21.046 (Barrichello)"
  description: string;
  keyFeatures: string[];
  totalLaps: number;
  width: number;
  ambientTheme: 'park' | 'forest_hills' | 'city_harbor' | 'figure8' | 'historic_airfield';
  skyColor: number;
  groundColor: number;
  fogColor: number;
  splinePoints: [number, number, number][]; // 3D coordinates
  sectors: TrackSector[];
  ramps?: number[]; // index along spline where ramps exist
  boostPads?: number[]; // index where boost pads exist
}

export interface RacerState {
  id: string;
  name: string;
  isPlayer: boolean;
  carId: CarId;
  color: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  speedKmh: number;
  heading: number; // angle in radians
  progress: number; // 0 to 1 around track
  lap: number;
  rank: number;
  isDrifting: boolean;
  driftAngle: number;
  nitroLevel: number; // 0 to 100
  nitroState: 'off' | 'single' | 'perfect' | 'shockwave';
  isAirborne: boolean;
  spinAngle: number;
  lapTimes: number[];
  currentLapTime: number;
  bestLapTime: number | null;
  driftScore: number;
  wreckCooldown: number;
}

export type CameraView = 'chase' | 'hood' | 'bumper' | 'cockpit' | 'cinematic';

export interface RaceResults {
  trackId: TrackId;
  playerRank: number;
  totalRacers: number;
  totalTime: number;
  bestLap: number;
  driftPoints: number;
  takedowns: number;
  standings: {
    rank: number;
    name: string;
    isPlayer: boolean;
    totalTime: number;
    bestLap: number;
  }[];
}
