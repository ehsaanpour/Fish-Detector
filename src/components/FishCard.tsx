import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FishSpecies } from '../database/schema';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { useAppCurrency } from '../localization/CurrencyContext';
import { FishIllustration } from '../assets/illustrations/FishVectors';
import { Ionicons } from '@expo/vector-icons';

interface FishCardProps {
  fish: FishSpecies;
  onPress: () => void;
  onInspectPress?: () => void;
}

export const FishCard: React.FC<FishCardProps> = ({ fish, onPress, onInspectPress }) => {
  const { colors } = useAppTheme();
  const { isRTL, t, formatCurrency } = useAppLocale();
  const { currency, getPriceForFish } = useAppCurrency();

  const priceInfo = getPriceForFish(fish.id, fish.defaultPriceToman, fish.defaultPriceUsd);
  const formattedPrice = formatCurrency(priceInfo.price, currency);

  const getTierLabel = () => {
    switch (fish.priceTier) {
      case 'premium':
        return t.home.tierPremium;
      case 'mid':
        return t.home.tierMid;
      case 'budget':
      default:
        return t.home.tierBudget;
    }
  };

  const getTierBadgeStyle = () => {
    switch (fish.priceTier) {
      case 'premium':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'mid':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'budget':
      default:
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
    }
  };

  const tierColors = getTierBadgeStyle();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Top Row: Category & Price Tier Badges */}
      <View
        style={[
          styles.badgeRow,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <View style={[styles.tierBadge, { backgroundColor: tierColors.bg, borderColor: tierColors.border }]}>
          <Text style={[styles.tierBadgeText, { color: tierColors.text }]}>
            {getTierLabel()}
          </Text>
        </View>

        <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.textMuted }]}>
            {fish.category === 'persian_gulf'
              ? (isRTL ? 'خلیج فارس' : 'Persian Gulf')
              : fish.category === 'caspian'
              ? (isRTL ? 'دریای خزر' : 'Caspian Sea')
              : fish.category === 'freshwater'
              ? (isRTL ? 'آب شیرین' : 'Freshwater')
              : (isRTL ? 'بین‌المللی' : 'Global')}
          </Text>
        </View>
      </View>

      {/* Main Content: Illustration & Details */}
      <View
        style={[
          styles.mainContent,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {/* Offline Vector Biological Illustration */}
        <View style={[styles.illustrationBox, { backgroundColor: colors.surfaceSubtle }]}>
          <FishIllustration assetKey={fish.assetKey} width={105} height={68} primaryColor={fish.colorHex} />
        </View>

        {/* Text Info */}
        <View
          style={[
            styles.infoBox,
            {
              alignItems: isRTL ? 'flex-end' : 'flex-start',
              paddingLeft: isRTL ? 0 : 12,
              paddingRight: isRTL ? 12 : 0,
            },
          ]}
        >
          <Text
            style={[styles.name, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={1}
          >
            {isRTL ? fish.nameFa : fish.nameEn}
          </Text>

          <Text
            style={[styles.subname, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={1}
          >
            {isRTL ? fish.nameEn : fish.nameFa} • {fish.scientificName}
          </Text>

          {/* Southern Dialect Badges (If Persian Gulf) */}
          {fish.regionalNames && fish.regionalNames.length > 0 && (
            <View
              style={[
                styles.dialectRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Text style={[styles.dialectLabel, { color: colors.accentTeal }]}>
                {isRTL ? 'نام جنوب:' : 'South Dialect:'}
              </Text>
              {fish.regionalNames.slice(0, 2).map((reg, idx) => (
                <View key={idx} style={[styles.dialectChip, { backgroundColor: colors.badgeBg }]}>
                  <Text style={[styles.dialectChipText, { color: colors.badgeText }]}>
                    {reg.dialectName}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Price & Bone Rating Row */}
          <View
            style={[
              styles.priceRow,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                width: '100%',
              },
            ]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
              <Ionicons name="pricetag" size={14} color={colors.primary} style={{ marginHorizontal: 3 }} />
              <Text style={[styles.priceText, { color: colors.primary }]}>
                {formattedPrice} {t.home.perKg}
              </Text>
            </View>

            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
              <Ionicons
                name="shield-checkmark"
                size={13}
                color={fish.boneLevel <= 2 ? colors.success : colors.accentAmber}
                style={{ marginHorizontal: 2 }}
              />
              <Text
                style={[
                  styles.boneText,
                  { color: fish.boneLevel <= 2 ? colors.success : colors.accentAmber },
                ]}
              >
                {fish.boneLevel <= 1
                  ? (isRTL ? 'بی‌تیغ' : 'Boneless')
                  : fish.boneLevel <= 2
                  ? (isRTL ? 'کم‌تیغ' : 'Few Bones')
                  : (isRTL ? 'پرتیغ' : 'Has Bones')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Action Footer */}
      {onInspectPress && (
        <View
          style={[
            styles.footerRow,
            {
              borderTopColor: colors.borderSubtle,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primaryGlow }]}
            onPress={onInspectPress}
            activeOpacity={0.7}
          >
            <Ionicons name="scan-circle" size={16} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>
              {t.scanner.inspectNow}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnSecondary, { borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnSecondaryText, { color: colors.textSecondary }]}>
              {t.scanner.viewDetails}
            </Text>
            <Ionicons
              name={isRTL ? 'arrow-back' : 'arrow-forward'}
              size={14}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  mainContent: {
    alignItems: 'center',
  },
  illustrationBox: {
    width: 105,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  infoBox: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  subname: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  dialectRow: {
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
    flexWrap: 'wrap',
  },
  dialectLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  dialectChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dialectChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priceRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
  },
  boneText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
