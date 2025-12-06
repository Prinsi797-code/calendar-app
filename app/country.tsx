import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from '../contexts/ThemeContext';
import { COUNTRIES } from "../data/countries";

export default function Country({ navigation }: any) {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>(["Afghanistan"]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filtered, setFiltered] = useState(COUNTRIES);
  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    setFiltered(
      COUNTRIES.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  const toggleSelect = (countryName: string) => {
    const isSelected = selected.includes(countryName);

    if (isSelected) {
      if (selected.length === 1) return;
      setSelected(selected.filter((c) => c !== countryName));
    } else {
      setSelected([...selected, countryName]);
    }
  };

  const saveCountries = () => {
     const selectedCountry = selected[0]; // first selected country
  router.push({
    pathname: '/holidays',
    params: { country: selectedCountry }
  });
    // router.back();
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Select Country</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => setIsSearch(true)} style={{ marginRight: 20 }}>
                <Feather name="search" size={24} style={[{ color: colors.textPrimary }]} />
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCountries}>
                <Feather name="check" size={26} style={[{ color: colors.textPrimary }]} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* SEARCH MODE */}
        {isSearch && (
          <View style={[styles.searchHeader, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => { setIsSearch(false); setSearch(""); }}>
              <Feather name="x" size={28} style={[{ color: colors.textPrimary }]} />
            </TouchableOpacity>
            <TextInput
              placeholder="Search"
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              autoFocus
            />
            <TouchableOpacity onPress={saveCountries}>
              <Feather name="check" size={26} style={[{ color: colors.textPrimary }]} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Selected Tags */}
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

      {/* Country List */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 15 },

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    marginTop: 50,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },

  backIcon: {
    fontSize: 26,
    fontWeight: "600"
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    flex: 1,
    marginLeft: 15,
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
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
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
