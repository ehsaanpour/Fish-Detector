import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FishSpecies, InspectionRecord } from '../database/schema';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { calculateFreshness, FreshnessInput, FreshnessResult } from '../engine/freshnessGrader';
import { dbService } from '../database/dbService';
import { FishImage } from './FishImage';
import { Ionicons } from '@expo/vector-icons';
import { GeminiVisionService } from '../engine/ai/geminiVisionService';

interface FreshnessModalProps {
  visible: boolean;
  fish: FishSpecies;
  initialValues?: Partial<FreshnessInput>;
  aiFreshnessResult?: FreshnessResult;
  imageUri?: string | null;
  base64?: string | null;
  onClose: () => void;
  onNavigateToCalculator?: (fish: FishSpecies) => void;
}

export const FreshnessModal: React.FC<FreshnessModalProps> = ({
  visible,
  fish,
  initialValues,
  aiFreshnessResult,
  base64,
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

  const [currentAiResult, setCurrentAiResult] = useState<FreshnessResult | undefined>(aiFreshnessResult);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const result = calculateFreshness(
    {
      eyeState,
      gillState,
      skinState,
      fleshState,
    },
    currentAiResult?.aiObservations,
    currentAiResult?.isAiEvaluated ? currentAiResult.score : undefined
  );

  const handleReanalyzeWithGemini = async () => {
    if (!base64) return;
    setIsReanalyzing(true);
    try {
      const refreshed = await GeminiVisionService.inspectFreshnessWithGemini(base64, fish);
      if (refreshed) {
        setCurrentAiResult(refreshed);
        // Sync states if organ breakdown exists
        if (refreshed.scoresBreakdown) {
          if (refreshed.scoresBreakdown.eyes >= 22) setEyeState('prime');
          else if (refreshed.scoresBreakdown.eyes >= 14) setEyeState('good');
          else setEyeState('poor');

          if (refreshed.scoresBreakdown.gills >= 26) setGillState('prime');
          else if (refreshed.scoresBreakdown.gills >= 16) setGillState('good');
          else setGillState('poor');

          if (refreshed.scoresBreakdown.skin >= 22) setSkinState('prime');
          else if (refreshed.scoresBreakdown.skin >= 12) setSkinState('good');
          else setSkinState('poor');

          if (refreshed.scoresBreakdown.flesh >= 17) setFleshState('prime');
          else if (refreshed.scoresBreakdown.flesh >= 10) setFleshState('good');
          else setFleshState('poor');
        }
      }
    } catch {
      // Ignore AI evaluation error
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleSave = React.useCallback(async () => {
    const now = Date.now();
    const record: InspectionRecord = {
      id: `insp_${now}`,
      fishId: fish.id,
      fishName: isRTL ? fish.nameFa : fish.nameEn,
      timestamp: now,
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
  }, [fish.id, fish.nameEn, fish.nameFa, isRTL, result]);

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
          set: (val: 'prime' | 'good' | 'poor') => {
            setEyeState(val);
            if (currentAiResult) setCurrentAiResult({ ...currentAiResult, isAiEvaluated: false });
          },
          options: [
            { state: 'prime' as const, label: t.criteria.eyes.prime, scoreText: '25/25 pts' },
            { state: 'good' as const, label: t.criteria.eyes.good, scoreText: '16/25 pts' },
            { state: 'poor' as const, label: t.criteria.eyes.poor, scoreText: '4/25 pts' },
          ],
        };
      case 'gills':
        return {
          current: gillState,
          set: (val: 'prime' | 'good' | 'poor') => {
            setGillState(val);
            if (currentAiResult) setCurrentAiResult({ ...currentAiResult, isAiEvaluated: false });
          },
          options: [
            { state: 'prime' as const, label: t.criteria.gills.prime, scoreText: '30/30 pts' },
            { state: 'good' as const, label: t.criteria.gills.good, scoreText: '18/30 pts' },
            { state: 'poor' as const, label: t.criteria.gills.poor, scoreText: '2/30 pts' },
          ],
        };
      case 'skin':
        return {
          current: skinState,
          set: (val: 'prime' | 'good' | 'poor') => {
            setSkinState(val);
            if (currentAiResult) setCurrentAiResult({ ...currentAiResult, isAiEvaluated: false });
          },
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
          set: (val: 'prime' | 'good' | 'poor') => {
            setFleshState(val);
            if (currentAiResult) setCurrentAiResult({ ...currentAiResult, isAiEvaluated: false });
          },
          options: [
            { state: 'prime' as const, label: t.criteria.flesh.prime, scoreText: '20/20 pts' },
            { state: 'good' as const, label: t.criteria.flesh.good, scoreText: '12/20 pts' },
            { state: 'poor' as const, label: t.criteria.flesh.poor, scoreText: '2/20 pts' },
          ],
        };
    }
  };

  const criteria = getCurrentCriteria();

  const getCurrentAiObservation = () => {
    if (!currentAiResult?.aiObservations) return null;
    const obs = currentAiResult.aiObservations;
    switch (activeTab) {
      case 'eyes':
        return isRTL ? obs.eyesFa : obs.eyesEn;
      case 'gills':
        return isRTL ? obs.gillsFa : obs.gillsEn;
      case 'skin':
        return isRTL ? obs.skinFa : obs.skinEn;
      case 'flesh':
        return isRTL ? obs.fleshFa : obs.fleshEn;
    }
  };

  const currentObservation = getCurrentAiObservation();
  const shelfLife = isRTL
    ? currentAiResult?.aiObservations?.daysOnIceFa
    : currentAiResult?.aiObservations?.daysOnIceEn || currentAiResult?.aiObservations?.daysOnIceFa;

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

            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              {base64 && (
                <TouchableOpacity
                  onPress={handleReanalyzeWithGemini}
                  disabled={isReanalyzing}
                  style={[styles.reanalyzeBtn, { borderColor: '#0EA5E9', backgroundColor: colors.surfaceSubtle }]}
                >
                  {isReanalyzing ? (
                    <ActivityIndicator size="small" color="#0EA5E9" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={13} color="#0EA5E9" />
                      <Text style={styles.reanalyzeText}>
                        {isRTL ? 'تحلیل جمنای' : 'Gemini AI'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
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
              {/* Gemini AI Header Badge if Evaluated by AI */}
              {currentAiResult?.isAiEvaluated && (
                <View style={[styles.aiVerifiedBanner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="sparkles" size={13} color="#0284C7" />
                  <Text style={styles.aiVerifiedText}>
                    {isRTL ? 'ارزیابی خودکار با هوش مصنوعی چندوجهی گوگل جمنای' : 'Evaluated with Google Gemini Multimodal AI'}
                  </Text>
                </View>
              )}

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

              {/* Shelf Life from Gemini */}
              {shelfLife && (
                <View style={[styles.shelfLifeTag, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="snow" size={13} color="#0284C7" />
                  <Text style={styles.shelfLifeTagText}>
                    {isRTL ? `ماندگاری در یخ: ${shelfLife}` : `Shelf-life on ice: ${shelfLife}`}
                  </Text>
                </View>
              )}

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

            {/* AI Specific Observation for active tab */}
            {currentObservation && (
              <View style={[styles.aiObsCard, { backgroundColor: colors.surface, borderColor: '#0EA5E9' }]}>
                <View style={[styles.aiObsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="sparkles" size={14} color="#0EA5E9" />
                  <Text style={styles.aiObsTitle}>
                    {isRTL ? 'مشاهده بینایی هوش مصنوعی جمنای:' : 'Gemini AI Visual Observation:'}
                  </Text>
                </View>
                <Text style={[styles.aiObsBody, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {currentObservation}
                </Text>
              </View>
            )}

            {/* Criteria Radios */}
            <View style={styles.criteriaContainer}>
              <Text style={[styles.criteriaHeading, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'تنظیم دستی وضعیت این اندام:' : 'Fine-tune organ state:'}
              </Text>
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
  reanalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  reanalyzeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0EA5E9',
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
  aiVerifiedBanner: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(2, 132, 199, 0.15)',
  },
  aiVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  shelfLifeTag: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  shelfLifeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
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
    lineHeight: 16,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  organTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  organTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiObsCard: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  aiObsHeader: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiObsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  aiObsBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  criteriaContainer: {
    marginTop: 12,
  },
  criteriaHeading: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  criteriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  criteriaLabel: {
    fontSize: 13,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsBox: {
    marginTop: 12,
    gap: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  calcBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
