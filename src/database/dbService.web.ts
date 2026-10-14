import { ALL_FISH_SPECIES } from './seedData';
import { FishCategory, FishSpecies, InspectionRecord } from './schema';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INSPECTION_HISTORY_KEY = '@fish_inspector_inspections';
const BOOKMARKS_KEY = '@fish_inspector_bookmarks';

export class FishDatabaseService {
  private speciesList: FishSpecies[] = ALL_FISH_SPECIES;

  async initDatabase(): Promise<void> {
    // In web mode, seed data and AsyncStorage are used directly
  }

  getAllSpecies(): FishSpecies[] {
    return this.speciesList;
  }

  getSpeciesById(id: string): FishSpecies | undefined {
    return this.speciesList.find((s) => s.id === id || s.slug === id);
  }

  getSpeciesByCategory(category: FishCategory | 'all'): FishSpecies[] {
    if (category === 'all') return this.speciesList;
    return this.speciesList.filter((s) => s.category === category);
  }

  searchSpecies(query: string, category?: FishCategory | 'all'): FishSpecies[] {
    const cleanQuery = query.trim().toLowerCase();
    let results = category && category !== 'all'
      ? this.getSpeciesByCategory(category)
      : this.speciesList;

    if (!cleanQuery) return results;

    return results.filter((fish) => {
      if (fish.nameEn.toLowerCase().includes(cleanQuery)) return true;
      if (fish.nameFa.includes(cleanQuery)) return true;
      if (fish.scientificName.toLowerCase().includes(cleanQuery)) return true;
      const matchesDialect = fish.regionalNames.some((r) =>
        r.dialectName.toLowerCase().includes(cleanQuery) ||
        r.regionFa.includes(cleanQuery)
      );
      if (matchesDialect) return true;
      if (fish.cookingMethodsFa.some((m) => m.includes(cleanQuery))) return true;
      return false;
    });
  }

  async saveInspection(record: InspectionRecord): Promise<void> {
    try {
      const existing = await this.getInspectionHistory();
      const updated = [record, ...existing.filter((r) => r.id !== record.id)];
      await AsyncStorage.setItem(INSPECTION_HISTORY_KEY, JSON.stringify(updated.slice(0, 100)));
    } catch (e) {
      console.error('Failed to save inspection:', e);
    }
  }

  async getInspectionHistory(): Promise<InspectionRecord[]> {
    try {
      const data = await AsyncStorage.getItem(INSPECTION_HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // return empty
    }
    return [];
  }

  async toggleBookmark(fishId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarkedFishIds();
      let updated: string[];
      let isBookmarked = false;
      if (bookmarks.includes(fishId)) {
        updated = bookmarks.filter((id) => id !== fishId);
      } else {
        updated = [...bookmarks, fishId];
        isBookmarked = true;
      }
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return isBookmarked;
    } catch {
      return false;
    }
  }

  async getBookmarkedFishIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const dbService = new FishDatabaseService();
