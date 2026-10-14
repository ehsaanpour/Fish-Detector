import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { dbService } from '../database/dbService';
import { FishCategory, FishSpecies } from '../database/schema';
import { FishCard } from '../components/FishCard';
import { HeaderBar } from '../components/HeaderBar';
import { FreshnessModal } from '../components/FreshnessModal';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onSelectFish: (fish: FishSpecies) => void;
  onNavigateToCalculator: (fish: FishSpecies) => void;
  onNavigateToScanner: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectFish,
  onNavigateToCalculator,
  onNavigateToScanner,
}) => {
  const { colors } = useAppTheme();
  const { isRTL, t, formatNumber } = useAppLocale();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FishCategory | 'all'>('all');
  const [inspectingFish, setInspectingFish] = useState<FishSpecies | null>(null);

  const categories = [
    { id: 'all' as const, label: t.home.allCategories, icon: 'apps' },
    { id: 'persian_gulf' as const, label: t.home.persianGulf, icon: 'sunny' },
    { id: 'caspian' as const, label: t.home.caspianSea, icon: 'water' },
    { id: 'freshwater' as const, label: t.home.freshwater, icon: 'leaf' },
    { id: 'global' as const, label: t.home.global, icon: 'globe' },
  ];

  const filteredSpecies = useMemo(() => {
    return dbService.searchSpecies(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const featuredFish = useMemo(() => {
    return dbService.getSpeciesById('zobaidi') || dbService.getAllSpecies()[0];
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: colors.textPrimary,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholder={t.home.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Category Horizontal Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.categoryScroll,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.borderSubtle,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* AI Camera Quick Action Callout */}
        <View style={styles.scannerCalloutWrapper}>
          <TouchableOpacity
            style={[
              styles.scannerBanner,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.primary,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={onNavigateToScanner}
            activeOpacity={0.88}
          >
            <View style={[styles.scannerIconBox, { backgroundColor: colors.primaryGlow }]}>
              <Ionicons name="camera" size={26} color={colors.primary} />
            </View>

            <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.scannerTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                {t.scanner.title}
              </Text>
              <Text style={[styles.scannerDesc, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t.scanner.viewfinderHint}
              </Text>
            </View>

            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Offline Species Count Header */}
        <View
          style={[
            styles.countRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            {t.home.allFishTitle}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.countBadgeText, { color: colors.primary }]}>
              {formatNumber(filteredSpecies.length)} {isRTL ? 'گونه آفلاین' : 'species'}
            </Text>
          </View>
        </View>

        {/* Fish Cards List */}
        <View style={styles.cardsList}>
          {filteredSpecies.length > 0 ? (
            filteredSpecies.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                onPress={() => onSelectFish(fish)}
                onInspectPress={() => setInspectingFish(fish)}
              />
            ))
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t.home.noResults}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Interactive Freshness Grader Modal */}
      {inspectingFish && (
        <FreshnessModal
          visible={Boolean(inspectingFish)}
          fish={inspectingFish}
          onClose={() => setInspectingFish(null)}
          onNavigateToCalculator={onNavigateToCalculator}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  categoryPillText: {
    fontSize: 12,
  },
  scannerCalloutWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scannerBanner: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
  },
  scannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  scannerDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  countRow: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardsList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
