import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';

export const FISH_IMAGES: Record<string, any> = {
  zobaidi: require('../../assets/fish/zobaidi.jpg'),
  halva_siah: require('../../assets/fish/halva_siah.jpg'),
  shir: require('../../assets/fish/shir.jpg'),
  ghobad: require('../../assets/fish/ghobad.jpg'),
  shoorideh: require('../../assets/fish/shoorideh.jpg'),
  sangsar: require('../../assets/fish/sangsar.jpg'),
  hamour: require('../../assets/fish/hamour.jpg'),
  shahri: require('../../assets/fish/shahri.jpg'),
  sorkhoo: require('../../assets/fish/sorkhoo.jpg'),
  rashgoo: require('../../assets/fish/rashgoo.jpg'),
  seebass_jonoob: require('../../assets/fish/seebass_jonoob.jpg'),
  sakan: require('../../assets/fish/sakan.jpg'),
  hoor: require('../../assets/fish/hoor.jpg'),
  zaminkan: require('../../assets/fish/zaminkan.jpg'),
  shank: require('../../assets/fish/shank.jpg'),
  kharoo: require('../../assets/fish/kharoo.jpg'),
  dolmi: require('../../assets/fish/dolmi.jpg'),
  sarem: require('../../assets/fish/sarem.jpg'),
  meyd: require('../../assets/fish/meyd.jpg'),
  zardeh: require('../../assets/fish/zardeh.jpg'),
  talal: require('../../assets/fish/talal.jpg'),
  sobaity: require('../../assets/fish/sobaity.jpg'),
  skipjack: require('../../assets/fish/skipjack.jpg'),
  gish: require('../../assets/fish/gish.jpg'),
  soltan_ebrahim: require('../../assets/fish/soltan_ebrahim.jpg'),
  kafshak: require('../../assets/fish/kafshak.jpg'),
  ordak_mahi: require('../../assets/fish/ordak_mahi.jpg'),
  kilka: require('../../assets/fish/kilka.jpg'),
  kutum: require('../../assets/fish/kutum.jpg'),
  ghezelala: require('../../assets/fish/ghezelala.jpg'),
  kapoor: require('../../assets/fish/kapoor.jpg'),
  souf: require('../../assets/fish/souf.jpg'),
  ozonboron: require('../../assets/fish/ozonboron.jpg'),
  kefal_khazar: require('../../assets/fish/kefal_khazar.jpg'),
  azad_khazar: require('../../assets/fish/azad_khazar.jpg'),
  atlantic_salmon: require('../../assets/fish/atlantic_salmon.jpg'),
  cod: require('../../assets/fish/cod.jpg'),
  tilapia: require('../../assets/fish/tilapia.jpg'),
  dorade: require('../../assets/fish/dorade.jpg'),
  european_seabass: require('../../assets/fish/european_seabass.jpg'),
  yellowfin_tuna: require('../../assets/fish/yellowfin_tuna.jpg'),
  swordfish: require('../../assets/fish/swordfish.jpg'),
  mackerel_sardine: require('../../assets/fish/mackerel_sardine.jpg'),
  halibut: require('../../assets/fish/halibut.jpg'),
  haddock: require('../../assets/fish/haddock.jpg'),
};

export interface FishImageProps {
  assetKey: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  borderRadius?: number;
  highlightZone?: 'eyes' | 'gills' | 'skin' | 'flesh' | null;
}

export const FishImage: React.FC<FishImageProps> = ({
  assetKey,
  style,
  resizeMode = 'cover',
  borderRadius = 8,
  highlightZone = null,
}) => {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);

  const imageSource = FISH_IMAGES[assetKey] || FISH_IMAGES['zobaidi'];

  return (
    <View style={[styles.container, { borderRadius }]}>
      <Image
        source={imageSource}
        style={[styles.image, { borderRadius }, style]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setHasError(true)}
      />

      {loading && (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color="#0284C7" />
        </View>
      )}

      {/* Visual Overlay Highlight for Real Inspection Anatomical Zones */}
      {highlightZone && (
        <View style={[styles.zoneBadge, styles[highlightZone]]}>
          <Text style={styles.zoneText}>
            {highlightZone === 'eyes' ? '👁️ چشم / Eye' :
             highlightZone === 'gills' ? '🔴 آبشش / Gill' :
             highlightZone === 'skin' ? '✨ پولک و پوست / Skin' : '🥩 گوشت و شکم / Flesh'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  zoneBadge: {
    position: 'absolute',
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  zoneText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  eyes: {
    borderColor: '#38BDF8',
  },
  gills: {
    borderColor: '#EF4444',
  },
  skin: {
    borderColor: '#10B981',
  },
  flesh: {
    borderColor: '#F59E0B',
  },
});
