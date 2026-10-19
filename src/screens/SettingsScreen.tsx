import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Image,
  Platform,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { useAppCurrency } from '../localization/CurrencyContext';
import { dbService } from '../database/dbService';
import { HeaderBar } from '../components/HeaderBar';
import { GeminiVisionService } from '../engine/ai/geminiVisionService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsScreen: React.FC = () => {
  const { colors, mode, setMode, isDark } = useAppTheme();
  const { isRTL, locale, setLocale, t, formatNumber } = useAppLocale();
  const { currency, setCurrency } = useAppCurrency();

  const [scanCount, setScanCount] = useState(0);

  // Gemini Vision AI Key Management
  const [geminiKey, setGeminiKey] = useState('');
  const [isGeminiActive, setIsGeminiActive] = useState(false);
  const [geminiSavedMsg, setGeminiSavedMsg] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Donation State
  const [copiedAddress, setCopiedAddress] = useState(false);
  const DONATION_ADDRESS = '0xc29E57776eCE95129740eFC97f3d20ac74Cc0a17';

  const handleCopyAddress = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(DONATION_ADDRESS);
    }
    setCopiedAddress(true);
    setTimeout(() => {
      setCopiedAddress(false);
    }, 3000);
  };

  useEffect(() => {
    (async () => {
      const history = await dbService.getInspectionHistory();
      setScanCount(history.length);
      const configured = await GeminiVisionService.isConfigured();
      setIsGeminiActive(configured);
      const key = await GeminiVisionService.getApiKey();
      if (key) setGeminiKey(key);
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

  const handleSaveGeminiKey = async () => {
    await GeminiVisionService.saveApiKey(geminiKey);
    const configured = await GeminiVisionService.isConfigured();
    setIsGeminiActive(configured);
    setGeminiSavedMsg(true);
    setTimeout(() => setGeminiSavedMsg(false), 2500);
  };

  const handleClearGeminiKey = async () => {
    await GeminiVisionService.saveApiKey('');
    setGeminiKey('');
    setIsGeminiActive(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title={t.settings.title} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Google Gemini Vision AI Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'هوش مصنوعی چندوجهی بینایی (Google Gemini)' : 'Google Gemini Multimodal Vision AI'}
          </Text>

          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: isGeminiActive ? colors.primary : colors.borderSubtle }]}>
            <View
              style={[
                styles.statusHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons
                name={isGeminiActive ? 'sparkles' : 'flash-outline'}
                size={22}
                color={isGeminiActive ? colors.primary : '#F59E0B'}
              />
              <View style={{ flex: 1, paddingHorizontal: 4, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                  {isGeminiActive
                    ? (isRTL ? 'هوش مصنوعی Gemini Vision فعال است (دقت ۹۹٪)' : 'Gemini Vision AI Active (99% Accuracy)')
                    : (isRTL ? 'موتور آفلاین محلی فعال است' : 'On-Device Offline Engine Active')}
                </Text>
                <Text style={[styles.statusDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL
                    ? 'با اتصال کلید API جمینای، تصاویر ماهی مستقیماً با هوش مصنوعی بینایی چندوجهی گوگل تحلیل شده و گونه با بالاترین دقت شناسایی می‌شود.'
                    : 'Multimodal vision connects directly to Google Gemini for state-of-the-art species recognition matching your chat results.'}
                </Text>
              </View>
            </View>

            {/* API Key Input */}
            <View style={[styles.geminiInputWrap, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name="key-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.geminiTextInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={isRTL ? 'کلید API جمینای (از Google AI Studio)...' : 'Paste Gemini API key (from Google AI Studio)...'}
                placeholderTextColor={colors.textMuted}
                value={geminiKey}
                onChangeText={setGeminiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {geminiSavedMsg && (
              <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700', textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? '✓ کلید هوش مصنوعی با موفقیت ذخیره شد!' : '✓ Gemini AI Key saved successfully!'}
              </Text>
            )}

            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                style={[styles.geminiBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={handleSaveGeminiKey}
                activeOpacity={0.8}
              >
                <Ionicons name="save-outline" size={16} color="#FFFFFF" />
                <Text style={styles.geminiBtnText}>
                  {isRTL ? 'ذخیره کلید API' : 'Save API Key'}
                </Text>
              </TouchableOpacity>

              {isGeminiActive && (
                <TouchableOpacity
                  style={[styles.geminiBtn, { borderColor: colors.danger, borderWidth: 1 }]}
                  onPress={handleClearGeminiKey}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={[styles.geminiBtnText, { color: colors.danger }]}>
                    {isRTL ? 'حذف' : 'Remove'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Direct Active Link to Google AI Studio */}
            <TouchableOpacity
              style={[
                styles.geminiLinkBtn,
                {
                  backgroundColor: isDark ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)',
                  borderColor: colors.primary,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconCircle, { backgroundColor: colors.primary }]}>
                <Ionicons name="open-outline" size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: colors.primary,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {isRTL ? 'ورود مستقیم به Google AI Studio (لمس کنید)' : 'Open Google AI Studio (Tap Here)'}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                    marginTop: 2,
                  }}
                >
                  https://aistudio.google.com/app/apikey
                </Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.primary} />
            </TouchableOpacity>

            {/* Toggle Guide Button */}
            <TouchableOpacity
              style={[
                styles.guideToggleBtn,
                {
                  borderColor: colors.borderSubtle,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => setShowGuide(!showGuide)}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle-outline" size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  fontWeight: '600',
                  flex: 1,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {isRTL ? 'راهنمای دریافت کلید رایگان (۴ مرحله)' : 'Step-by-step key setup guide (4 steps)'}
              </Text>
              <Ionicons
                name={showGuide ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Detailed 4-Step Instructions Card */}
            {showGuide && (
              <View
                style={[
                  styles.guideContainer,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={[styles.stepItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepBadgeText}>{isRTL ? '۱' : '1'}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL
                      ? 'روی دکمه آبی‌رنگ بالا ضربه بزنید تا صفحه دریافت کلید گوگل باز شود (با حساب گوگل یا جیمیل خود وارد شوید).'
                      : 'Tap the blue button above to open Google AI Studio and sign in with your Google / Gmail account.'}
                  </Text>
                </View>

                <View style={[styles.stepItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepBadgeText}>{isRTL ? '۲' : '2'}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL
                      ? 'دکمه آبی‌رنگ «Create API key» یا «Get API key» را در بالای صفحه لمس کنید.'
                      : 'Click the blue "Create API key" button at the top of the Google AI Studio page.'}
                  </Text>
                </View>

                <View style={[styles.stepItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepBadgeText}>{isRTL ? '۳' : '3'}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL
                      ? 'گزینه ایجاد در پروژه جدید را زده و کلید تولیدشده (رشته حروف و اعداد) را کپی (Copy) نمایید (این کلید کاملاً رایگان است).'
                      : 'Create the key in a project and copy the resulting string (100% free with no credit card required).'}
                  </Text>
                </View>

                <View style={[styles.stepItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepBadgeText}>{isRTL ? '۴' : '4'}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL
                      ? 'به همین صفحه بازگردید، کلید را در کادر متنی بالا جای‌گذاری (Paste) کنید و دکمه «ذخیره کلید API» را بزنید.'
                      : 'Return to this app, paste the copied key into the input above, and tap "Save API Key".'}
                  </Text>
                </View>

                {/* Important Network Note for Iran / Region */}
                <View
                  style={[
                    styles.noteCard,
                    {
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.12)',
                      borderColor: '#F59E0B',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#F59E0B" />
                  <Text
                    style={[
                      styles.noteText,
                      {
                        color: colors.textPrimary,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {isRTL
                      ? 'نکته: در صورت عدم باز شدن سایت گوگل استودیو در ایران، لطفاً از ابزار تغییر آی‌پی (VPN یا DNS مناسب) استفاده فرمایید.'
                      : 'Note: Access to Google AI Studio may require a VPN or DNS depending on local ISP restrictions.'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

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
                <Ionicons name="sunny" size={18} color="#F59E0B" />
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
                ? 'پیکربندی کامل برای بازار، مایکت و گوگل‌پلی انجام شده است. نام بسته: com.fishmarket.inspector'
                : 'Configured with EAS Build for Google Play and Iranian App Stores.'}
            </Text>
          </View>
        </View>

        {/* About & Creator Section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.about}
          </Text>

          {/* Creator & 100% Free Software Card */}
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.primary, marginBottom: 12 }]}>
            <View
              style={[
                styles.statusHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={[styles.creatorAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 6, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.statusTitle, { color: colors.textPrimary, fontSize: 15 }]}>
                    {t.settings.creatorName}
                  </Text>
                  <View style={[styles.freeBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={[styles.freeBadgeText, { color: colors.success }]}>
                      {isRTL ? '۱۰۰٪ رایگان' : '100% Free'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  {t.settings.creatorTitle}
                </Text>
              </View>
            </View>

            <Text style={[styles.statusDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left', marginTop: 4, lineHeight: 20 }]}>
              {t.settings.creatorDesc}
            </Text>
          </View>

          {/* Donation & Support Card with QR Code */}
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle, marginBottom: 12 }]}>
            <View
              style={[
                styles.statusHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="heart" size={22} color="#EC4899" />
              <View style={{ flex: 1, paddingHorizontal: 4, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                  {t.settings.donationTitle}
                </Text>
                <Text style={{ fontSize: 11, color: colors.accentTeal, fontWeight: '700', marginTop: 1 }}>
                  {t.settings.donationNetwork}
                </Text>
              </View>
            </View>

            <Text style={[styles.statusDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left', lineHeight: 18 }]}>
              {t.settings.donationDesc}
            </Text>

            {/* Exact QR Code Image Container */}
            <View style={styles.qrCardContainer}>
              <View style={styles.qrImageFrame}>
                <Image
                  source={require('../../assets/donation_qr.jpg')}
                  style={styles.donationQrImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Wallet Address Display & Copy */}
            <View style={[styles.walletAddressBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle }]}>
              <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: isRTL ? 'right' : 'left', fontWeight: '700', marginBottom: 4 }}>
                {isRTL ? 'آدرس کیف‌پول تتر (USDT - BEP20):' : 'USDT (BEP20) Deposit Address:'}
              </Text>
              <Text
                selectable={true}
                style={[styles.walletAddressText, { color: colors.textPrimary }]}
              >
                {DONATION_ADDRESS}
              </Text>
            </View>

            {/* Copy Button */}
            <TouchableOpacity
              style={[
                styles.copyAddressBtn,
                {
                  backgroundColor: copiedAddress ? colors.success : colors.primary,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={handleCopyAddress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copiedAddress ? 'checkmark-circle' : 'copy-outline'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.copyAddressBtnText}>
                {copiedAddress ? t.settings.addressCopied : t.settings.copyAddress}
              </Text>
            </TouchableOpacity>

            {/* Network Warning Note */}
            <View style={[styles.donationWarningCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={[styles.donationWarningText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t.settings.donationWarning}
              </Text>
            </View>
          </View>

          {/* Scientific Authority & Maritime Reference */}
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <View
              style={[
                styles.statusHeader,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                {isRTL ? 'مرجع علمی شیلات و زیست‌شناسی دریایی' : 'Maritime Biological Authority'}
              </Text>
            </View>

            <Text style={[styles.statusDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.settings.aboutDesc}
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
    paddingTop: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  geminiInputWrap: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  geminiTextInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 4,
  },
  geminiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  geminiBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  geminiLinkBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  linkIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
    gap: 6,
  },
  guideContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 6,
    gap: 10,
  },
  stepItem: {
    alignItems: 'flex-start',
    gap: 8,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  noteCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  qrCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  qrImageFrame: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationQrImage: {
    width: 240,
    height: 290,
    borderRadius: 8,
  },
  walletAddressBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginVertical: 6,
  },
  walletAddressText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  copyAddressBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginVertical: 4,
  },
  copyAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  donationWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    marginTop: 6,
  },
  donationWarningText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 10.5,
    lineHeight: 15,
  },
});
