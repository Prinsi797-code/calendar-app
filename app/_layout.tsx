import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Image, InteractionManager, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function CustomHeader() {
  const navigation = useNavigation();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const formatDate = (d) => (d < 10 ? `0${d}` : d);
  const { currentYear } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.backButton}
        >
          <Feather name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {currentYear}
        </Text>
      </View>

      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/search')}
        >
          <Feather
            name="search"
            size={22}
            color={theme === 'dark' ? colors.white : colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={[styles.dateBox]}>
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {formatDate(new Date().getDate())}
          </Text>
        </View>
      </View>
    </View>
  );
}

function FirstDaySelector({ visible, onClose, onSelect }: any) {
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const { t } = useTranslation();
  
  React.useEffect(() => {
    loadFirstDay();
  }, [visible]);

  const loadFirstDay = async () => {
    try {
      const day = await AsyncStorage.getItem('firstDayOfWeek');
      if (day) {
        setSelectedDay(parseInt(day));
      }
    } catch (error) {
      console.log('Error loading first day:', error);
    }
  };

  const handleOk = async () => {
    try {
      await AsyncStorage.setItem('firstDayOfWeek', selectedDay.toString());
      onSelect(selectedDay);
      onClose();
    } catch (error) {
      console.log('Error saving first day:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.firstDayModal, { backgroundColor: colors.background }]}>
          <Text style={[styles.firstDayTitle, { color: colors.textPrimary }]}>
            {t("first_day_of_week")}
          </Text>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedDay(0)}
          >
            <View style={[styles.radioCircle, { borderColor: colors.border }]}>
              {selectedDay === 0 && (
                <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: colors.textPrimary }]}>{t("Sunday")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedDay(1)}
          >
            <View style={[styles.radioCircle, { borderColor: colors.border }]}>
              {selectedDay === 1 && (
                <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: colors.textPrimary }]}>{t("Monday")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedDay(6)}
          >
            <View style={[styles.radioCircle, { borderColor: colors.border }]}>
              {selectedDay === 6 && (
                <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: colors.textPrimary }]}>{t("Saturday")}</Text>
          </TouchableOpacity>

          <View style={styles.firstDayButtons}>
            <TouchableOpacity
              style={[styles.firstDayButton, { backgroundColor: colors.cardBackground }]}
              onPress={onClose}
            >
              <Text style={[styles.firstDayButtonText, { color: colors.textPrimary }]}>
                {t("cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.firstDayButton, { backgroundColor: colors.primary }]}
              onPress={handleOk}
            >
              <Text style={[styles.firstDayButtonText, { color: '#FFFFFF' }]}>
                {t("ok")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DrawerContent({ navigation }: any) {
  const router = useRouter();
  const { colors } = useTheme();
  const [showFirstDaySelector, setShowFirstDaySelector] = useState(false);
  const currentYear = new Date().getFullYear();
  const today = new Date();

  const currentDate =
    today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();

  const currentDay = today.toLocaleDateString("en-US", { weekday: "long" });
  const currentMonthName = today.toLocaleDateString("en-US", { month: "long" });

  const { t } = useTranslation();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = new Date().getMonth();

  const handleYearClick = () => {
    router.push('/year-view');
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleMonthClick = () => {
    router.push('/(tabs)');
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleHolidaysClick = () => {
    router.push('/holidays');
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleWeekClick = () => {
    router.push('/week');
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    navigation.dispatch(DrawerActions.closeDrawer());
  };
  
  const handleCountryClick = () => {
    router.push("/country");
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handlelanguageClick = () => {
    router.push("/language");
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleFirstDayClick = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
    InteractionManager.runAfterInteractions(() => {
      setShowFirstDaySelector(true);
    });
  };

  const handleFirstDaySelect = (day: number) => {
    global.firstDayChanged?.(day);
  };

  return (
    <>
      <ScrollView style={[styles.drawerContent, { backgroundColor: colors.background }]}>
        <View style={styles.drawerHeader}>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={[styles.dateNumber, { color: colors.textPrimary }]}>{currentDate}</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.dayText, { color: colors.textPrimary }]}>
                {t(currentDay)}
              </Text>
              <Text style={[styles.monthYearText, { color: colors.textTertiary }]}>
                {t(currentMonthName)} {currentYear}
              </Text>
            </View>
          </View>
          <View style={styles.separator} />
        </View>

        <TouchableOpacity style={[styles.menuItem]} onPress={handleYearClick}>
          <Image
            source={require('../assets/icons/Vector.png')}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{t("year")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem]} onPress={handleMonthClick}>
          <Image
            source={require('../assets/icons/Vector1.png')}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{t("month")}</Text>
          <Text style={[styles.menuSubtext, { color: colors.textTertiary }]}>
            {months[currentMonth]} {currentYear}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={[styles.menuItem]} onPress={handleWeekClick}>
          <Image
            source={require('../assets/icons/Vector2.png')}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Weeks</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={[styles.menuItem]} onPress={handleHolidaysClick}>
          <Image
            source={require('../assets/icons/Vector2.png')}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{t("holidays")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem]} onPress={handleFirstDayClick}>
          <Image
            source={require('../assets/icons/firstday.png')}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{t("first_day_of_week")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem]} onPress={handleCountryClick}>
          <Image source={require('../assets/icons/country.png')} style={styles.menuIconImage} />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
            {t("country")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem]} onPress={handlelanguageClick}>
          <Image source={require('../assets/icons/language.png')} style={styles.menuIconImage} />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
            {t("language")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem]} onPress={handleSettingsClick}>
          <Image
            source={require('../assets/icons/Icon1.png')}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{t("settings")}</Text>
        </TouchableOpacity>

      </ScrollView>
      <Image
        source={require("../assets/images/bottom-flower.png")}
        style={styles.bottomFixedImage}
      />
      <FirstDaySelector
        visible={showFirstDaySelector}
        onClose={() => setShowFirstDaySelector(false)}
        onSelect={handleFirstDaySelect}
      />
    </>
  );
}

function DrawerNavigator() {
  const { colors } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 280,
          backgroundColor: colors.background,
        },
        drawerType: 'front',
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Calendar',
          title: 'Calendar',
          // YEH IMPORTANT HAI - Custom header ko hamesha show karega
          header: () => <CustomHeader />,
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="year-view"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="week"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="holidays"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="language"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="theme-mode"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="diary"
        options={{
          headerShown: false,
        }}
      />
    </Drawer>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <DrawerNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    marginTop: 5
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateNumber: {
    fontSize: 26,
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 20,
    fontWeight: "700",
  },
  monthYearText: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    marginTop: 20,
    height: 1,
    backgroundColor: "#333",
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  yearText: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginTop: 4,
    textAlign: 'center',
    marginRight: 170,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  icon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#FF5252',
    borderTopWidth: 5,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 6,
  },
  dateIcon: {
    fontSize: 16,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerContent: {
    flex: 1,
  },
  bottomFixedImage: {
    position: "absolute",
    bottom: 5,
    right: -30,
    width: "100%",
    height: 180,
    resizeMode: "contain",
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 70,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 0,
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconImage: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 24,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  menuSubtext: {
    fontSize: 12,
    marginRight: 8,
  },
  // First Day Selector Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstDayModal: {
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  firstDayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 16,
  },
  firstDayButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  firstDayButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  firstDayButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});