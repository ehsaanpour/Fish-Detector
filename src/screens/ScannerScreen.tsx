import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
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
import { calculateFreshness } from '../engine/freshnessGrader';
import { GeminiVisionService } from '../engine/ai/geminiVisionService';
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
  const { colors, isDark } = useAppTheme();
  const { isRTL, t, formatNumber, formatCurrency } = useAppLocale();

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

  // Google Gemini Vision AI Integration
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  const [showGeminiModal, setShowGeminiModal] = useState<boolean>(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>('');
  const [isUsedGemini, setIsUsedGemini] = useState<boolean>(false);
  const [analyzingStageText, setAnalyzingStageText] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    GeminiVisionService.isConfigured().then((configured) => {
      if (isMounted) setIsGeminiActive(configured);
    });
    GeminiVisionService.getApiKey().then((key) => {
      if (isMounted && key) setGeminiKeyInput(key);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
  };

  const performClassification = async (
    uri: string,
    meta?: ImageAnalysisMeta,
    rot: number = 0,
    flipped: boolean = false
  ) => {
    setIsAnalyzing(true);
    setAnalyzingStageText(t.scanner.identifying);

    const stepTimer1 = setTimeout(() => {
      setAnalyzingStageText(
        isRTL ? 'در حال ارسال تصویر به هوش مصنوعی Google Gemini...' : 'Sending photo to Google Gemini Vision AI...'
      );
    }, 2000);

    const stepTimer2 = setTimeout(() => {
      setAnalyzingStageText(
        isRTL
          ? 'تحلیل دقیق نشانه‌های زیستی، باله‌ها، آبشش و تازگی...'
          : 'Evaluating biological features, fins, gills & freshness...'
      );
    }, 5000);

    // 14-second hard safety timeout so the UI NEVER gets stuck indefinitely
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 14000);
    });

    try {
      const predPromise = classifyFishPhoto(uri, meta?.fileName, meta, {
        rotation: rot,
        isFlipped: flipped,
      });

      const pred = await Promise.race([predPromise, timeoutPromise]);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (pred) {
        setPrediction(pred);
        setIsManuallyOverridden(false);
        setIsUsedGemini(pred.detectedWithAI);
        if (pred.requiresApiKey) {
          setShowGeminiModal(true);
        }
      } else {
        // Fallback gracefully without calling network AI again
        const fallbackSpecies = ALL_FISH_SPECIES.find((f) => f.id === 'dolmi') || ALL_FISH_SPECIES[0];
        const defaultFreshness = {
          eyeState: 'prime' as const,
          gillState: 'prime' as const,
          skinState: 'prime' as const,
          fleshState: 'prime' as const,
        };
        const fallbackPred: InspectionPrediction = {
          topMatch: {
            species: fallbackSpecies,
            confidence: 50,
            distinguishingFeaturesEn: fallbackSpecies.physicalFeaturesEn,
            distinguishingFeaturesFa: fallbackSpecies.physicalFeaturesFa,
          },
          alternatives: ALL_FISH_SPECIES.filter((f) => f.id !== fallbackSpecies.id).slice(0, 2).map((s) => ({
            species: s,
            confidence: 40,
            distinguishingFeaturesEn: s.physicalFeaturesEn,
            distinguishingFeaturesFa: s.physicalFeaturesFa,
          })),
          automatedFreshnessEstimate: defaultFreshness,
          aiFreshnessResult: calculateFreshness(defaultFreshness),
          scanTimestamp: Date.now(),
          detectedWithAI: false,
        };
        setPrediction(fallbackPred);
        setShowSpeciesModal(true);
      }
    } catch {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const fallbackSpecies = ALL_FISH_SPECIES.find((f) => f.id === 'dolmi') || ALL_FISH_SPECIES[0];
      const defaultFreshness = {
        eyeState: 'prime' as const,
        gillState: 'prime' as const,
        skinState: 'prime' as const,
        fleshState: 'prime' as const,
      };
      setPrediction({
        topMatch: {
          species: fallbackSpecies,
          confidence: 50,
          distinguishingFeaturesEn: fallbackSpecies.physicalFeaturesEn,
          distinguishingFeaturesFa: fallbackSpecies.physicalFeaturesFa,
        },
        alternatives: ALL_FISH_SPECIES.filter((f) => f.id !== fallbackSpecies.id).slice(0, 2).map((s) => ({
          species: s,
          confidence: 40,
          distinguishingFeaturesEn: s.physicalFeaturesEn,
          distinguishingFeaturesFa: s.physicalFeaturesFa,
        })),
        automatedFreshnessEstimate: defaultFreshness,
        aiFreshnessResult: calculateFreshness(defaultFreshness),
        scanTimestamp: Date.now(),
        detectedWithAI: false,
      });
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
    }
  };

  const handlePickImage = async (useCamera: boolean) => {
    try {
      const pickerOptions = {
        mediaTypes: ['images' as const],
        allowsEditing: false,
        quality: 0.65,
        base64: true,
      };

      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
        } else {
          result = await ImagePicker.launchCameraAsync(pickerOptions);
        }
      } else {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;

        // Ensure base64 is available (convert blob to base64 on web if not provided)
        let b64 = asset.base64;
        if (!b64 && typeof window !== 'undefined' && uri.startsWith('blob:')) {
          try {
            const res = await fetch(uri);
            const blob = await res.blob();
            const reader = new FileReader();
            const b64Promise = new Promise<string>((resolve) => {
              reader.onloadend = () => {
                const dataUrl = reader.result as string;
                resolve(dataUrl.split(',')[1] || '');
              };
              reader.onerror = () => resolve('');
            });
            reader.readAsDataURL(blob);
            b64 = await b64Promise;
          } catch {
            // Ignore blob read error
          }
        }

        const meta: ImageAnalysisMeta = {
          fileName: asset.fileName || undefined,
          width: asset.width,
          height: asset.height,
          base64: b64 || undefined,
        };

        setImageUri(uri);
        setImageMeta(meta);
        setRotation(0);
        setIsFlipped(false);

        await performClassification(uri, meta, 0, false);
      }
    } catch {
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
    setIsUsedGemini(false);
  };

  const handleSaveGeminiKey = async () => {
    await GeminiVisionService.saveApiKey(geminiKeyInput);
    const configured = await GeminiVisionService.isConfigured();
    setIsGeminiActive(configured);
    setShowGeminiModal(false);

    // If an image is already loaded, re-classify with newly configured Gemini AI!
    if (configured && imageUri && imageMeta) {
      await performClassification(imageUri, imageMeta, rotation, isFlipped);
    }
  };

  const handleClearGeminiKey = async () => {
    await GeminiVisionService.saveApiKey('');
    setGeminiKeyInput('');
    setIsGeminiActive(false);
    setShowGeminiModal(false);
  };

  const handleManualSelectFish = useCallback(
    (selected: FishSpecies) => {
      const now = Date.now();
      const defaultFreshness = {
        eyeState: 'prime' as const,
        gillState: 'prime' as const,
        skinState: 'prime' as const,
        fleshState: 'prime' as const,
      };

      if (!prediction) {
        const pred: InspectionPrediction = {
          topMatch: {
            species: selected,
            confidence: 100,
            distinguishingFeaturesEn: selected.physicalFeaturesEn,
            distinguishingFeaturesFa: selected.physicalFeaturesFa,
          },
          alternatives: [],
          automatedFreshnessEstimate: defaultFreshness,
          aiFreshnessResult: calculateFreshness(defaultFreshness),
          scanTimestamp: now,
          detectedWithAI: false,
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
          scanTimestamp: now,
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
        {/* Gemini Vision AI Status & Quick Activation Banner */}
        <View style={styles.bannerWrap}>
          <TouchableOpacity
            style={[
              styles.geminiBanner,
              {
                backgroundColor: isGeminiActive
                  ? 'rgba(14, 165, 233, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)',
                borderColor: isGeminiActive ? colors.primary : '#F59E0B',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={() => setShowGeminiModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isGeminiActive ? 'sparkles' : 'flash-outline'}
              size={18}
              color={isGeminiActive ? colors.primary : '#F59E0B'}
            />
            <View style={{ flex: 1, paddingHorizontal: 8, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text
                style={[
                  styles.geminiBannerTitle,
                  { color: isGeminiActive ? colors.primary : '#F59E0B' },
                ]}
              >
                {isGeminiActive ? t.scanner.geminiActive : t.scanner.geminiInactive}
              </Text>
              <Text style={[styles.geminiBannerSub, { color: colors.textMuted }]}>
                {isGeminiActive
                  ? (isRTL ? 'هوش مصنوعی بینایی گوگل فعال است' : 'Google Gemini Vision connected')
                  : (isRTL ? 'کلیک برای فعال‌سازی رایگان هوش مصنوعی' : 'Tap to enable free Gemini API')}
              </Text>
            </View>
            <Ionicons
              name={isGeminiActive ? 'settings-outline' : 'chevron-forward'}
              size={16}
              color={isGeminiActive ? colors.primary : '#F59E0B'}
            />
          </TouchableOpacity>
        </View>

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

            {/* Analyzing Spinner Overlay with dynamic status and Cancel button */}
            {isAnalyzing && (
              <View style={styles.loadingScrim}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { textAlign: 'center', paddingHorizontal: 20 }]}>
                  {analyzingStageText || t.scanner.identifying}
                </Text>
                <TouchableOpacity
                  style={[styles.cancelAnalyzingBtn, { backgroundColor: colors.surface }]}
                  onPress={handleCancelAnalysis}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={15} color={colors.textSecondary} />
                  <Text style={[styles.cancelAnalyzingText, { color: colors.textSecondary }]}>
                    {isRTL ? 'انصراف' : 'Cancel'}
                  </Text>
                </TouchableOpacity>
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
                  borderColor: isManuallyOverridden
                    ? colors.accentTeal
                    : isUsedGemini
                    ? '#0284C7'
                    : colors.primary,
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
                        : isUsedGemini
                        ? 'rgba(14, 165, 233, 0.15)'
                        : colors.badgeBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={isUsedGemini ? 'sparkles' : 'checkmark-circle'}
                    size={16}
                    color={
                      isManuallyOverridden
                        ? colors.accentTeal
                        : isUsedGemini
                        ? '#0284C7'
                        : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.matchConfidence,
                      {
                        color: isManuallyOverridden
                          ? colors.accentTeal
                          : isUsedGemini
                          ? '#0284C7'
                          : colors.primary,
                      },
                    ]}
                  >
                    {isManuallyOverridden
                      ? t.scanner.manuallySelected
                      : isUsedGemini
                      ? `${t.scanner.geminiPoweredBadge} (${formatNumber(prediction.topMatch.confidence)}%)`
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

              {/* Gemini AI Freshness Assessment Card */}
              {prediction.aiFreshnessResult && (
                <View
                  style={[
                    styles.aiFreshnessCard,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: prediction.aiFreshnessResult.badgeColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.aiFreshnessHeader,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View
                      style={[
                        styles.aiFreshnessGradeBadge,
                        { backgroundColor: prediction.aiFreshnessResult.badgeColor },
                      ]}
                    >
                      <Text style={styles.aiFreshnessGradeLetter}>
                        {prediction.aiFreshnessResult.grade}
                      </Text>
                    </View>

                    <View style={{ flex: 1, paddingHorizontal: 10, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="sparkles" size={13} color="#0284C7" />
                        <Text style={[styles.aiFreshnessTitle, { color: colors.textPrimary }]}>
                          {isRTL ? 'ارزیابی تازگی هوش مصنوعی جمنای' : 'Gemini AI Freshness Assessment'}
                        </Text>
                      </View>
                      <Text style={[styles.aiFreshnessSub, { color: prediction.aiFreshnessResult.badgeColor }]}>
                        {isRTL ? prediction.aiFreshnessResult.gradeTitleFa : prediction.aiFreshnessResult.gradeTitleEn} ({formatNumber(prediction.aiFreshnessResult.score)}%)
                      </Text>
                    </View>
                  </View>

                  {/* 4 Organ Status Pills */}
                  <View style={[styles.organPillsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.organPill, { backgroundColor: colors.surface }]}>
                      <Ionicons name="eye" size={12} color={colors.primary} />
                      <Text style={[styles.organPillText, { color: colors.textSecondary }]}>
                        {isRTL ? 'چشم' : 'Eye'}: {prediction.automatedFreshnessEstimate.eyeState === 'prime' ? (isRTL ? 'عالی' : 'Prime') : prediction.automatedFreshnessEstimate.eyeState === 'good' ? (isRTL ? 'خوب' : 'Good') : (isRTL ? 'ضعیف' : 'Poor')}
                      </Text>
                    </View>
                    <View style={[styles.organPill, { backgroundColor: colors.surface }]}>
                      <Ionicons name="water" size={12} color={colors.primary} />
                      <Text style={[styles.organPillText, { color: colors.textSecondary }]}>
                        {isRTL ? 'آبشش' : 'Gills'}: {prediction.automatedFreshnessEstimate.gillState === 'prime' ? (isRTL ? 'عالی' : 'Prime') : prediction.automatedFreshnessEstimate.gillState === 'good' ? (isRTL ? 'خوب' : 'Good') : (isRTL ? 'ضعیف' : 'Poor')}
                      </Text>
                    </View>
                    <View style={[styles.organPill, { backgroundColor: colors.surface }]}>
                      <Ionicons name="sparkles" size={12} color={colors.primary} />
                      <Text style={[styles.organPillText, { color: colors.textSecondary }]}>
                        {isRTL ? 'پوست' : 'Skin'}: {prediction.automatedFreshnessEstimate.skinState === 'prime' ? (isRTL ? 'عالی' : 'Prime') : prediction.automatedFreshnessEstimate.skinState === 'good' ? (isRTL ? 'خوب' : 'Good') : (isRTL ? 'ضعیف' : 'Poor')}
                      </Text>
                    </View>
                    <View style={[styles.organPill, { backgroundColor: colors.surface }]}>
                      <Ionicons name="finger-print" size={12} color={colors.primary} />
                      <Text style={[styles.organPillText, { color: colors.textSecondary }]}>
                        {isRTL ? 'بافت' : 'Flesh'}: {prediction.automatedFreshnessEstimate.fleshState === 'prime' ? (isRTL ? 'عالی' : 'Prime') : prediction.automatedFreshnessEstimate.fleshState === 'good' ? (isRTL ? 'خوب' : 'Good') : (isRTL ? 'ضعیف' : 'Poor')}
                      </Text>
                    </View>
                  </View>

                  {/* Summary & Shelf Life */}
                  <Text style={[styles.aiFreshnessSummaryText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? prediction.aiFreshnessResult.summaryFa : prediction.aiFreshnessResult.summaryEn}
                  </Text>

                  {prediction.aiFreshnessResult.aiObservations?.daysOnIceFa && (
                    <View style={[styles.shelfLifeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Ionicons name="snow" size={13} color="#0284C7" />
                      <Text style={styles.shelfLifeText}>
                        {isRTL
                          ? `ماندگاری در یخ: ${prediction.aiFreshnessResult.aiObservations.daysOnIceFa}`
                          : `Shelf life on ice: ${prediction.aiFreshnessResult.aiObservations.daysOnIceEn || prediction.aiFreshnessResult.aiObservations.daysOnIceFa}`}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* API Key Missing Notice */}
              {prediction.requiresApiKey && (
                <View style={[styles.apiKeyMissingBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.primary }]}>
                  <Ionicons name="key-outline" size={24} color={colors.primary} />
                  <Text style={[styles.apiKeyMissingTitle, { color: colors.textPrimary }]}>
                    {isRTL ? 'فعال‌سازی هوش مصنوعی جمنای' : 'Activate Gemini Vision AI'}
                  </Text>
                  <Text style={[styles.apiKeyMissingDesc, { color: colors.textSecondary, textAlign: 'center' }]}>
                    {isRTL
                      ? 'برای تشخیص دقیق ماهی و بررسی ۴ مرحله‌ای تازگی با هوش مصنوعی، کلید رایگان جمنای را وارد کنید.'
                      : 'To enable accurate fish and 4-point freshness detection with AI, please enter your free Gemini key.'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.apiKeyMissingBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setShowGeminiModal(true)}
                  >
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                    <Text style={styles.apiKeyMissingBtnText}>
                      {isRTL ? 'تنظیم کلید رایگان هوش مصنوعی' : 'Configure Gemini API Key'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Gemini AI Live Market Valuation Card */}
              {prediction.aiPrice && (
                <View
                  style={[
                    styles.aiPriceScanCard,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: '#0284C7',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.aiPriceScanHeader,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="sparkles" size={15} color="#0284C7" />
                      <Text style={[styles.aiPriceScanTitle, { color: colors.textPrimary }]}>
                        {t.scanner.aiMarketValuation}
                      </Text>
                    </View>

                    <Text style={[styles.aiPriceScanRate, { color: '#0284C7' }]}>
                      {formatCurrency(prediction.aiPrice.pricePerKgToman, 'toman')} {t.home.perKg}
                    </Text>
                  </View>

                  {/* Price Range */}
                  <View
                    style={[
                      styles.aiPriceScanRangeRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <Ionicons name="analytics-outline" size={13} color={colors.textMuted} />
                    <Text style={[styles.aiPriceScanRangeText, { color: colors.textMuted }]}>
                      {isRTL ? 'نوسان بازار:' : 'Market Range:'} {formatCurrency(prediction.aiPrice.minPriceToman, 'toman')} {isRTL ? 'تا' : 'to'} {formatCurrency(prediction.aiPrice.maxPriceToman, 'toman')} {t.home.perKg}
                    </Text>
                  </View>

                  {/* Market Note */}
                  {Boolean(isRTL ? prediction.aiPrice.marketNotesFa : prediction.aiPrice.marketNotesEn) && (
                    <Text
                      style={[
                        styles.aiPriceScanNotes,
                        { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                      ]}
                    >
                      💡 {isRTL ? prediction.aiPrice.marketNotesFa : prediction.aiPrice.marketNotesEn}
                    </Text>
                  )}

                  {/* 1-Tap Calculate Purchase Cost Button */}
                  <TouchableOpacity
                    style={[
                      styles.aiPriceScanCalcBtn,
                      {
                        backgroundColor: colors.surface,
                        borderColor: '#0284C7',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                    onPress={() => onNavigateToCalculator(prediction.topMatch.species)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="calculator" size={15} color="#0284C7" />
                    <Text style={[styles.aiPriceScanCalcText, { color: '#0284C7' }]}>
                      {t.scanner.calculatePurchaseCost}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

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
      {prediction && showFreshnessModal && (
        <FreshnessModal
          key={`${prediction.topMatch.species.id}_${prediction.scanTimestamp}`}
          visible={showFreshnessModal}
          fish={prediction.topMatch.species}
          initialValues={prediction.automatedFreshnessEstimate}
          aiFreshnessResult={prediction.aiFreshnessResult}
          imageUri={imageUri}
          base64={imageMeta?.base64}
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

      {/* Google Gemini Vision AI Setup Modal */}
      <Modal
        visible={showGeminiModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGeminiModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View
              style={[
                styles.modalHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {t.scanner.geminiApiKeyModalTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGeminiModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.scanner.geminiApiKeyDesc}
            </Text>

            <View
              style={[
                styles.geminiInputWrap,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Ionicons name="key-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[
                  styles.geminiInput,
                  {
                    color: colors.textPrimary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={t.scanner.geminiApiKeyPlaceholder}
                placeholderTextColor={colors.textMuted}
                value={geminiKeyInput}
                onChangeText={setGeminiKeyInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={false}
              />
            </View>

            {/* Direct Active Link to Google AI Studio */}
            <TouchableOpacity
              style={[
                styles.geminiModalLinkBtn,
                {
                  backgroundColor: isDark ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)',
                  borderColor: colors.primary,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
              activeOpacity={0.7}
            >
              <Ionicons name="open-outline" size={16} color={colors.primary} />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.primary,
                  fontWeight: '700',
                  flex: 1,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {isRTL ? 'دریافت کلید رایگان از Google AI Studio (کلیک کنید)' : 'Get Free Key at Google AI Studio (Tap Here)'}
              </Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color={colors.primary} />
            </TouchableOpacity>

            {/* Quick 3-Step Guide */}
            <View
              style={[
                styles.geminiModalGuide,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.geminiModalGuideText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL
                  ? '۱. روی دکمه آبی بالا بزنید و با جیمیل وارد شوید.\n۲. دکمه «Create API key» را بزنید و کلید را کپی کنید.\n۳. کلید را در کادر بالا چسبانده و دکمه ذخیره را بزنید.\n(در صورت نیاز در ایران از VPN یا DNS استفاده فرمایید)'
                  : '1. Tap the button above & sign in with Gmail.\n2. Click "Create API key" and copy the key.\n3. Paste it in the box above and tap Save.\n(Note: May require VPN depending on your ISP)'}
              </Text>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.geminiSaveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveGeminiKey}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                <Text style={styles.geminiSaveBtnText}>{t.scanner.saveApiKey}</Text>
              </TouchableOpacity>

              {isGeminiActive && (
                <TouchableOpacity
                  style={[styles.geminiClearBtn, { borderColor: colors.border }]}
                  onPress={handleClearGeminiKey}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.geminiClearBtnText, { color: '#EF4444' }]}>
                    {t.scanner.clearApiKey}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
  bannerWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  geminiBanner: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 10,
  },
  geminiBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  geminiBannerSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  viewfinderSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  cancelAnalyzingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 8,
  },
  cancelAnalyzingText: {
    fontSize: 12,
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
  // Gemini AI Freshness Card
  aiFreshnessCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  aiFreshnessHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  aiFreshnessGradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiFreshnessGradeLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  aiFreshnessTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  aiFreshnessSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  organPillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  organPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  organPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  aiFreshnessSummaryText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  shelfLifeRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  shelfLifeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  apiKeyMissingBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  apiKeyMissingTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  apiKeyMissingDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 6,
  },
  apiKeyMissingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  apiKeyMissingBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '82%',
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
  modalDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
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
  geminiInputWrap: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  geminiInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  geminiHintText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 16,
  },
  geminiModalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  geminiModalGuide: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 14,
  },
  geminiModalGuideText: {
    fontSize: 11,
    lineHeight: 18,
  },
  modalActionRow: {
    gap: 8,
  },
  geminiSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  geminiSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  geminiClearBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  geminiClearBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  aiPriceScanCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  aiPriceScanHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiPriceScanTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  aiPriceScanRate: {
    fontSize: 14,
    fontWeight: '900',
  },
  aiPriceScanRangeRow: {
    alignItems: 'center',
    gap: 5,
  },
  aiPriceScanRangeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  aiPriceScanNotes: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  aiPriceScanCalcBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  aiPriceScanCalcText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
