import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { HeaderBar } from '../components/HeaderBar';
import { FramingGuide } from '../components/FramingGuide';
import { FreshnessModal } from '../components/FreshnessModal';
import { FishImage } from '../components/FishImage';
import {
  classifyFishPhoto,
  InspectionPrediction,
  ImageAnalysisMeta,
} from '../engine/cv/speciesClassifier';
import { FishSpecies } from '../database/schema';
import { ALL_FISH_SPECIES } from '../database/seedData';
import { Ionicons } from '@expo/vector-icons';

interface ScannerScreenProps {
  onSelectFish: (fish: FishSpecies) => void;
  onNavigateToCalculator: (fish: FishSpecies) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  onSelectFish,
  onNavigateToCalculator,
}) => {
  const { colors } = useAppTheme();
  const { isRTL, t, formatNumber } = useAppLocale();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageAnalysisMeta | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<InspectionPrediction | null>(null);
  const [showFreshnessModal, setShowFreshnessModal] = useState(false);

  // Orientation Controls (0°, 90°, 180°, 270° & Horizontal Flip)
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Manual Species Override Modal
  const [showSpeciesModal, setShowSpeciesModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isManuallyOverridden, setIsManuallyOverridden] = useState<boolean>(false);

  const performClassification = async (
    uri: string,
    meta?: ImageAnalysisMeta,
    rot: number = 0,
    flipped: boolean = false
  ) => {
    setIsAnalyzing(true);
    try {
      const pred = await classifyFishPhoto(uri, meta?.fileName, meta, {
        rotation: rot,
        isFlipped: flipped,
      });
      setPrediction(pred);
      setIsManuallyOverridden(false);
    } catch {
      // Fallback in case of unexpected failure
      const fallbackPred = await classifyFishPhoto('local_simulated_scan');
      setPrediction(fallbackPred);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          // Open gallery if camera permission not granted
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.85,
          });
        } else {
          result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.85,
          });
        }
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.85,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const meta: ImageAnalysisMeta = {
          fileName: asset.fileName || undefined,
          width: asset.width,
          height: asset.height,
        };

        setImageUri(uri);
        setImageMeta(meta);
        setRotation(0);
        setIsFlipped(false);

        await performClassification(uri, meta, 0, false);
      }
    } catch {
      setIsAnalyzing(true);
      const pred = await classifyFishPhoto('local_simulated_scan');
      setPrediction(pred);
      setIsAnalyzing(false);
    }
  };

  const handleRotate = async () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    if (imageUri) {
      await performClassification(imageUri, imageMeta || undefined, nextRotation, isFlipped);
    }
  };

  const handleFlip = async () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    if (imageUri) {
      await performClassification(imageUri, imageMeta || undefined, rotation, nextFlipped);
    }
  };

  const handleResetOrientation = async () => {
    setRotation(0);
    setIsFlipped(false);
    if (imageUri) {
      await performClassification(imageUri, imageMeta || undefined, 0, false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setImageMeta(null);
    setPrediction(null);
    setRotation(0);
    setIsFlipped(false);
    setIsManuallyOverridden(false);
  };

  const handleManualSelectFish = React.useCallback(
    (selected: FishSpecies) => {
      const now = Date.now();
      if (!prediction) {
        const pred: InspectionPrediction = {
          topMatch: {
            species: selected,
            confidence: 100,
            distinguishingFeaturesEn: selected.physicalFeaturesEn,
            distinguishingFeaturesFa: selected.physicalFeaturesFa,
          },
          alternatives: [],
          automatedFreshnessEstimate: {
            eyeState: 'prime',
            gillState: 'prime',
            skinState: 'prime',
            fleshState: 'prime',
          },
          scanTimestamp: now,
        };
        setPrediction(pred);
      } else {
        const updatedAlternatives = [
          prediction.topMatch,
          ...prediction.alternatives.filter((a) => a.species.id !== selected.id),
        ].slice(0, 2);

        setPrediction({
          ...prediction,
          topMatch: {
            species: selected,
            confidence: 100,
            distinguishingFeaturesEn: selected.physicalFeaturesEn,
            distinguishingFeaturesFa: selected.physicalFeaturesFa,
          },
          alternatives: updatedAlternatives,
        });
      }
      setIsManuallyOverridden(true);
      setShowSpeciesModal(false);
      setSearchQuery('');
    },
    [prediction]
  );

  // Filter species for manual search modal
  const filteredSpecies = ALL_FISH_SPECIES.filter((fish) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      fish.nameEn.toLowerCase().includes(q) ||
      fish.nameFa.toLowerCase().includes(q) ||
      fish.scientificName.toLowerCase().includes(q) ||
      fish.regionalNames.some((r) => r.dialectName.toLowerCase().includes(q))
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title={t.scanner.title} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Camera / Viewfinder Box */}
        <View style={styles.viewfinderSection}>
          <View style={[styles.viewfinderBox, { backgroundColor: '#0A1118' }]}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.capturedImage,
                  {
                    transform: [
                      { rotate: `${rotation}deg` },
                      { scaleX: isFlipped ? -1 : 1 },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.liveMockStream}>
                <FishImage
                  assetKey="zobaidi"
                  style={{ width: 280, height: 180, opacity: 0.65 }}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* AR Framing Overlay Guidelines (headSide adapts to flip) */}
            <FramingGuide headSide={isFlipped ? 'right' : 'left'} />

            {/* Analyzing Spinner Overlay */}
            {isAnalyzing && (
              <View style={styles.loadingScrim}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t.scanner.identifying}</Text>
              </View>
            )}
          </View>

          {/* Interactive Image Rotation & Flipping Toolbar */}
          {imageUri && (
            <View
              style={[
                styles.orientationToolbar,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <TouchableOpacity
                style={styles.orientBtn}
                onPress={handleRotate}
                activeOpacity={0.7}
                disabled={isAnalyzing}
              >
                <Ionicons name="reload" size={17} color={colors.primary} />
                <Text style={[styles.orientBtnText, { color: colors.textPrimary }]}>
                  {t.scanner.rotateCw} ({rotation}°)
                </Text>
              </TouchableOpacity>

              <View style={[styles.orientDivider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.orientBtn}
                onPress={handleFlip}
                activeOpacity={0.7}
                disabled={isAnalyzing}
              >
                <Ionicons name="swap-horizontal" size={18} color={colors.accentTeal} />
                <Text style={[styles.orientBtnText, { color: colors.textPrimary }]}>
                  {isFlipped ? t.scanner.headRight : t.scanner.headLeft}
                </Text>
              </TouchableOpacity>

              {(rotation !== 0 || isFlipped) && (
                <>
                  <View style={[styles.orientDivider, { backgroundColor: colors.border }]} />
                  <TouchableOpacity
                    style={styles.orientBtn}
                    onPress={handleResetOrientation}
                    activeOpacity={0.7}
                    disabled={isAnalyzing}
                  >
                    <Ionicons name="close-circle-outline" size={17} color={colors.textMuted} />
                    <Text style={[styles.orientBtnText, { color: colors.textMuted }]}>
                      {t.scanner.resetOrientation}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* Shutter / Capture Controls */}
        <View
          style={[
            styles.controlsRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryCaptureBtn, { backgroundColor: colors.primary }]}
            onPress={() => handlePickImage(true)}
            activeOpacity={0.8}
            disabled={isAnalyzing}
          >
            <Ionicons name="camera" size={22} color="#FFFFFF" />
            <Text style={styles.primaryCaptureText}>{t.scanner.takePhoto}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.galleryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handlePickImage(false)}
            activeOpacity={0.8}
            disabled={isAnalyzing}
          >
            <Ionicons name="images" size={20} color={colors.textPrimary} />
            <Text style={[styles.galleryBtnText, { color: colors.textPrimary }]}>
              {t.scanner.chooseGallery}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Detection Results Card */}
        {prediction && (
          <View style={styles.resultsWrapper}>
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isManuallyOverridden ? colors.accentTeal : colors.primary,
                },
              ]}
            >
              {/* Header with Match Percentage & Action Buttons */}
              <View
                style={[
                  styles.resultHeader,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View
                  style={[
                    styles.matchBadge,
                    {
                      backgroundColor: isManuallyOverridden
                        ? 'rgba(20, 184, 166, 0.15)'
                        : colors.badgeBg,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={isManuallyOverridden ? colors.accentTeal : colors.primary}
                  />
                  <Text
                    style={[
                      styles.matchConfidence,
                      { color: isManuallyOverridden ? colors.accentTeal : colors.primary },
                    ]}
                  >
                    {isManuallyOverridden
                      ? t.scanner.manuallySelected
                      : `${formatNumber(prediction.topMatch.confidence)}% ${t.scanner.confidence}`}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    style={[styles.changeSpeciesHeaderBtn, { borderColor: colors.border }]}
                    onPress={() => setShowSpeciesModal(true)}
                  >
                    <Ionicons name="options-outline" size={14} color={colors.primary} />
                    <Text style={[styles.changeSpeciesHeaderText, { color: colors.primary }]}>
                      {t.scanner.changeSpecies}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                    <Text style={[styles.resetText, { color: colors.textMuted }]}>
                      {t.scanner.retake}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Main Identified Species Profile */}
              <View
                style={[
                  styles.speciesRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={[styles.speciesVectorBox, { backgroundColor: colors.surfaceSubtle }]}>
                  <FishImage
                    assetKey={prediction.topMatch.species.assetKey}
                    style={{ width: 110, height: 74 }}
                    resizeMode="cover"
                    borderRadius={8}
                  />
                </View>

                <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.detectedTitle, { color: colors.textPrimary }]}>
                    {isRTL ? prediction.topMatch.species.nameFa : prediction.topMatch.species.nameEn}
                  </Text>
                  <Text style={[styles.detectedSub, { color: colors.textMuted }]}>
                    {prediction.topMatch.species.scientificName}
                  </Text>

                  {/* Southern Dialect Badge */}
                  {prediction.topMatch.species.regionalNames && prediction.topMatch.species.regionalNames.length > 0 && (
                    <View style={[styles.detectedDialectBadge, { backgroundColor: colors.surfaceSubtle }]}>
                      <Text style={[styles.detectedDialectText, { color: colors.accentTeal }]}>
                        {isRTL
                          ? `نام محلی جنوب: ${prediction.topMatch.species.regionalNames[0].dialectName}`
                          : `South: ${prediction.topMatch.species.regionalNames[0].dialectName}`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Distinguishing Physical Features */}
              <View style={[styles.featuresSection, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.featuresHeading, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? 'نشانه‌های بارز فیزیکی شناسایی‌شده:' : 'Distinguishing Physical Markers:'}
                </Text>
                {(isRTL
                  ? prediction.topMatch.distinguishingFeaturesFa
                  : prediction.topMatch.distinguishingFeaturesEn
                ).map((feat, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.featureBullet,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <Ionicons name="checkbox" size={14} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      {feat}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons: 4-Point Freshness Grader & Detail */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.inspectNowBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setShowFreshnessModal(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.inspectNowText}>{t.scanner.inspectNow}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailsBtn, { borderColor: colors.border }]}
                  onPress={() => onSelectFish(prediction.topMatch.species)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.detailsBtnText, { color: colors.textPrimary }]}>
                    {t.scanner.viewDetails}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Alternative Candidates */}
              {prediction.alternatives.length > 0 && (
                <View style={styles.altsSection}>
                  <Text style={[styles.altsHeading, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'گونه‌های احتمالی دیگر (تپ برای انتخاب):' : 'Alternative Candidates (Tap to select):'}
                  </Text>
                  <View
                    style={[
                      styles.altsRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    {prediction.alternatives.map((alt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.altChip, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
                        onPress={() => handleManualSelectFish(alt.species)}
                      >
                        <Text style={[styles.altChipText, { color: colors.textPrimary }]}>
                          {isRTL ? alt.species.nameFa : alt.species.nameEn} ({formatNumber(alt.confidence)}%)
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Interactive Freshness Evaluator Modal */}
      {prediction && (
        <FreshnessModal
          visible={showFreshnessModal}
          fish={prediction.topMatch.species}
          initialValues={prediction.automatedFreshnessEstimate}
          onClose={() => setShowFreshnessModal(false)}
          onNavigateToCalculator={onNavigateToCalculator}
        />
      )}

      {/* Manual Species Override & Search Modal */}
      <Modal
        visible={showSpeciesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSpeciesModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View
              style={[
                styles.modalHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {t.scanner.changeSpecies}
              </Text>
              <TouchableOpacity
                onPress={() => setShowSpeciesModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: colors.textPrimary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={t.scanner.searchSpecies}
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Species List */}
            <FlatList
              data={filteredSpecies}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.speciesListItem,
                    {
                      borderColor: colors.border,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                  onPress={() => handleManualSelectFish(item)}
                  activeOpacity={0.7}
                >
                  <FishImage
                    assetKey={item.assetKey}
                    style={{ width: 60, height: 44 }}
                    borderRadius={6}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                    <Text style={[styles.speciesListName, { color: colors.textPrimary }]}>
                      {isRTL ? item.nameFa : item.nameEn}
                    </Text>
                    <Text style={[styles.speciesListSub, { color: colors.textMuted }]}>
                      {item.scientificName}
                    </Text>
                    {item.regionalNames && item.regionalNames.length > 0 && (
                      <Text style={[styles.speciesListDialect, { color: colors.accentTeal }]}>
                        {item.regionalNames[0].dialectName}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewfinderSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  viewfinderBox: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  liveMockStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.35,
  },
  loadingScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 17, 24, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  orientationToolbar: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  orientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  orientBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orientDivider: {
    width: 1,
    height: 18,
  },
  controlsRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  primaryCaptureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryCaptureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  galleryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  galleryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  resultHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchConfidence: {
    fontSize: 12,
    fontWeight: '800',
  },
  changeSpeciesHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  changeSpeciesHeaderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resetBtn: {
    padding: 4,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  speciesRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  speciesVectorBox: {
    width: 110,
    height: 76,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  detectedTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  detectedSub: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  detectedDialectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  detectedDialectText: {
    fontSize: 11,
    fontWeight: '700',
  },
  featuresSection: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  featuresHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureBullet: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    gap: 8,
  },
  inspectNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  inspectNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  detailsBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  altsSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  altsHeading: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  altsRow: {
    gap: 8,
    flexWrap: 'wrap',
  },
  altChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  altChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  searchBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  speciesListItem: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  speciesListName: {
    fontSize: 14,
    fontWeight: '700',
  },
  speciesListSub: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  speciesListDialect: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
