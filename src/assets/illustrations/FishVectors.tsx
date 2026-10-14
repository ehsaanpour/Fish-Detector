import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FishImage } from '../../components/FishImage';

export interface FishIllustrationProps {
  assetKey: string;
  width?: number;
  height?: number;
  highlightZone?: 'eyes' | 'gills' | 'skin' | 'flesh' | null;
  primaryColor?: string;
}

/**
 * Authentic Fish Representation Component
 * Renders real high-resolution specimen photographs for all Persian Gulf,
 * Caspian Sea, Freshwater, and Global fish species.
 */
export const FishIllustration: React.FC<FishIllustrationProps> = ({
  assetKey,
  width = 240,
  height = 140,
  highlightZone = null,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <FishImage
        assetKey={assetKey}
        style={{ width, height }}
        resizeMode="contain"
        borderRadius={12}
        highlightZone={highlightZone}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
