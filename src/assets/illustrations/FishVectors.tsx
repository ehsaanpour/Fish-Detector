import React from 'react';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  Rect,
} from 'react-native-svg';

export interface FishIllustrationProps {
  assetKey: string;
  width?: number;
  height?: number;
  highlightZone?: 'eyes' | 'gills' | 'skin' | 'flesh' | null;
  primaryColor?: string;
}

export const FishIllustration: React.FC<FishIllustrationProps> = ({
  assetKey,
  width = 240,
  height = 140,
  highlightZone = null,
  primaryColor,
}) => {
  // Render distinct biological body shapes based on the fish variant
  switch (assetKey) {
    case 'zobaidi':
    case 'halva_siah': {
      const isBlack = assetKey === 'halva_siah';
      const mainGradient = isBlack ? ['#475569', '#1E293B'] : ['#F8FAFC', '#94A3B8'];
      return (
        <Svg width={width} height={height} viewBox="0 0 240 140">
          <Defs>
            <LinearGradient id="pomfretGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={mainGradient[0]} />
              <Stop offset="100%" stopColor={mainGradient[1]} />
            </LinearGradient>
            <LinearGradient id="sheenGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          {/* Deep Diamond Body */}
          <Path
            d="M 50 70 C 80 15, 150 20, 180 60 C 190 70, 190 75, 180 85 C 150 125, 80 130, 50 75 Z"
            fill="url(#pomfretGrad)"
            stroke={isBlack ? '#334155' : '#64748B'}
            strokeWidth="2"
          />
          {/* Metallic Sheen Overlay */}
          <Path
            d="M 65 68 C 90 35, 140 38, 165 65 C 145 85, 95 88, 65 68 Z"
            fill="url(#sheenGrad)"
          />
          {/* Crescent Dorsal Fin */}
          <Polygon
            points="110,25 155,10 160,35 140,32"
            fill={isBlack ? '#334155' : '#CBD5E1'}
            stroke={isBlack ? '#1E293B' : '#94A3B8'}
            strokeWidth="1.5"
          />
          {/* Crescent Anal Fin */}
          <Polygon
            points="115,115 155,130 160,105 140,108"
            fill={isBlack ? '#334155' : '#CBD5E1'}
            stroke={isBlack ? '#1E293B' : '#94A3B8'}
            strokeWidth="1.5"
          />
          {/* Deeply Forked Caudal (Tail) Fin */}
          <Polygon
            points="180,68 225,35 205,70 228,105 180,75"
            fill={isBlack ? '#334155' : '#CBD5E1'}
            stroke={isBlack ? '#1E293B' : '#94A3B8'}
            strokeWidth="1.5"
          />
          {/* Pectoral Fin */}
          <Polygon
            points="85,68 115,55 110,78 88,74"
            fill={isBlack ? '#1E293B' : '#E2E8F0'}
            stroke={isBlack ? '#0F172A' : '#94A3B8'}
            strokeWidth="1"
          />
          {/* Gill Cover / Operculum */}
          <Path
            d="M 78 50 C 88 65, 88 80, 78 92"
            fill="none"
            stroke={highlightZone === 'gills' ? '#EF4444' : isBlack ? '#1E293B' : '#94A3B8'}
            strokeWidth={highlightZone === 'gills' ? '4' : '2'}
          />
          {/* Eye */}
          <Circle
            cx="62"
            cy="60"
            r={highlightZone === 'eyes' ? '7' : '5'}
            fill={highlightZone === 'eyes' ? '#EF4444' : '#0F172A'}
            stroke="#F8FAFC"
            strokeWidth="1.5"
          />
          <Circle cx="63" cy="59" r="1.5" fill="#FFFFFF" />
          {/* Tiny Mouth */}
          <Path d="M 48 71 Q 44 73 48 76" stroke="#475569" strokeWidth="2" fill="none" />
          {/* Flesh Zone Highlight */}
          {highlightZone === 'flesh' && (
            <Circle cx="125" cy="70" r="24" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" strokeDasharray="4,4" />
          )}
          {/* Skin Zone Highlight */}
          {highlightZone === 'skin' && (
            <Rect x="90" y="45" width="60" height="50" rx="8" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
          )}
        </Svg>
      );
    }

    case 'shir':
    case 'ghobad': {
      const isGhobad = assetKey === 'ghobad';
      return (
        <Svg width={width} height={height} viewBox="0 0 240 140">
          <Defs>
            <LinearGradient id="mackerelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#475569" />
              <Stop offset="50%" stopColor="#94A3B8" />
              <Stop offset="100%" stopColor="#F1F5F9" />
            </LinearGradient>
          </Defs>
          {/* Torpedo / Elongated Body */}
          <Path
            d="M 30 70 C 60 45, 140 40, 195 65 C 200 68, 200 72, 195 75 C 140 100, 60 95, 30 70 Z"
            fill="url(#mackerelGrad)"
            stroke="#334155"
            strokeWidth="2"
          />
          {/* Tiger Stripes for Shir / Dots for Ghobad */}
          {!isGhobad ? (
            <G stroke="#334155" strokeWidth="1.8" opacity="0.6">
              <Path d="M 90 52 Q 92 68 89 88" />
              <Path d="M 105 50 Q 107 68 104 88" />
              <Path d="M 120 49 Q 123 68 120 89" />
              <Path d="M 135 50 Q 137 68 135 88" />
              <Path d="M 150 52 Q 152 68 149 86" />
              <Path d="M 165 56 Q 167 68 165 82" />
            </G>
          ) : (
            <G fill="#334155" opacity="0.7">
              <Circle cx="95" cy="62" r="2.5" />
              <Circle cx="110" cy="60" r="2.5" />
              <Circle cx="125" cy="61" r="2.5" />
              <Circle cx="140" cy="63" r="2.5" />
              <Circle cx="155" cy="66" r="2.5" />
              <Circle cx="102" cy="74" r="2" />
              <Circle cx="118" cy="73" r="2" />
              <Circle cx="133" cy="74" r="2" />
              <Circle cx="148" cy="75" r="2" />
            </G>
          )}
          {/* Sickle Caudal Tail Fin */}
          <Polygon points="195,68 232,32 215,70 232,108 195,72" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
          {/* Dorsal Fin & Finlets */}
          <Polygon points="80,48 110,32 120,47" fill="#475569" />
          <Polygon points="140,49 146,43 150,51" fill="#475569" />
          <Polygon points="155,52 161,46 165,54" fill="#475569" />
          <Polygon points="170,56 175,51 179,58" fill="#475569" />
          {/* Pectoral Fin */}
          <Polygon points="70,70 95,62 90,78 72,74" fill="#64748B" />
          {/* Sharp Mouth */}
          <Path d="M 28 69 L 45 70" stroke="#1E293B" strokeWidth="1.5" />
          {/* Gill Slit */}
          <Path
            d="M 64 54 C 70 65, 70 75, 64 85"
            fill="none"
            stroke={highlightZone === 'gills' ? '#EF4444' : '#475569'}
            strokeWidth={highlightZone === 'gills' ? '4' : '2'}
          />
          {/* Eye */}
          <Circle
            cx="48"
            cy="63"
            r={highlightZone === 'eyes' ? '6.5' : '4.5'}
            fill={highlightZone === 'eyes' ? '#EF4444' : '#0F172A'}
            stroke="#F8FAFC"
            strokeWidth="1.5"
          />
          <Circle cx="49" cy="62" r="1.5" fill="#FFFFFF" />
          {/* Flesh Zone Highlight */}
          {highlightZone === 'flesh' && (
            <Circle cx="120" cy="70" r="22" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" strokeDasharray="4,4" />
          )}
          {highlightZone === 'skin' && (
            <Rect x="85" y="52" width="80" height="36" rx="6" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
          )}
        </Svg>
      );
    }

    case 'sorkhoo':
    case 'hamour': {
      const isRed = assetKey === 'sorkhoo';
      return (
        <Svg width={width} height={height} viewBox="0 0 240 140">
          <Defs>
            <LinearGradient id="snapperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={isRed ? '#DC2626' : '#9A3412'} />
              <Stop offset="50%" stopColor={isRed ? '#F87171' : '#D97706'} />
              <Stop offset="100%" stopColor="#FEF2F2" />
            </LinearGradient>
          </Defs>
          {/* Robust Deep Body */}
          <Path
            d="M 40 70 C 70 25, 145 28, 185 62 C 190 68, 190 74, 185 78 C 145 115, 70 115, 40 75 Z"
            fill="url(#snapperGrad)"
            stroke={isRed ? '#991B1B' : '#7C2D12'}
            strokeWidth="2"
          />
          {/* Hamour Dots if grouper */}
          {!isRed && (
            <G fill="#78350F" opacity="0.75">
              <Circle cx="80" cy="55" r="3" />
              <Circle cx="100" cy="48" r="3.5" />
              <Circle cx="125" cy="50" r="3.5" />
              <Circle cx="150" cy="55" r="3" />
              <Circle cx="90" cy="70" r="3.5" />
              <Circle cx="115" cy="72" r="4" />
              <Circle cx="140" cy="74" r="3.5" />
              <Circle cx="160" cy="72" r="3" />
              <Circle cx="105" cy="88" r="3" />
              <Circle cx="130" cy="90" r="3" />
            </G>
          )}
          {/* Spiny Dorsal Fin */}
          <Polygon
            points="85,38 95,20 115,22 135,26 155,30 170,45 140,40 100,40"
            fill={isRed ? '#B91C1C' : '#B45309'}
            stroke={isRed ? '#7F1D1D' : '#78350F'}
            strokeWidth="1.5"
          />
          {/* Broad Tail */}
          <Polygon
            points="185,68 220,40 210,70 220,100 185,76"
            fill={isRed ? '#DC2626' : '#9A3412'}
            stroke={isRed ? '#991B1B' : '#7C2D12'}
            strokeWidth="1.5"
          />
          {/* Pectoral Fin */}
          <Polygon points="80,68 115,62 105,82 82,75" fill={isRed ? '#EF4444' : '#F59E0B'} />
          {/* Gill Cover */}
          <Path
            d="M 75 48 C 85 62, 85 80, 75 92"
            fill="none"
            stroke={highlightZone === 'gills' ? '#EF4444' : '#7F1D1D'}
            strokeWidth={highlightZone === 'gills' ? '4' : '2'}
          />
          {/* Eye */}
          <Circle
            cx="58"
            cy="58"
            r={highlightZone === 'eyes' ? '7' : '5'}
            fill={highlightZone === 'eyes' ? '#EF4444' : isRed ? '#991B1B' : '#0F172A'}
            stroke="#FEF2F2"
            strokeWidth="1.5"
          />
          <Circle cx="59" cy="57" r="1.5" fill="#FFFFFF" />
          {/* Mouth */}
          <Path d="M 38 72 Q 48 76 58 74" stroke="#7F1D1D" strokeWidth="2" fill="none" />
          {highlightZone === 'flesh' && (
            <Circle cx="125" cy="70" r="25" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" strokeDasharray="4,4" />
          )}
          {highlightZone === 'skin' && (
            <Rect x="85" y="48" width="75" height="48" rx="8" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
          )}
        </Svg>
      );
    }

    case 'hoor':
    case 'yellowfin_tuna': {
      const isYellowfin = assetKey === 'yellowfin_tuna';
      return (
        <Svg width={width} height={height} viewBox="0 0 240 140">
          <Defs>
            <LinearGradient id="tunaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0F172A" />
              <Stop offset="45%" stopColor="#1E3A8A" />
              <Stop offset="100%" stopColor="#F8FAFC" />
            </LinearGradient>
          </Defs>
          {/* Muscular Teardrop Body */}
          <Path
            d="M 35 70 C 65 30, 145 32, 190 66 C 196 70, 196 72, 190 76 C 145 110, 65 110, 35 70 Z"
            fill="url(#tunaGrad)"
            stroke="#0F172A"
            strokeWidth="2"
          />
          {/* Golden Lateral Stripe */}
          <Path d="M 55 68 Q 120 62 180 70" stroke={isYellowfin ? '#EAB308' : '#38BDF8'} strokeWidth="2.5" fill="none" opacity="0.8" />
          {/* Sickle Dorsal Fin */}
          <Polygon points="100,42 125,12 135,42" fill={isYellowfin ? '#FACC15' : '#1E293B'} stroke="#0F172A" strokeWidth="1.2" />
          {/* Sickle Anal Fin */}
          <Polygon points="110,98 130,128 140,98" fill={isYellowfin ? '#FACC15' : '#1E293B'} stroke="#0F172A" strokeWidth="1.2" />
          {/* Yellow Triangular Finlets along tail ridge */}
          <Polygon points="150,48 155,42 160,50" fill="#EAB308" />
          <Polygon points="163,52 168,46 173,54" fill="#EAB308" />
          <Polygon points="175,56 180,51 184,58" fill="#EAB308" />
          <Polygon points="152,92 157,98 162,90" fill="#EAB308" />
          <Polygon points="165,88 170,94 175,86" fill="#EAB308" />
          {/* Crescent High-Aspect Tail */}
          <Polygon points="190,69 232,28 214,70 232,112 190,73" fill="#0F172A" stroke="#020617" strokeWidth="1.5" />
          {/* Pectoral Fin */}
          <Polygon points="75,70 115,64 105,78 78,75" fill={isYellowfin ? '#EAB308' : '#334155'} />
          {/* Eye */}
          <Circle
            cx="54"
            cy="60"
            r={highlightZone === 'eyes' ? '6.5' : '5'}
            fill={highlightZone === 'eyes' ? '#EF4444' : '#020617'}
            stroke="#F8FAFC"
            strokeWidth="1.5"
          />
          <Circle cx="55" cy="59" r="1.5" fill="#FFFFFF" />
          {/* Gill Slit */}
          <Path
            d="M 72 50 C 78 62, 78 76, 72 88"
            fill="none"
            stroke={highlightZone === 'gills' ? '#EF4444' : '#334155'}
            strokeWidth={highlightZone === 'gills' ? '4' : '2'}
          />
          {highlightZone === 'flesh' && (
            <Circle cx="120" cy="70" r="25" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" strokeDasharray="4,4" />
          )}
          {highlightZone === 'skin' && (
            <Rect x="80" y="48" width="75" height="44" rx="8" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
          )}
        </Svg>
      );
    }

    case 'kutum':
    case 'ghezelala':
    case 'azad_khazar':
    case 'atlantic_salmon': {
      const isSalmonTrout = assetKey === 'ghezelala' || assetKey === 'atlantic_salmon' || assetKey === 'azad_khazar';
      return (
        <Svg width={width} height={height} viewBox="0 0 240 140">
          <Defs>
            <LinearGradient id="salmonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={isSalmonTrout ? '#334155' : '#475569'} />
              <Stop offset="50%" stopColor={isSalmonTrout ? '#FB7185' : '#94A3B8'} />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>
          </Defs>
          {/* Streamlined Body */}
          <Path
            d="M 35 70 C 65 38, 145 35, 190 66 C 196 70, 196 73, 190 76 C 145 105, 65 102, 35 70 Z"
            fill="url(#salmonGrad)"
            stroke="#334155"
            strokeWidth="2"
          />
          {/* Rosy Flank Stripe for Trout/Salmon */}
          {isSalmonTrout && (
            <Path d="M 60 70 Q 120 66 180 72" stroke="#F43F5E" strokeWidth="6" fill="none" opacity="0.6" />
          )}
          {/* Speckles */}
          <G fill="#1E293B" opacity="0.6">
            <Circle cx="85" cy="52" r="1.5" />
            <Circle cx="100" cy="48" r="1.5" />
            <Circle cx="120" cy="50" r="1.5" />
            <Circle cx="140" cy="52" r="1.5" />
            <Circle cx="160" cy="58" r="1.5" />
            <Circle cx="175" cy="62" r="1.5" />
          </G>
          {/* Dorsal Fin */}
          <Polygon points="95,44 118,22 130,42" fill="#475569" stroke="#334155" strokeWidth="1.2" />
          {/* Adipose Fin */}
          <Polygon points="168,54 175,48 180,56" fill="#64748B" />
          {/* Tail */}
          <Polygon points="190,69 228,42 215,70 228,98 190,73" fill="#475569" stroke="#334155" strokeWidth="1.5" />
          {/* Pectoral Fin */}
          <Polygon points="72,72 98,64 92,78 74,76" fill="#94A3B8" />
          {/* Operculum */}
          <Path
            d="M 66 52 C 74 62, 74 76, 66 88"
            fill="none"
            stroke={highlightZone === 'gills' ? '#EF4444' : '#475569'}
            strokeWidth={highlightZone === 'gills' ? '4' : '2'}
          />
          {/* Eye */}
          <Circle
            cx="50"
            cy="62"
            r={highlightZone === 'eyes' ? '6.5' : '4.5'}
            fill={highlightZone === 'eyes' ? '#EF4444' : '#0F172A'}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <Circle cx="51" cy="61" r="1.5" fill="#FFFFFF" />
          {highlightZone === 'flesh' && (
            <Circle cx="120" cy="70" r="24" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" strokeDasharray="4,4" />
          )}
          {highlightZone === 'skin' && (
            <Rect x="80" y="50" width="80" height="40" rx="8" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
          )}
        </Svg>
      );
    }

    case 'ozonboron': {
      return (
        <Svg width={width} height={height} viewBox="0 0 240 140">
          <Defs>
            <LinearGradient id="sturgeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#334155" />
              <Stop offset="50%" stopColor="#64748B" />
              <Stop offset="100%" stopColor="#E2E8F0" />
            </LinearGradient>
          </Defs>
          {/* Ancient Elongated Body with Pointed Snout */}
          <Path
            d="M 22 72 C 55 52, 130 45, 190 66 C 196 68, 196 72, 190 74 C 130 95, 55 90, 22 72 Z"
            fill="url(#sturgeonGrad)"
            stroke="#1E293B"
            strokeWidth="2"
          />
          {/* Prehistoric Dorsal Bony Scutes (Stars) */}
          <G fill="#CBD5E1" stroke="#334155" strokeWidth="1">
            <Polygon points="70,55 76,49 82,55 76,57" />
            <Polygon points="90,52 96,46 102,52 96,54" />
            <Polygon points="110,50 116,44 122,50 116,52" />
            <Polygon points="130,51 136,45 142,51 136,53" />
            <Polygon points="150,54 156,48 162,54 156,56" />
            <Polygon points="170,58 176,52 182,58 176,60" />
          </G>
          {/* Heterocercal Shark Tail (top lobe much larger) */}
          <Polygon points="190,69 235,35 215,72 225,92 190,75" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
          {/* Ventral Barbels near mouth */}
          <Path d="M 38 76 Q 40 84 38 88" stroke="#64748B" strokeWidth="1.5" fill="none" />
          <Path d="M 43 76 Q 45 84 43 88" stroke="#64748B" strokeWidth="1.5" fill="none" />
          {/* Tiny Primitive Eye */}
          <Circle
            cx="44"
            cy="66"
            r={highlightZone === 'eyes' ? '5.5' : '3.5'}
            fill={highlightZone === 'eyes' ? '#EF4444' : '#0F172A'}
            stroke="#F8FAFC"
            strokeWidth="1"
          />
          {/* Gill opening */}
          <Path
            d="M 64 62 C 68 68, 68 76, 64 82"
            fill="none"
            stroke={highlightZone === 'gills' ? '#EF4444' : '#1E293B'}
            strokeWidth={highlightZone === 'gills' ? '4' : '2'}
          />
          {highlightZone === 'flesh' && (
            <Circle cx="120" cy="70" r="22" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" strokeDasharray="4,4" />
          )}
          {highlightZone === 'skin' && (
            <Rect x="75" y="52" width="90" height="36" rx="6" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
          )}
        </Svg>
      );
    }

    // Default / General Fish Silhouette (High-contrast anatomical template)
    default: {
      const customColor = primaryColor || '#0284C7';
      return (
        <Svg width={width} height={height} viewBox="0 0 240 140">
          <Defs>
            <LinearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={customColor} />
              <Stop offset="55%" stopColor="#94A3B8" />
              <Stop offset="100%" stopColor="#F8FAFC" />
            </LinearGradient>
          </Defs>
          {/* Classic Commercial Fish Body */}
          <Path
            d="M 40 70 C 70 30, 145 32, 185 64 C 190 68, 190 72, 185 76 C 145 108, 70 110, 40 70 Z"
            fill="url(#defaultGrad)"
            stroke="#334155"
            strokeWidth="2"
          />
          {/* Dorsal Fin */}
          <Polygon points="90,40 120,18 140,38" fill="#475569" stroke="#334155" strokeWidth="1.5" />
          {/* Caudal Tail */}
          <Polygon points="185,68 225,38 210,70 225,102 185,74" fill="#475569" stroke="#334155" strokeWidth="1.5" />
          {/* Pectoral Fin */}
          <Polygon points="78,70 108,62 100,78 80,75" fill="#64748B" />
          {/* Operculum (Gills) */}
          <Path
            d="M 72 50 C 80 62, 80 78, 72 90"
            fill="none"
            stroke={highlightZone === 'gills' ? '#EF4444' : '#334155'}
            strokeWidth={highlightZone === 'gills' ? '4' : '2'}
          />
          {/* Eye */}
          <Circle
            cx="54"
            cy="60"
            r={highlightZone === 'eyes' ? '7' : '5'}
            fill={highlightZone === 'eyes' ? '#EF4444' : '#0F172A'}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <Circle cx="55" cy="59" r="1.5" fill="#FFFFFF" />
          {/* Mouth */}
          <Path d="M 38 71 Q 44 73 48 72" stroke="#334155" strokeWidth="2" fill="none" />
          {highlightZone === 'flesh' && (
            <Circle cx="120" cy="70" r="24" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" strokeDasharray="4,4" />
          )}
          {highlightZone === 'skin' && (
            <Rect x="85" y="48" width="75" height="44" rx="8" fill="#10B981" fillOpacity="0.25" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
          )}
        </Svg>
      );
    }
  }
};
