// app/languages.tsx  (or wherever your screen is)

import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from '../contexts/ThemeContext';
import i18n from "../utils/i18n";

const LANGUAGES = [
  { code: "en", name: "English", flag: require("../assets/language/uk.png") },
  { code: "pt", name: "Portuguese", flag: require("../assets/language/portugal.png") },
  { code: "es", name: "Spanish", flag: require("../assets/language/spanish.png") },
  { code: "fr", name: "French", flag: require("../assets/language/french.png") },
  { code: "hi", name: "Hindi", flag: require("../assets/language/india.png") },
  { code: "de", name: "German", flag: require("../assets/language/german.png") },
  { code: "id", name: "Indonesian", flag: require("../assets/language/indonesia.png") },
  { code: "zh", name: "Chinese", flag: require("../assets/language/china.png") },
  { code: "ru", name: "Russian", flag: require("../assets/language/russia.png") },
  { code: "ko", name: "Korean", flag: require("../assets/language/korean.png") },
  { code: "it", name: "Italian", flag: require("../assets/language/italian.png") }
];

export default function LanguagesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const [selected, setSelected] = useState("en");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("appLanguage");
      if (saved) setSelected(saved);
    })();
  }, []);

  const handleSave = async () => {
    await AsyncStorage.setItem("appLanguage", selected);
    i18n.changeLanguage(selected);
    console.log(selected);
    router.replace("/");
  };


  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelected(item.code)}
      style={[styles.item, { backgroundColor: colors.cardBackground }]}
    >
      <Image source={item.flag} style={styles.flag} />

      <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>

      {/* {selected === item.code && (
        <Feather name="check" size={22} color="#FF3B30" />
      )} */}
      <View
        style={[
          styles.checkCircle,
          selected === item.code && styles.checkCircleSelected,
        ]}
      >
        {selected === item.code && (
          <Feather name="check" size={14} color="#fff" />
        )}
      </View>

    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t("language")}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.doneText, { color: '#FF3B30' }]}>
            {t("done")}
          </Text>
        </TouchableOpacity>

      </View>

      {/* LIST */}
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  item: {
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
  },

  flag: {
    width: 32,
    height: 32,
    marginRight: 15,
    borderRadius: 5,
  },
  name: {
    fontSize: 17,
    flex: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkCircleSelected: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },

});
