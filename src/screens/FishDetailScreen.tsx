import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { FishSpecies } from '../database/schema';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { useAppCurrency } from '../localization/CurrencyContext';
import { dbService } from '../database/dbService';
import { HeaderBar } from '../components/HeaderBar';
import { FreshnessModal } from '../components/FreshnessModal';
import { FishImage } from '../components/FishImage';
import { Ionicons } from '@expo/vector-icons';

interface FishDetailScreenProps {
  fish: FishSpecies;
  onBack: () => void;
  onNavigateToCalculator: (fish: FishSpecies) => void;
}

export const FishDetailScreen: React.FC<FishDetailScreenProps> = ({
  fish,
  onBack,
  onNavigateToCalculator,
}) => {
  const { colors } = useAppTheme();
  const { isRTL, t, formatCurrency, formatNumber } = useAppLocale();
  const { currency, getPriceForFish, updateCustomPrice } = useAppCurrency();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [highlightZone, setHighlightZone] = useState<'eyes' | 'gills' | 'skin' | 'flesh' | null>(null);
  const [showFreshnessModal, setShowFreshnessModal] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');

  const priceInfo = getPriceForFish(fish.id, fish.defaultPriceToman, fish.defaultPriceUsd);

  useEffect(() => {
    (async () => {
      const bookmarks = await dbService.getBookmarkedFishIds();
      setIsBookmarked(bookmarks.includes(fish.id));
    })();
  }, [fish.id]);

  const handleToggleBookmark = async () => {
    const bookmarked = await dbService.toggleBookmark(fish.id);
    setIsBookmarked(bookmarked);
  };

  const handleSavePrice = async () => {
    const parsed = parseInt(customPriceInput.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      await updateCustomPrice(fish.id, parsed);
      setIsEditingPrice(false);
    }
  };

  const anatomicalZones = [
    { key: 'eyes', label: t.scanner.eyes, icon: 'eye' },
    { key: 'gills', label: t.scanner.gills, icon: 'water' },
    { key: 'skin', label: t.scanner.skin, icon: 'sparkles' },
    { key: 'flesh', label: t.scanner.flesh, icon: 'finger-print' },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar
        title={isRTL ? fish.nameFa : fish.nameEn}
        subtitle={fish.scientificName}
        showBack
        onBack={onBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Large Hero Card with Real Fish Photograph */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View style={[styles.illustrationWrap, { width: '100%', height: 220 }]}>
            <FishImage
              assetKey={fish.assetKey}
              style={{ width: '100%', height: 220 }}
              resizeMode="contain"
              borderRadius={16}
              highlightZone={highlightZone}
            />
          </View>

          <View style={[styles.photoBadgeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="camera" size={13} color={colors.accentTeal} />
            <Text style={[styles.photoBadgeText, { color: colors.textMuted }]}>
              {isRTL ? 'تصویر زیستی واقعی گونه' : 'Authentic Specimen Photograph'}
            </Text>
          </View>

          {/* Interactive Inspection Point Toggles */}
          <View
            style={[
              styles.zonePillRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {anatomicalZones.map((z) => {
              const isSelected = highlightZone === z.key;
              return (
                <TouchableOpacity
                  key={z.key}
                  onPress={() => setHighlightZone(isSelected ? null : z.key)}
                  style={[
                    styles.zonePill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={z.icon as any}
                    size={12}
                    color={isSelected ? '#FFFFFF' : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.zonePillText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {z.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Nomenclature & Dialect Card */}
        <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View
            style={[
              styles.cardHeaderRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t.details.southernDialects}
            </Text>
            <TouchableOpacity onPress={handleToggleBookmark}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? colors.accentAmber : colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Southern Regional Names Chips */}
          <View
            style={[
              styles.dialectsGrid,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {fish.regionalNames.map((r, idx) => (
              <View
                key={idx}
                style={[
                  styles.regionBox,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.regionName, { color: colors.accentTeal }]}>
                  {r.regionFa}
                </Text>
                <Text style={[styles.dialectValue, { color: colors.textPrimary }]}>
                  {r.dialectName}
                </Text>
              </View>
            ))}
          </View>

          {/* Scientific & Official Standard */}
          <View style={[styles.metaRow, { borderTopColor: colors.borderSubtle }]}>
            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                {t.details.scientificName}
              </Text>
              <Text style={[styles.metaVal, { color: colors.textPrimary, fontStyle: 'italic' }]}>
                {fish.scientificName}
              </Text>
            </View>

            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start', marginTop: 8 }}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                {t.details.standardPersian}
              </Text>
              <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                {fish.nameFa}
              </Text>
            </View>
          </View>
        </View>

        {/* Meat Quality, Bone Structure & Texture Card */}
        <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.details.culinaryProfile}
          </Text>

          {/* Bone Density Gauge */}
          <View style={styles.gaugeSection}>
            <View
              style={[
                styles.gaugeHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.gaugeLabel, { color: colors.textSecondary }]}>
                {t.details.boneStructure}
              </Text>
              <Text style={[styles.boneDesc, { color: fish.boneLevel <= 2 ? colors.success : colors.accentAmber }]}>
                {isRTL ? fish.boneDescFa : fish.boneDescEn}
              </Text>
            </View>
            <View
              style={[
                styles.boneBarsRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {[1, 2, 3, 4, 5].map((lvl) => {
                const filled = lvl <= fish.boneLevel;
                const barColor =
                  fish.boneLevel <= 2 ? colors.success : fish.boneLevel <= 3 ? colors.accentAmber : colors.danger;
                return (
                  <View
                    key={lvl}
                    style={[
                      styles.boneBar,
                      {
                        backgroundColor: filled ? barColor : colors.surfaceSubtle,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Texture & Flavor */}
          <View style={[styles.profileRow, { borderTopColor: colors.borderSubtle }]}>
            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                {t.details.texture}
              </Text>
              <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                {isRTL ? fish.meatTextureFa : fish.meatTextureEn}
              </Text>
            </View>

            <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start', marginTop: 10 }}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                {t.details.flavor}
              </Text>
              <Text style={[styles.metaVal, { color: colors.textPrimary }]}>
                {isRTL ? fish.flavorProfileFa : fish.flavorProfileEn}
              </Text>
            </View>
          </View>

          {/* Recommended Cooking Methods */}
          <View style={[styles.recipesBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.recipesTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.details.cookingMethods}
            </Text>
            <View
              style={[
                styles.recipeChipsRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {(isRTL ? fish.cookingMethodsFa : fish.cookingMethodsEn).map((m, idx) => (
                <View key={idx} style={[styles.recipeChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="flame" size={13} color={colors.accentAmber} />
                  <Text style={[styles.recipeChipText, { color: colors.textPrimary }]}>
                    {m}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Market Price & Local Edit Card */}
        <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View
            style={[
              styles.cardHeaderRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t.details.marketPrice}
            </Text>
            <TouchableOpacity
              onPress={() => setIsEditingPrice(!isEditingPrice)}
              style={[styles.editPriceBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Ionicons name="create-outline" size={15} color={colors.primary} />
              <Text style={[styles.editPriceText, { color: colors.primary }]}>
                {t.details.customPrice}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.priceDisplayRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.bigPrice, { color: colors.primary }]}>
              {formatCurrency(priceInfo.price, currency)}
            </Text>
            <Text style={[styles.perKgUnit, { color: colors.textMuted }]}>
              {t.home.perKg}
            </Text>
            {priceInfo.isCustom && (
              <View style={[styles.customBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.customBadgeText, { color: colors.badgeText }]}>
                  {isRTL ? 'نرخ کاربر' : 'Custom'}
                </Text>
              </View>
            )}
          </View>

          {isEditingPrice && (
            <View style={[styles.priceEditForm, { borderTopColor: colors.borderSubtle }]}>
              <Text style={[styles.metaLabel, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'نرخ جدید به تومان:' : 'New Price in Toman:'}
              </Text>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                keyboardType="numeric"
                placeholder="مثلاً: 850000"
                placeholderTextColor={colors.textMuted}
                value={customPriceInput}
                onChangeText={setCustomPriceInput}
              />
              <TouchableOpacity
                onPress={handleSavePrice}
                style={[styles.savePriceBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.savePriceBtnText}>{t.details.saveCustomPrice}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Row */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.actionPrimary, { backgroundColor: colors.primary }]}
            onPress={() => setShowFreshnessModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.actionPrimaryText}>{t.scanner.inspectNow}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionSecondary, { backgroundColor: colors.surface, borderColor: colors.primary }]}
            onPress={() => onNavigateToCalculator(fish)}
            activeOpacity={0.85}
          >
            <Ionicons name="calculator" size={20} color={colors.primary} />
            <Text style={[styles.actionSecondaryText, { color: colors.primary }]}>
              {t.scanner.calculateCost}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Freshness Modal */}
      <FreshnessModal
        visible={showFreshnessModal}
        fish={fish}
        onClose={() => setShowFreshnessModal(false)}
        onNavigateToCalculator={onNavigateToCalculator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  illustrationWrap: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadgeRow: {
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginBottom: 4,
  },
  photoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  zonePillRow: {
    marginTop: 12,
    gap: 6,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  zonePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  contentCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  dialectsGrid: {
    gap: 8,
    flexWrap: 'wrap',
  },
  regionBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 100,
  },
  regionName: {
    fontSize: 10,
    fontWeight: '700',
  },
  dialectValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  metaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  gaugeSection: {
    marginTop: 8,
  },
  gaugeHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gaugeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  boneDesc: {
    fontSize: 11,
    fontWeight: '700',
  },
  boneBarsRow: {
    marginTop: 6,
    gap: 4,
  },
  boneBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  profileRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  recipesBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
  },
  recipesTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  recipeChipsRow: {
    gap: 6,
    flexWrap: 'wrap',
  },
  recipeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  recipeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editPriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editPriceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priceDisplayRow: {
    alignItems: 'baseline',
    gap: 6,
  },
  bigPrice: {
    fontSize: 22,
    fontWeight: '900',
  },
  perKgUnit: {
    fontSize: 13,
    fontWeight: '600',
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priceEditForm: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  priceInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  savePriceBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  savePriceBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomActions: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  actionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  actionSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
