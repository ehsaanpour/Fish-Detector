import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { useAppCurrency } from '../localization/CurrencyContext';
import { dbService } from '../database/dbService';
import { HeaderBar } from '../components/HeaderBar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsScreen: React.FC = () => {
  const { colors, mode, setMode } = useAppTheme();
  const { isRTL, locale, setLocale, t, formatNumber } = useAppLocale();
  const { currency, setCurrency } = useAppCurrency();

  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    (async () => {
      const history = await dbService.getInspectionHistory();
      setScanCount(history.length);
    })();
  }, []);

  const handleClearHistory = async () => {
    try {
      await AsyncStorage.removeItem('@fish_inspector_inspections');
      setScanCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title={t.settings.title} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Language Selection Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.language}
          </Text>

          <View style={[styles.optionsGroup, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[
                styles.optionRow,
                {
                  borderBottomColor: colors.borderSubtle,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => setLocale('fa')}
            >
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                {t.settings.persian}
              </Text>
              {locale === 'fa' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              onPress={() => setLocale('en')}
            >
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                {t.settings.english}
              </Text>
              {locale === 'en' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Selection Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.theme}
          </Text>

          <View style={[styles.optionsGroup, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[
                styles.optionRow,
                {
                  borderBottomColor: colors.borderSubtle,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => setMode('light')}
            >
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sunny" size={18} color="#D97706" />
                <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                  {t.settings.themeLight}
                </Text>
              </View>
              {mode === 'light' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionRow,
                {
                  borderBottomColor: colors.borderSubtle,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => setMode('dark')}
            >
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="moon" size={18} color="#38BDF8" />
                <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                  {t.settings.themeDark}
                </Text>
              </View>
              {mode === 'dark' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              onPress={() => setMode('system')}
            >
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="phone-portrait" size={18} color={colors.textMuted} />
                <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                  {t.settings.themeSystem}
                </Text>
              </View>
              {mode === 'system' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency Selection Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.currency}
          </Text>

          <View style={[styles.optionsGroup, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[
                styles.optionRow,
                {
                  borderBottomColor: colors.borderSubtle,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => setCurrency('toman')}
            >
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                {t.settings.toman}
              </Text>
              {currency === 'toman' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              onPress={() => setCurrency('usd')}
            >
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                {t.settings.usd}
              </Text>
              {currency === 'usd' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline Fish Database & Storage Status */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.storageStatus}
          </Text>

          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <View
              style={[
                styles.statusHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="server" size={20} color={colors.success} />
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                {isRTL ? 'حافظه ۱۰۰٪ مستقل و آفلاین' : '100% Offline Relational Storage'}
              </Text>
            </View>

            <Text style={[styles.statusDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.settings.storageDetails}
            </Text>

            <View style={[styles.statRow, { borderTopColor: colors.borderSubtle }]}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {isRTL ? 'تعداد گزارش‌های بازرسی ثبت‌شده:' : 'Saved Inspections Logged:'}
              </Text>
              <Text style={[styles.statVal, { color: colors.primary }]}>
                {formatNumber(scanCount)}
              </Text>
            </View>

            {scanCount > 0 && (
              <TouchableOpacity
                onPress={handleClearHistory}
                style={[styles.clearBtn, { borderColor: colors.danger }]}
              >
                <Ionicons name="trash" size={14} color={colors.danger} />
                <Text style={[styles.clearBtnText, { color: colors.danger }]}>
                  {isRTL ? 'پاکسازی تاریخچه بازرسی‌ها' : 'Clear Inspection Logs'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Android App Store Packaging Status */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.storeReady}
          </Text>

          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <View
              style={[
                styles.statusHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="logo-android" size={20} color={colors.accentTeal} />
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                {t.settings.storeDetails}
              </Text>
            </View>

            <Text style={[styles.statusDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'پکیج بدون وابستگی به سرورهای خارجی تحریم‌شده؛ کاملاً سازگار با انتشار مستقیم در بازار، مایکت و گوگل پلی.'
                : 'Built with zero dependency on restricted remote CDNs, fully ready for Google Play (.aab) and Cafe Bazaar/Myket standalone (.apk).'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  optionsGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statusHeader: {
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
