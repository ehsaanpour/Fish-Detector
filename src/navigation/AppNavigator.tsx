import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { useAppLocale } from '../localization/LocaleContext';
import { HomeScreen } from '../screens/HomeScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { FishDetailScreen } from '../screens/FishDetailScreen';
import { PriceCalculatorScreen } from '../screens/PriceCalculatorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FishSpecies } from '../database/schema';
import { dbService } from '../database/dbService';
import { Ionicons } from '@expo/vector-icons';

export type TabKey = 'market' | 'scanner' | 'calculator' | 'settings';

export const AppNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { isRTL, t } = useAppLocale();

  const [activeTab, setActiveTab] = useState<TabKey>('market');
  const [selectedFish, setSelectedFish] = useState<FishSpecies | null>(null);
  const [calculatorTargetFish, setCalculatorTargetFish] = useState<FishSpecies | undefined>(undefined);

  useEffect(() => {
    dbService.initDatabase();
  }, []);

  const handleSelectFish = (fish: FishSpecies) => {
    setSelectedFish(fish);
  };

  const handleBackFromDetail = () => {
    setSelectedFish(null);
  };

  const handleNavigateToCalculator = (fish: FishSpecies) => {
    setCalculatorTargetFish(fish);
    setSelectedFish(null);
    setActiveTab('calculator');
  };

  const handleNavigateToScanner = () => {
    setSelectedFish(null);
    setActiveTab('scanner');
  };

  const tabs = [
    { key: 'market' as const, label: t.tabs.market, icon: 'storefront' },
    { key: 'scanner' as const, label: t.tabs.scanner, icon: 'camera' },
    { key: 'calculator' as const, label: t.tabs.calculator, icon: 'calculator' },
    { key: 'settings' as const, label: t.tabs.settings, icon: 'settings' },
  ];

  // In RTL mode, reverse tab display order for natural right-to-left layout
  const orderedTabs = isRTL ? [...tabs].reverse() : tabs;

  const renderActiveScreen = () => {
    if (selectedFish) {
      return (
        <FishDetailScreen
          fish={selectedFish}
          onBack={handleBackFromDetail}
          onNavigateToCalculator={handleNavigateToCalculator}
        />
      );
    }

    switch (activeTab) {
      case 'market':
        return (
          <HomeScreen
            onSelectFish={handleSelectFish}
            onNavigateToCalculator={handleNavigateToCalculator}
            onNavigateToScanner={handleNavigateToScanner}
          />
        );
      case 'scanner':
        return (
          <ScannerScreen
            onSelectFish={handleSelectFish}
            onNavigateToCalculator={handleNavigateToCalculator}
          />
        );
      case 'calculator':
        return (
          <PriceCalculatorScreen
            initialFish={calculatorTargetFish}
            onSelectFishDetail={handleSelectFish}
          />
        );
      case 'settings':
        return <SettingsScreen />;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Active Screen Area */}
      <View style={styles.contentArea}>{renderActiveScreen()}</View>

      {/* Persistent Bottom Tab Bar */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <View
          style={[
            styles.tabBarInner,
            { flexDirection: 'row' },
          ]}
        >
          {orderedTabs.map((tab) => {
            const isActive = activeTab === tab.key && !selectedFish;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  setSelectedFish(null);
                  setActiveTab(tab.key);
                }}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.tabIconWrap,
                    isActive && { backgroundColor: colors.primaryGlow },
                  ]}
                >
                  <Ionicons
                    name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
                    size={22}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors.primary : colors.textMuted,
                      fontWeight: isActive ? '800' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabBarInner: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabIconWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
