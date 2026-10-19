import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { useAppCurrency } from '../localization/CurrencyContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
}) => {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { isRTL, locale, toggleLocale, t } = useAppLocale();
  const { currency, toggleCurrency } = useAppCurrency();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderSubtle,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View
        style={[
          styles.titleContainer,
          {
            alignItems: 'center',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, isRTL ? { marginLeft: 10 } : { marginRight: 10 }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../../assets/app_logo.png')}
            style={[styles.appLogo, isRTL ? { marginLeft: 10 } : { marginRight: 10 }]}
            resizeMode="contain"
          />
        )}
        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.title, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {title || t.appName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {subtitle || t.appSubtitle}
          </Text>
        </View>
      </View>

      {/* Quick Action Controls: Language, Currency, Theme */}
      <View
        style={[
          styles.controlsContainer,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {/* Currency Switcher */}
        <TouchableOpacity
          onPress={toggleCurrency}
          style={[styles.pillButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.primary }]}>
            {currency === 'toman' ? (isRTL ? 'تومان' : 'TMN') : '$ USD'}
          </Text>
        </TouchableOpacity>

        {/* Language Switcher */}
        <TouchableOpacity
          onPress={toggleLocale}
          style={[styles.pillButton, { backgroundColor: colors.badgeBg, borderColor: colors.primaryLight }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, { color: colors.badgeText, fontWeight: '700' }]}>
            {locale === 'fa' ? 'EN' : 'فا'}
          </Text>
        </TouchableOpacity>

        {/* Day / Night Theme Switcher */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.iconButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={isDark ? '#FACC15' : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  appLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  controlsContainer: {
    alignItems: 'center',
    gap: 6,
  },
  pillButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
