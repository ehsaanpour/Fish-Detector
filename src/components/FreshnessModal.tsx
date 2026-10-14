import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FishSpecies, InspectionRecord } from '../database/schema';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { calculateFreshness, FreshnessInput } from '../engine/freshnessGrader';
import { dbService } from '../database/dbService';
import { FishImage } from './FishImage';
import { Ionicons } from '@expo/vector-icons';

interface FreshnessModalProps {
  visible: boolean;
  fish: FishSpecies;
  initialValues?: Partial<FreshnessInput>;
  onClose: () => void;
  onNavigateToCalculator?: (fish: FishSpecies) => void;
}

export const FreshnessModal: React.FC<FreshnessModalProps> = ({
  visible,
  fish,
  initialValues,
  onClose,
  onNavigateToCalculator,
}) => {
  const { colors } = useAppTheme();
  const { isRTL, t, formatNumber } = useAppLocale();

  const [activeTab, setActiveTab] = useState<'eyes' | 'gills' | 'skin' | 'flesh'>('eyes');
  const [eyeState, setEyeState] = useState<'prime' | 'good' | 'poor'>(
    initialValues?.eyeState || 'prime'
  );
  const [gillState, setGillState] = useState<'prime' | 'good' | 'poor'>(
    initialValues?.gillState || 'prime'
  );
  const [skinState, setSkinState] = useState<'prime' | 'good' | 'poor'>(
    initialValues?.skinState || 'prime'
  );
  const [fleshState, setFleshState] = useState<'prime' | 'good' | 'poor'>(
    initialValues?.fleshState || 'prime'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const result = calculateFreshness({
    eyeState,
    gillState,
    skinState,
    fleshState,
  });

  const handleSave = async () => {
    const record: InspectionRecord = {
      id: `insp_${Date.now()}`,
      fishId: fish.id,
      fishName: isRTL ? fish.nameFa : fish.nameEn,
      timestamp: Date.now(),
      freshnessScore: result.score,
      grade: result.grade,
      eyeScore: result.scoresBreakdown.eyes,
      gillScore: result.scoresBreakdown.gills,
      skinScore: result.scoresBreakdown.skin,
      fleshScore: result.scoresBreakdown.flesh,
      notes: `${result.gradeTitleFa} - ${result.score}%`,
    };

    await dbService.saveInspection(record);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const organTabs = [
    { key: 'eyes', label: t.scanner.eyes, icon: 'eye' },
    { key: 'gills', label: t.scanner.gills, icon: 'water' },
    { key: 'skin', label: t.scanner.skin, icon: 'sparkles' },
    { key: 'flesh', label: t.scanner.flesh, icon: 'finger-print' },
  ] as const;

  const getCurrentCriteria = () => {
    switch (activeTab) {
      case 'eyes':
        return {
          current: eyeState,
          set: setEyeState,
          options: [
            { state: 'prime' as const, label: t.criteria.eyes.prime, scoreText: '25/25 pts' },
            { state: 'good' as const, label: t.criteria.eyes.good, scoreText: '16/25 pts' },
            { state: 'poor' as const, label: t.criteria.eyes.poor, scoreText: '4/25 pts' },
          ],
        };
      case 'gills':
        return {
          current: gillState,
          set: setGillState,
          options: [
            { state: 'prime' as const, label: t.criteria.gills.prime, scoreText: '30/30 pts' },
            { state: 'good' as const, label: t.criteria.gills.good, scoreText: '18/30 pts' },
            { state: 'poor' as const, label: t.criteria.gills.poor, scoreText: '2/30 pts' },
          ],
        };
      case 'skin':
        return {
          current: skinState,
          set: setSkinState,
          options: [
            { state: 'prime' as const, label: t.criteria.skin.prime, scoreText: '25/25 pts' },
            { state: 'good' as const, label: t.criteria.skin.good, scoreText: '15/25 pts' },
            { state: 'poor' as const, label: t.criteria.skin.poor, scoreText: '4/25 pts' },
          ],
        };
      case 'flesh':
      default:
        return {
          current: fleshState,
          set: setFleshState,
          options: [
            { state: 'prime' as const, label: t.criteria.flesh.prime, scoreText: '20/20 pts' },
            { state: 'good' as const, label: t.criteria.flesh.good, scoreText: '12/20 pts' },
            { state: 'poor' as const, label: t.criteria.flesh.poor, scoreText: '2/20 pts' },
          ],
        };
    }
  };

  const criteria = getCurrentCriteria();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View
            style={[
              styles.headerRow,
              {
                borderBottomColor: colors.borderSubtle,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {t.scanner.freshnessHeading}
              </Text>
              <Text style={[styles.subtitle, { color: colors.primary }]}>
                {isRTL ? fish.nameFa : fish.nameEn}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Real Biological Specimen with Active Organ Focal Target */}
            <View style={[styles.illustrationCard, { backgroundColor: colors.surfaceSubtle }]}>
              <FishImage
                assetKey={fish.assetKey}
                style={{ width: 220, height: 130 }}
                resizeMode="contain"
                borderRadius={12}
                highlightZone={activeTab}
              />
              <Text style={[styles.zoneBadgeText, { color: colors.textMuted }]}>
                {isRTL ? `نقطه تمرکز: ${organTabs.find((t) => t.key === activeTab)?.label}` : `Focal Target: ${activeTab.toUpperCase()}`}
              </Text>
            </View>

            {/* Score & Certificate Card */}
            <View
              style={[
                styles.certificateCard,
                {
                  borderColor: result.badgeColor,
                  backgroundColor: colors.surfaceSubtle,
                },
              ]}
            >
              <View
                style={[
                  styles.certHeader,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={[styles.gradeBadge, { backgroundColor: result.badgeColor }]}>
                  <Text style={styles.gradeLetter}>{result.grade}</Text>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.certScore, { color: result.badgeColor }]}>
                    {formatNumber(result.score)}% {t.scanner.freshnessScore}
                  </Text>
                  <Text style={[styles.certTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? result.gradeTitleFa : result.gradeTitleEn}
                  </Text>
                </View>
              </View>

              <Text style={[styles.certSummary, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? result.summaryFa : result.summaryEn}
              </Text>

              <View
                style={[
                  styles.verdictBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="restaurant" size={16} color={colors.primary} />
                <Text style={[styles.verdictText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? result.culinaryVerdictFa : result.culinaryVerdictEn}
                </Text>
              </View>
            </View>

            {/* Organ Navigation Tabs */}
            <View
              style={[
                styles.tabsRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {organTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={[
                      styles.organTab,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surfaceSubtle,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={tab.icon as any}
                      size={15}
                      color={isActive ? '#FFFFFF' : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.organTabText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Criteria Radios */}
            <View style={styles.criteriaContainer}>
              {criteria.options.map((option) => {
                const isSelected = criteria.current === option.state;
                return (
                  <TouchableOpacity
                    key={option.state}
                    onPress={() => criteria.set(option.state)}
                    style={[
                      styles.criteriaCard,
                      {
                        backgroundColor: isSelected ? colors.primaryGlow : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.borderSubtle,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: isSelected ? colors.primary : colors.border },
                      ]}
                    >
                      {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>

                    <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                      <Text
                        style={[
                          styles.criteriaLabel,
                          {
                            color: isSelected ? colors.primary : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>

                    <View style={[styles.scoreBadge, { backgroundColor: colors.surfaceSubtle }]}>
                      <Text style={[styles.scoreBadgeText, { color: colors.textMuted }]}>
                        {option.scoreText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons: Save Record & Calculate Price */}
            <View style={styles.actionsBox}>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {savedSuccess ? t.scanner.savedSuccess : t.scanner.saveRecord}
                </Text>
              </TouchableOpacity>

              {onNavigateToCalculator && (
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onNavigateToCalculator(fish);
                  }}
                  style={[styles.calcBtn, { borderColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calculator" size={18} color={colors.primary} />
                  <Text style={[styles.calcBtnText, { color: colors.primary }]}>
                    {t.scanner.calculateCost}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCard: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  certificateCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
  },
  certHeader: {
    alignItems: 'center',
  },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  certScore: {
    fontSize: 16,
    fontWeight: '800',
  },
  certTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  certSummary: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  verdictBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  verdictText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  tabsRow: {
    marginTop: 16,
    gap: 6,
    justifyContent: 'space-between',
  },
  organTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  organTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  criteriaContainer: {
    marginTop: 12,
    gap: 8,
  },
  criteriaCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  criteriaLabel: {
    fontSize: 12,
    lineHeight: 18,
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionsBox: {
    marginTop: 18,
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  calcBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
