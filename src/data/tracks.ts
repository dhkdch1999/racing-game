import { F1Track } from '../types/game';

export const TRACKS: Record<string, F1Track> = {
  monza: {
    id: 'monza',
    name: '몬차 국립 서킷 (Monza)',
    country: '이탈리아',
    countryCode: 'ITA',
    flagEmoji: '🇮🇹',
    circuitLength: '5.793 km',
    recordLap: '1:21.046 (R. Barrichello)',
    description: '스피드의 신전(Temple of Speed). 초고속 직선주로와 아스카리, 파라볼리카 코너가 특징인 최고속도 특화 서킷입니다.',
    keyFeatures: ['레티필로 시케인', '쿠르바 그란데', '아스카리 시케인', '파라볼리카(알보레토)'],
    totalLaps: 2,
    width: 17,
    ambientTheme: 'park',
    skyColor: 0x88ccee,
    groundColor: 0x2b4a28,
    fogColor: 0xa0d4f5,
    sectors: [
      { name: '섹터 1 (레티필로/쿠르바 그란데)', percentage: 0.33 },
      { name: '섹터 2 (레스모 & 아스카리)', percentage: 0.68 },
      { name: '섹터 3 (파라볼리카 & 홈 스트레이트)', percentage: 1.0 },
    ],
    // 3D coordinates (X, Y elevation, Z) scaled for optimal racing dynamics
    splinePoints: [
      [0, 0, 0],         // Start/Finish straight
      [0, 0, 180],       // Towards Rettifilo
      [0, 0, 260],
      [15, 0, 310],      // Rettifilo chicane right
      [-10, 0, 360],     // Rettifilo left exit
      [-15, 0, 420],
      [20, 2, 540],      // Curva Grande entry (slight rise)
      [80, 2, 660],      // Curva Grande sweeping right
      [160, 2, 730],
      [220, 0, 750],
      [225, 0, 680],     // Roggia chicane
      [215, 0, 600],
      [240, -1, 520],    // Curva di Lesmo 1
      [310, -2, 450],
      [340, -2, 360],    // Curva di Lesmo 2
      [320, -1, 240],    // Serraglio straight
      [290, 0, 100],
      [260, 0, -60],
      [220, 0, -140],    // Variante Ascari entry
      [180, 1, -220],    // Ascari mid
      [120, 1, -260],    // Ascari exit
      [40, 0, -320],     // Back straight to Parabolica
      [-80, 0, -380],
      [-180, 0, -370],
      [-260, 0, -290],   // Parabolica (Curva Alboreto) wide arc
      [-270, 0, -160],
      [-220, 0, -60],
      [-140, 0, 0],      // Parabolica exit onto main straight
      [-50, 0, 0],
    ],
    ramps: [7, 19],
    boostPads: [1, 15, 23],
  },

  spa: {
    id: 'spa',
    name: '스파-프랑코샹 (Spa-Francorchamps)',
    country: '벨기에',
    countryCode: 'BEL',
    flagEmoji: '🇧🇪',
    circuitLength: '7.004 km',
    recordLap: '1:46.286 (V. Bottas)',
    description: '아르덴 숲의 롤러코스터. 전설적인 오 루즈(Eau Rouge)의 극적인 업힐과 케멜 스트레이트, 푸옹 고속 코너가 펼쳐집니다.',
    keyFeatures: ['라 수르스 헤어핀', '오 루즈 & 라이디용 업힐', '케멜 스트레이트', '푸옹(Pouhon) 더블 레프트'],
    totalLaps: 2,
    width: 18,
    ambientTheme: 'forest_hills',
    skyColor: 0x77b5fe,
    groundColor: 0x1d3619,
    fogColor: 0x93bfe3,
    sectors: [
      { name: '섹터 1 (라 수르스 & 오 루즈)', percentage: 0.35 },
      { name: '섹터 2 (케멜 & 푸옹)', percentage: 0.72 },
      { name: '섹터 3 (블랑시몽 & 버스 스톱)', percentage: 1.0 },
    ],
    splinePoints: [
      [0, 0, 0],         // Start line
      [0, 0, 100],       // Run to La Source
      [40, 0, 160],      // La Source hairpin right
      [80, -2, 130],     // Exit downhill
      [110, -8, 50],     // Downhill drop to Eau Rouge dip
      [125, -12, -40],   // Lowest point at Eau Rouge creek
      [115, 0, -120],    // Rapid steep climb into Raidillon
      [100, 24, -200],   // Cresting Raidillon blind summit!
      [70, 28, -320],    // Kemmel Straight (high elevation plateau)
      [40, 26, -450],
      [10, 24, -560],
      [-40, 22, -630],   // Les Combes chicane
      [-110, 20, -640],
      [-160, 16, -580],  // Malmedy
      [-220, 10, -500],  // Rivage downhill hairpin
      [-280, 5, -420],
      [-320, 0, -320],
      [-360, -2, -200],  // Pouhon double-apex high-speed left
      [-350, -4, -90],
      [-280, -3, 0],     // Fagnes chicane
      [-220, -2, 80],
      [-170, 0, 160],    // Stavelot curve
      [-120, 0, 230],    // Blanchimont flat-out left
      [-60, 0, 270],
      [-20, 0, 210],     // Bus Stop chicane tight flick
      [-5, 0, 130],
      [-2, 0, 50],       // Main straight back to start
    ],
    ramps: [7, 18],
    boostPads: [3, 8, 22],
  },

  monaco: {
    id: 'monaco',
    name: '모나코 서킷 (Circuit de Monaco)',
    country: '모나코',
    countryCode: 'MCO',
    flagEmoji: '🇲🇨',
    circuitLength: '3.337 km',
    recordLap: '1:12.909 (L. Hamilton)',
    description: '몬테카를로의 화려한 도심과 요트 항구를 질주하는 서킷. 좁은 시가지와 유명한 해저 터널 고속 구간이 백미입니다.',
    keyFeatures: ['생트 데보트', '카지노 광장', '그랜드 호텔 헤어핀', '요트 항만 터널'],
    totalLaps: 2,
    width: 15,
    ambientTheme: 'city_harbor',
    skyColor: 0x4fa4e8,
    groundColor: 0x1f2730,
    fogColor: 0x82b8df,
    sectors: [
      { name: '섹터 1 (보 리바주 & 카지노)', percentage: 0.38 },
      { name: '섹터 2 (페어몬트 헤어핀 & 터널)', percentage: 0.70 },
      { name: '섹터 3 (스위밍 풀 & 라스카스)', percentage: 1.0 },
    ],
    splinePoints: [
      [0, 0, 0],         // Pit straight
      [0, 0, 110],       // Sainte Dévote approach
      [40, 2, 170],      // Sainte Dévote right
      [80, 8, 140],      // Beau Rivage climb
      [140, 16, 90],
      [180, 20, 30],     // Massenet left
      [180, 19, -40],    // Casino Square right
      [150, 16, -110],   // Mirabeau Haute downhill
      [110, 10, -170],
      [60, 5, -190],     // Grand Hotel Fairmont Hairpin (slowest F1 corner)
      [30, 2, -150],     // Mirabeau Bas
      [20, 0, -80],      // Portier
      [60, -1, -10],     // Tunnel entrance (flat out beside the Mediterranean sea)
      [110, -1, 60],     // Inside Tunnel
      [150, -1, 140],    // Tunnel exit
      [160, 0, 220],     // Nouvelle Chicane hard braking
      [130, 0, 270],
      [70, 0, 290],      // Tabac corner by the yachts
      [10, 0, 280],      // Swimming Pool entry
      [-40, 0, 250],     // Swimming pool chicane
      [-80, 0, 190],     // La Rascasse tight right
      [-70, 0, 100],     // Anthony Noghès corner
      [-30, 0, 20],      // Back onto start straight
    ],
    ramps: [4, 15],
    boostPads: [3, 13, 18],
  },

  suzuka: {
    id: 'suzuka',
    name: '스즈카 서킷 (Suzuka Circuit)',
    country: '일본',
    countryCode: 'JPN',
    flagEmoji: '🇯🇵',
    circuitLength: '5.807 km',
    recordLap: '1:30.983 (L. Hamilton)',
    description: 'F1 역사상 유일한 입체교차(8자 형태) 서킷! 연속 S자 코너, 데그너, 130R 등 테크니컬 드라이빙의 극치를 자랑합니다.',
    keyFeatures: ['연속 S자 코너', '데그너 1 & 2', '입체교차 고가 브릿지', '초고속 130R'],
    totalLaps: 2,
    width: 17,
    ambientTheme: 'figure8',
    skyColor: 0x82b9ed,
    groundColor: 0x223826,
    fogColor: 0x9ec7eb,
    sectors: [
      { name: '섹터 1 (First Corner & S자)', percentage: 0.34 },
      { name: '섹터 2 (데그너 & 헤어핀)', percentage: 0.69 },
      { name: '섹터 3 (스푼 & 130R 고가교)', percentage: 1.0 },
    ],
    splinePoints: [
      [0, 0, 0],         // Main Straight
      [0, 0, 150],       // First corner
      [50, 1, 230],      // Turn 2
      [70, 3, 310],      // S-Curves 1
      [30, 5, 390],      // S-Curves 2
      [60, 7, 470],      // S-Curves 3
      [30, 8, 540],      // Dunlop Curve uphill left
      [-40, 7, 580],
      [-120, 6, 560],    // Degner 1
      [-160, 4, 520],    // Degner 2
      [-170, 2, 440],    // Underpass (under the bridge)
      [-150, 0, 360],    // Hairpin approach
      [-180, 0, 280],    // Suzuka Hairpin
      [-150, 1, 190],    // 200R long curve
      [-100, 2, 100],
      [-70, 2, -20],
      [-90, 1, -140],    // Spoon Curve entry
      [-150, 0, -220],   // Spoon mid
      [-190, 0, -280],   // Spoon exit
      [-160, 3, -370],   // Back straight
      [-100, 8, -420],   // Climb to overpass bridge
      [-20, 12, -430],   // 130R entry (elevated high-speed curve)
      [60, 12, -400],    // 130R mid (over the underpass track below!)
      [120, 8, -320],    // 130R exit & downhill
      [140, 4, -200],    // Casio Triangle chicane braking
      [110, 1, -120],    // Casio chicane flick
      [50, 0, -60],      // Final corner onto straight
      [15, 0, -10],
    ],
    ramps: [4, 21],
    boostPads: [0, 19, 23],
  },

  silverstone: {
    id: 'silverstone',
    name: '실버스톤 서킷 (Silverstone Circuit)',
    country: '영국',
    countryCode: 'GBR',
    flagEmoji: '🇬🇧',
    circuitLength: '5.891 km',
    recordLap: '1:27.097 (M. Verstappen)',
    description: '모터스포츠의 요람. 마고츠-베켓-채플로 이어지는 세계에서 가장 빠른 연속 S자 코너와 격렬한 추월이 일어나는 스토우 코너를 정복하세요.',
    keyFeatures: ['마고츠-베켓-채플', '웰링턴 스트레이트', '스토우(Stowe) 코너', '격렬한 행거 스트레이트'],
    totalLaps: 2,
    width: 17,
    ambientTheme: 'historic_airfield',
    skyColor: 0x90c2e7,
    groundColor: 0x2e4225,
    fogColor: 0xaccce6,
    sectors: [
      { name: '섹터 1 (애비 & 웰링턴)', percentage: 0.32 },
      { name: '섹터 2 (콥스 & 마고츠-베켓)', percentage: 0.67 },
      { name: '섹터 3 (행거 스트레이트 & 스토우)', percentage: 1.0 },
    ],
    splinePoints: [
      [0, 0, 0],         // Hamilton Straight
      [0, 0, 140],       // Abbey flat right
      [50, 0, 220],
      [100, 0, 250],     // Farm Curve
      [150, 0, 230],     // Village corner sharp right
      [180, 0, 170],     // The Loop hairpin left
      [160, 0, 90],      // Aintree
      [120, 0, -30],     // Wellington Straight
      [90, 0, -170],
      [60, 0, -290],     // Brooklands long left
      [0, 0, -350],      // Luffield double right
      [-70, 0, -330],
      [-120, 0, -260],   // Woodcote
      [-170, 0, -160],   // National straight
      [-220, 0, -40],    // Copse high-speed blind right
      [-280, 0, 70],
      [-320, 0, 170],    // Maggotts high speed left
      [-340, 0, 250],    // Becketts rapid right
      [-310, 0, 320],    // Chapel exit
      [-240, 0, 420],    // Hangar Straight (longest straight)
      [-150, 0, 520],
      [-50, 0, 600],
      [40, 0, 630],      // Stowe Corner sharp right
      [110, 0, 570],     // Vale chicane braking
      [90, 0, 480],      // Club corner onto main straight
      [50, 0, 360],
      [15, 0, 180],
    ],
    ramps: [8, 19],
    boostPads: [0, 13, 20],
  },
};
