import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  BannerAdSize,
  GAMBannerAd
} from 'react-native-google-mobile-ads';
import { useTheme } from '../contexts/ThemeContext';
import { COUNTRIES } from "../data/countries";
import AdsManager from '../services/adsManager';

export default function Country({ navigation }: any) {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);
  const searchParams = useLocalSearchParams();
  const [filtered, setFiltered] = useState(COUNTRIES);
  const [isSearch, setIsSearch] = useState(false);
  const SELECTED_COUNTRY_KEY = 'selectedCountry';
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false); // ⭐ Add loading state

  useEffect(() => {
    setFiltered(
      COUNTRIES.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  const [bannerConfig, setBannerConfig] = useState<{
    show: boolean;
    id: string;
    position: string;
  } | null>(null);

  useEffect(() => {
    const config = AdsManager.getBannerConfig('home');
    setBannerConfig(config);
  }, []);

  // ⭐ FIX 1: Add timeout to useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        loadSavedCountry();
      });
    }, [])
  );

  const loadSavedCountry = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Load timeout')), 2000)
      );
      const loadPromise = AsyncStorage.getItem(SELECTED_COUNTRY_KEY);

      const savedCountry = await Promise.race([loadPromise, timeoutPromise]) as string | null;
      
      console.log('📱 Loaded country on focus:', savedCountry);
      if (savedCountry) {
        setSelected([savedCountry]);
      } else {
        setSelected(['Afghanistan']);
      }
    } catch (error) {
      console.log('Error loading country:', error);
      setSelected(['Afghanistan']);
    }
  };

  // ⭐ FIX 2: Non-blocking back press
  const handleBackPress = async () => {
    // Navigate immediately
    if (searchParams?.from === "/") {
      router.replace("/");
    } else {
      router.back();
    }

    // ⭐ Show ad in background (fire and forget)
    InteractionManager.runAfterInteractions(() => {
      AdsManager.showBackButtonAd('country').catch(console.error);
    });
  };

  const toggleSelect = (countryName: string) => {
    const isSelected = selected.includes(countryName);

    if (isSelected) {
      if (selected.length === 1) return;
      setSelected(selected.filter((c) => c !== countryName));
    } else {
      setSelected([...selected, countryName]);
    }
  };

  // ⭐ FIX 3: Non-blocking save
  const saveCountries = async () => {
    if (isSaving) return;
    
    const selectedCountry = selected[0];
    setIsSaving(true);

    try {
      // Save immediately (with timeout)
      const savePromise = AsyncStorage.setItem(SELECTED_COUNTRY_KEY, selectedCountry);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Save timeout')), 2000)
      );

      await Promise.race([savePromise, timeoutPromise]);
      console.log('✅ Country saved:', selectedCountry);

      // Navigate immediately
      router.push({
        pathname: '/holidays',
        params: { country: selectedCountry }
      });

      // ⭐ Show ad in background
      InteractionManager.runAfterInteractions(() => {
        AdsManager.showInterstitialAd('splash_to_language').catch(console.error);
      });

    } catch (error) {
      console.log('❌ Error saving country:', error);
      // Still navigate even if save failed
      router.push({
        pathname: '/holidays',
        params: { country: selectedCountry }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCountry = ({ item }: any) => {
    const isSelected = selected.includes(item.name);

    return (
      <TouchableOpacity
        style={styles.countryItem}
        onPress={() => toggleSelect(item.name)}
      >
        <Image source={item.flag} style={styles.flag} />
        <Text style={styles.countryText}>{item.name}</Text>
        {isSelected ? (
          <Feather name="check-circle" size={22} color="#FF433A" />
        ) : (
          <MaterialCommunityIcons name="circle-outline" size={22} color="#999" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {!isSearch && (
          <>
            <View style={styles.leftContainer}>
              <TouchableOpacity
                onPress={handleBackPress}
                style={styles.backButton}>
                <Feather name="arrow-left" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                {t("select_country")}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => setIsSearch(true)} style={{ marginRight: 20 }}>
                <Feather name="search" size={24} style={[{ color: colors.textPrimary }]} />
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCountries} disabled={isSaving}>
                <Feather name="check" size={26} style={[{ color: colors.textPrimary }]} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {isSearch && (
          <View style={[styles.searchHeader, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => { setIsSearch(false); setSearch(""); }}>
              <Feather name="x" size={28} style={[{ color: colors.textPrimary }]} />
            </TouchableOpacity>
            <TextInput
              placeholder={t("search")}
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              autoFocus
            />
            <TouchableOpacity onPress={saveCountries} disabled={isSaving}>
              <Feather name="check" size={26} style={[{ color: colors.textPrimary }]} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagWrapper}>
        {selected.map((name) => (
          <View key={name} style={[styles.tag, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.tagText, { color: colors.textPrimary }]}>{name}</Text>
            {selected.length > 1 && (
              <TouchableOpacity onPress={() => toggleSelect(name)} style={{ marginLeft: 6 }}>
                <Feather name="x" size={16} style={[{ color: colors.textSecondary }]} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.name);
          return (
            <TouchableOpacity
              style={styles.countryItem}
              onPress={() => toggleSelect(item.name)}
            >
              <Image source={item.flag} style={styles.flag} />
              <Text style={[styles.countryText, { color: colors.textPrimary }]}>
                {item.name}
              </Text>
              {isSelected ? (
                <Feather name="check-circle" size={22} color="#FF433A" />
              ) : (
                <Feather name="circle" size={22} color="#ccc" />
              )}
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
      {bannerConfig?.show && (
        <View style={styles.stickyAdContainer}>
          <GAMBannerAd
            unitId={bannerConfig.id}
            sizes={[BannerAdSize.FULL_BANNER]}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 15 },
  stickyAdContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  topBar: {
    marginTop: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  texcountry: {

  },
  topTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  search: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    marginTop: 50,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },

  backIcon: {
    fontSize: 26,
    fontWeight: "600"
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    borderBottomWidth: 1.3,
    borderColor: "#ccc",
    fontSize: 17,
    paddingHorizontal: 10,
  },

  tagWrapper: {
    maxHeight: 40,
    flexShrink: 1,
    marginTop: 6,
    marginBottom: 10,
    paddingBottom: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 18,
    marginRight: 8,
    borderColor: "#FF433A",
  },

  tagText: {
    fontSize: 14,
    color: "#FF433A",
  },

  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  flag: {
    width: 30,
    height: 30,
    marginRight: 12,
    borderRadius: 4,
  },

  countryText: {
    fontSize: 16,
    flex: 1,
  },
});
