import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { useAppCurrency } from '../localization/CurrencyContext';
import { dbService } from '../database/dbService';
import { FishSpecies } from '../database/schema';
import { calculateFishCost } from '../engine/priceCalculator';
import { HeaderBar } from '../components/HeaderBar';
import { FishImage } from '../components/FishImage';
import { Ionicons } from '@expo/vector-icons';

interface PriceCalculatorScreenProps {
  initialFish?: FishSpecies;
  onSelectFishDetail?: (fish: FishSpecies) => void;
}

export const PriceCalculatorScreen: React.FC<PriceCalculatorScreenProps> = ({
  initialFish,
  onSelectFishDetail,
}) => {
  const { colors } = useAppTheme();
  const { isRTL, t, formatNumber, formatCurrency } = useAppLocale();
  const {
    currency,
    getPriceForFish,
    refreshAiPriceForFish,
    isRefreshingAiPrice,
    clearCustomPrice,
  } = useAppCurrency();

  const allSpecies = dbService.getAllSpecies();
  const [selectedFish, setSelectedFish] = useState<FishSpecies>(
    initialFish || allSpecies[0]
  );
  const [weightInputGrams, setWeightInputGrams] = useState('1000'); // default 1kg
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const numericGrams = parseInt(weightInputGrams.replace(/[^0-9]/g, ''), 10) || 0;
  const priceInfo = getPriceForFish(
    selectedFish.id,
    selectedFish.defaultPriceToman,
    selectedFish.defaultPriceUsd
  );

  const calcResult = calculateFishCost(
    numericGrams,
    priceInfo.priceToman,
    priceInfo.priceUsd
  );

  const quickWeights = [
    { label: isRTL ? '۵۰۰ گرم' : '500g', grams: 500 },
    { label: isRTL ? '۱ کیلو' : '1 kg', grams: 1000 },
    { label: isRTL ? '۱.۵ کیلو' : '1.5 kg', grams: 1500 },
    { label: isRTL ? '۲ کیلو' : '2 kg', grams: 2000 },
    { label: isRTL ? '۳ کیلو' : '3 kg', grams: 3000 },
    { label: isRTL ? '۵ کیلو' : '5 kg', grams: 5000 },
  ];

  const filteredPickerSpecies = allSpecies.filter((f) => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      f.nameFa.includes(q) ||
      f.nameEn.toLowerCase().includes(q) ||
      f.regionalNames.some((r) => r.dialectName.toLowerCase().includes(q))
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title={t.calculator.title} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Selected Fish Selector Box */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.calculator.selectFish}
          </Text>

          <TouchableOpacity
            style={[
              styles.fishSelectorCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSubtle,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={() => setIsPickerVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.fishIconWrap, { backgroundColor: colors.surfaceSubtle }]}>
              <FishImage
                assetKey={selectedFish.assetKey}
                style={{ width: 70, height: 45 }}
                resizeMode="cover"
                borderRadius={8}
              />
            </View>

            <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.fishName, { color: colors.textPrimary }]}>
                {isRTL ? selectedFish.nameFa : selectedFish.nameEn}
              </Text>
              <Text style={[styles.fishRate, { color: colors.primary }]}>
                {formatCurrency(priceInfo.price, currency)} {t.home.perKg}
              </Text>
            </View>

            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Gemini AI Live Market Card */}
        <View style={styles.sectionWrap}>
          <View
            style={[
              styles.aiPriceCard,
              {
                backgroundColor: colors.surface,
                borderColor: priceInfo.isAi ? '#0284C7' : colors.borderSubtle,
              },
            ]}
          >
            {/* Header: AI Badge & Refresh Button */}
            <View
              style={[
                styles.aiPriceHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View
                style={[
                  styles.aiBadgeTag,
                  {
                    backgroundColor: priceInfo.isCustom
                      ? colors.badgeBg
                      : 'rgba(2, 132, 199, 0.12)',
                  },
                ]}
              >
                <Ionicons
                  name={priceInfo.isCustom ? 'create-outline' : 'sparkles'}
                  size={14}
                  color={priceInfo.isCustom ? colors.badgeText : '#0284C7'}
                />
                <Text
                  style={[
                    styles.aiBadgeTagText,
                    { color: priceInfo.isCustom ? colors.badgeText : '#0284C7' },
                  ]}
                >
                  {priceInfo.isCustom
                    ? (isRTL ? 'نرخ دستی کاربر' : 'Custom User Price')
                    : t.calculator.aiMarketRateBadge}
                </Text>
              </View>

              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                {priceInfo.isCustom && (
                  <TouchableOpacity
                    style={[styles.resetCustomBtn, { backgroundColor: colors.surfaceSubtle }]}
                    onPress={() => clearCustomPrice(selectedFish.id)}
                  >
                    <Text style={[styles.resetCustomBtnText, { color: colors.textMuted }]}>
                      {t.calculator.resetCustomPrice}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.refreshAiBtn,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => refreshAiPriceForFish(selectedFish)}
                  disabled={isRefreshingAiPrice}
                >
                  {isRefreshingAiPrice ? (
                    <ActivityIndicator size="small" color="#0284C7" />
                  ) : (
                    <>
                      <Ionicons name="sync" size={13} color="#0284C7" />
                      <Text style={[styles.refreshAiBtnText, { color: '#0284C7' }]}>
                        {t.calculator.refreshAiPrice}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Range */}
            {priceInfo.minPriceToman && priceInfo.maxPriceToman ? (
              <View
                style={[
                  styles.priceRangeRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Ionicons name="analytics-outline" size={14} color="#0284C7" />
                <Text style={[styles.priceRangeLabel, { color: colors.textMuted }]}>
                  {t.calculator.marketRange}:
                </Text>
                <Text style={[styles.priceRangeValue, { color: colors.textPrimary }]}>
                  {formatCurrency(priceInfo.minPriceToman, 'toman')} {isRTL ? 'تا' : 'to'} {formatCurrency(priceInfo.maxPriceToman, 'toman')} {t.home.perKg}
                </Text>
              </View>
            ) : null}

            {/* AI Market Notes / Context */}
            {Boolean(isRTL ? priceInfo.marketNotesFa : priceInfo.marketNotesEn) && (
              <View
                style={[
                  styles.aiNotesBox,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Text
                  style={[
                    styles.aiNotesText,
                    {
                      color: colors.textSecondary,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  💡 {isRTL ? priceInfo.marketNotesFa : priceInfo.marketNotesEn}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Weight Input Box */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.calculator.enterWeight} ({t.calculator.grams})
          </Text>

          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Ionicons name="scale" size={22} color={colors.primary} />
            <TextInput
              style={[
                styles.weightInput,
                {
                  color: colors.textPrimary,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              keyboardType="numeric"
              value={weightInputGrams}
              onChangeText={setWeightInputGrams}
              placeholder="1000"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.gramsLabel, { color: colors.textMuted }]}>
              {formatNumber(calcResult.grossWeightKg)} {t.calculator.kg}
            </Text>
          </View>

          {/* Quick Preset Chips */}
          <View style={styles.quickWeightsRow}>
            <Text style={[styles.quickLabel, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.calculator.quickWeight}
            </Text>
            <View
              style={[
                styles.chipsContainer,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {quickWeights.map((qw) => {
                const isSelected = numericGrams === qw.grams;
                return (
                  <TouchableOpacity
                    key={qw.grams}
                    onPress={() => setWeightInputGrams(String(qw.grams))}
                    style={[
                      styles.weightChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.weightChipText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {qw.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Live Cost Output Card */}
        <View style={styles.sectionWrap}>
          <View
            style={[
              styles.costCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.costHeading, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.calculator.estimatedCost}
            </Text>

            {/* Primary Currency Amount */}
            <Text
              style={[
                styles.primaryAmount,
                { color: colors.primary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {currency === 'toman'
                ? formatCurrency(calcResult.totalToman, 'toman')
                : formatCurrency(calcResult.totalUsd, 'usd')}
            </Text>

            {/* Secondary Currency Equivalent */}
            <Text
              style={[
                styles.secondaryAmount,
                { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {currency === 'toman'
                ? `≈ ${formatCurrency(calcResult.totalUsd, 'usd')}`
                : `≈ ${formatCurrency(calcResult.totalToman, 'toman')}`}
            </Text>

            {/* Yield & Net Weight Breakdown */}
            <View style={[styles.yieldBox, { backgroundColor: colors.surfaceSubtle }]}>
              <View
                style={[
                  styles.yieldRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Text style={[styles.yieldLabel, { color: colors.textSecondary }]}>
                  {isRTL ? 'وزن ناخالص ترازو:' : 'Gross Scale Weight:'}
                </Text>
                <Text style={[styles.yieldVal, { color: colors.textPrimary }]}>
                  {formatNumber(calcResult.grossWeightKg)} {t.calculator.kg}
                </Text>
              </View>

              <View
                style={[
                  styles.yieldRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Text style={[styles.yieldLabel, { color: colors.textSecondary }]}>
                  {isRTL ? 'گوشت خالص مفید (پس از تمیزکردن):' : 'Estimated Net Clean Meat:'}
                </Text>
                <Text style={[styles.yieldVal, { color: colors.success }]}>
                  ≈ {formatNumber(calcResult.netWeightKg)} {t.calculator.kg}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Market Shopping Tip */}
        <View style={styles.sectionWrap}>
          <View style={[styles.tipCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle }]}>
            <View
              style={[
                styles.tipHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="bulb" size={18} color={colors.accentAmber} />
              <Text style={[styles.tipTitle, { color: colors.accentAmber }]}>
                {t.calculator.vendorTips}
              </Text>
            </View>
            <Text style={[styles.tipBody, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.calculator.tipText}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fish Picker Modal */}
      <Modal visible={isPickerVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: colors.borderSubtle,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {t.calculator.selectFish}
              </Text>
              <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Picker Search */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <TextInput
                style={[
                  styles.pickerInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                placeholder={t.home.searchPlaceholder}
                placeholderTextColor={colors.textMuted}
                value={pickerSearch}
                onChangeText={setPickerSearch}
              />
            </View>

            <FlatList
              data={filteredPickerSpecies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const itemPriceInfo = getPriceForFish(
                  item.id,
                  item.defaultPriceToman,
                  item.defaultPriceUsd
                );
                return (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      {
                        borderBottomColor: colors.borderSubtle,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                    onPress={() => {
                      setSelectedFish(item);
                      setIsPickerVisible(false);
                    }}
                  >
                    <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                      <Text style={[styles.pickerItemName, { color: colors.textPrimary }]}>
                        {isRTL ? item.nameFa : item.nameEn}
                      </Text>
                      <Text style={[styles.pickerItemSub, { color: colors.textMuted }]}>
                        {item.scientificName}
                      </Text>
                    </View>
                    <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                      <Text style={[styles.pickerItemPrice, { color: itemPriceInfo.isAi ? '#0284C7' : colors.primary }]}>
                        {formatCurrency(itemPriceInfo.price, currency)}
                      </Text>
                      {itemPriceInfo.isAi && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
                          <Ionicons name="sparkles" size={10} color="#0284C7" />
                          <Text style={{ fontSize: 10, color: '#0284C7', fontWeight: '700' }}>
                            {isRTL ? 'هوش مصنوعی' : 'AI Rate'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
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
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  fishSelectorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  fishIconWrap: {
    width: 70,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishName: {
    fontSize: 15,
    fontWeight: '800',
  },
  fishRate: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  inputBox: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
  },
  weightInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  gramsLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickWeightsRow: {
    marginTop: 10,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipsContainer: {
    gap: 6,
    flexWrap: 'wrap',
  },
  weightChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  weightChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  costCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  costHeading: {
    fontSize: 12,
    fontWeight: '700',
  },
  primaryAmount: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  secondaryAmount: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  yieldBox: {
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  yieldRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  yieldVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  tipCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  tipHeader: {
    alignItems: 'center',
    gap: 6,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  tipBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pickerInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  pickerItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickerItemSub: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  pickerItemPrice: {
    fontSize: 12,
    fontWeight: '800',
  },
  aiPriceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  aiPriceHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  refreshAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  refreshAiBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resetCustomBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  resetCustomBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceRangeRow: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  priceRangeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceRangeValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  aiNotesBox: {
    borderRadius: 10,
    padding: 10,
    marginTop: 2,
  },
  aiNotesText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
