import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';

interface FramingGuideProps {
  headSide?: 'left' | 'right';
}

export const FramingGuide: React.FC<FramingGuideProps> = ({ headSide = 'left' }) => {
  const { colors } = useAppTheme();
  const { isRTL, t } = useAppLocale();

  const isHeadRight = headSide === 'right';

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {/* Top Banner Hint */}
      <View style={[styles.hintBanner, { backgroundColor: 'rgba(10, 17, 24, 0.75)' }]}>
        <Text style={[styles.hintText, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t.scanner.viewfinderHint}
        </Text>
      </View>

      {/* Center Target Box */}
      <View style={styles.viewfinderFrame}>
        {/* Corner Brackets */}
        <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />

        {/* Anatomical Inspection Targets (adaptive to fish head orientation) */}
        <View
          style={[
            styles.focalTarget,
            isHeadRight ? styles.eyeTargetRight : styles.eyeTargetLeft,
            { borderColor: '#EF4444' },
          ]}
        >
          <Text style={styles.focalLabel}>{isRTL ? 'چشم' : 'Eye'}</Text>
        </View>

        <View
          style={[
            styles.focalTarget,
            isHeadRight ? styles.gillTargetRight : styles.gillTargetLeft,
            { borderColor: '#F59E0B' },
          ]}
        >
          <Text style={styles.focalLabel}>{isRTL ? 'آبشش' : 'Gill'}</Text>
        </View>

        <View
          style={[
            styles.focalTarget,
            isHeadRight ? styles.bodyTargetRight : styles.bodyTargetLeft,
            { borderColor: '#10B981' },
          ]}
        >
          <Text style={styles.focalLabel}>{isRTL ? 'پوست و پولک' : 'Scales'}</Text>
        </View>

        {/* Horizontal Center Axis */}
        <View style={[styles.centerAxis, { borderColor: colors.primaryGlow }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBanner: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  hintText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  viewfinderFrame: {
    width: '86%',
    height: 220,
    borderRadius: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },
  focalTarget: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  // Head on Left positions
  eyeTargetLeft: {
    left: 24,
    top: 60,
  },
  gillTargetLeft: {
    left: 70,
    top: 50,
  },
  bodyTargetLeft: {
    right: 50,
    top: 90,
  },
  // Head on Right positions
  eyeTargetRight: {
    right: 24,
    top: 60,
  },
  gillTargetRight: {
    right: 70,
    top: 50,
  },
  bodyTargetRight: {
    left: 50,
    top: 90,
  },
  focalLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  centerAxis: {
    width: '80%',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
});
